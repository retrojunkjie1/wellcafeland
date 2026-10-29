const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.GCLOUD_PROJECT = "demo-wellnesscafe-private-friend-groups";
process.env.FIREBASE_CONFIG = JSON.stringify({ projectId: process.env.GCLOUD_PROJECT });

const admin = require("firebase-admin");
if (!admin.apps.length) admin.initializeApp({ projectId: process.env.GCLOUD_PROJECT });
const db = admin.firestore();
const handlers = require("../src/friendCircles");
const aiBrain = require("../aiBrain");
const oldModeration = aiBrain.reviewCommunityContent;
const createdCircleIds = new Set();

const verified = (uid, name = uid) => ({
  auth: { uid, token: { email_verified: true, firebase: { sign_in_provider: "password" }, name } },
});

async function cleanCircle(circleId) {
  const circleRef = db.collection("private_friend_circles").doc(circleId);
  for (const name of ["private_members", "messages", "private_blocks"]) {
    const docs = await circleRef.collection(name).get();
    if (!docs.empty) {
      const batch = db.batch();
      docs.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }
  }
  const inviteDocs = await db.collection("private_friend_circle_invites").where("circleId", "==", circleId).get();
  if (!inviteDocs.empty) {
    const batch = db.batch();
    inviteDocs.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
  const auditDocs = await db.collection("private_friend_circle_audit").where("circleId", "==", circleId).get();
  if (!auditDocs.empty) {
    const batch = db.batch();
    auditDocs.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
  const reportDocs = await db.collection("private_friend_circle_reports").where("circleId", "==", circleId).get();
  if (!reportDocs.empty) {
    const batch = db.batch();
    reportDocs.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
  await circleRef.delete();
}

before(async () => {
  assert.ok(process.env.FIRESTORE_EMULATOR_HOST, "Run this suite through the Firestore emulator");
  aiBrain.reviewCommunityContent = async () => ({ safe: true });
});

after(async () => {
  aiBrain.reviewCommunityContent = oldModeration;
  await Promise.all([...createdCircleIds].map(cleanCircle));
  await admin.app().delete();
});

test("private group lifecycle enforces verification, invitation consent, membership, and message access", async () => {
  await assert.rejects(handlers.createPrivateFriendCircle.run({ data: { name: "Friends" } }), (error) => error.code === "unauthenticated");
  await assert.rejects(handlers.createPrivateFriendCircle.run({ ...verified("unverified"), auth: { ...verified("unverified").auth, token: { email_verified: false } }, data: { name: "Friends" } }), (error) => error.code === "failed-precondition");

  const created = await handlers.createPrivateFriendCircle.run({ ...verified("group-owner", "Organizer"), data: { name: "Steady Steps", description: "A small circle of support" } });
  createdCircleIds.add(created.circleId);
  const circleRef = db.collection("private_friend_circles").doc(created.circleId);
  const firstInvite = await handlers.createPrivateFriendCircleInvite.run({ ...verified("group-owner"), data: { circleId: created.circleId } });
  const preview = await handlers.previewPrivateFriendCircleInvite.run({ data: { token: firstInvite.token } });
  assert.equal(preview.circle.name, "Steady Steps");
  assert.equal(preview.alreadyMember, false);
  await assert.rejects(handlers.acceptPrivateFriendCircleInvite.run({ auth: { uid: "invitee", token: { email_verified: false } }, data: { token: firstInvite.token } }), (error) => error.code === "failed-precondition");

  const secondInvite = await handlers.createPrivateFriendCircleInvite.run({ ...verified("group-owner"), data: { circleId: created.circleId } });
  await assert.rejects(handlers.previewPrivateFriendCircleInvite.run({ data: { token: firstInvite.token } }), (error) => error.code === "failed-precondition");

  const joins = await Promise.allSettled([
    handlers.acceptPrivateFriendCircleInvite.run({ ...verified("invitee-a", "Avery"), data: { token: secondInvite.token } }),
    handlers.acceptPrivateFriendCircleInvite.run({ ...verified("invitee-b", "Blair"), data: { token: secondInvite.token } }),
  ]);
  assert.equal(joins.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(joins.filter((result) => result.status === "rejected").length, 1);
  assert.equal((await circleRef.get()).get("memberCount"), 2);

  const members = await handlers.listMyPrivateFriendCircles.run(verified("group-owner"));
  assert.equal(members.circles.length, 1);
  assert.equal(members.circles[0].members.length, 2);
  const joinedUid = joins[0].status === "fulfilled" ? "invitee-a" : "invitee-b";
  const posted = await handlers.postPrivateFriendCircleMessage.run({ ...verified(joinedUid, "New Friend"), data: { circleId: created.circleId, text: "Glad we can check in together." } });
  const listed = await handlers.listPrivateFriendCircleMessages.run({ ...verified("group-owner"), data: { circleId: created.circleId } });
  assert.equal(listed.messages.length, 1);
  assert.equal(listed.messages[0].id, posted.messageId);
  assert.equal(listed.messages[0].text, "Glad we can check in together.");
  await assert.rejects(handlers.listPrivateFriendCircleMessages.run({ ...verified("outside-user"), data: { circleId: created.circleId } }), (error) => error.code === "permission-denied");
  await assert.rejects(handlers.deletePrivateFriendCircleMessage.run({ ...verified("group-owner"), data: { circleId: created.circleId, messageId: posted.messageId } }), (error) => error.code === "permission-denied");
  await handlers.reportPrivateFriendCircleMessage.run({ ...verified("group-owner"), data: { circleId: created.circleId, messageId: posted.messageId, reason: "other", details: "Please review this message." } });
  await assert.rejects(handlers.reportPrivateFriendCircleMessage.run({ ...verified("group-owner"), data: { circleId: created.circleId, messageId: posted.messageId, reason: "other" } }), (error) => error.code === "already-exists");
  await handlers.blockPrivateFriendCircleMember.run({ ...verified("group-owner"), data: { circleId: created.circleId, memberUid: joinedUid } });
  assert.equal((await handlers.listMyPrivateFriendCircles.run(verified("group-owner"))).circles[0].blockedMembers[0].uid, joinedUid);
  const hiddenForBlockedMember = await handlers.listPrivateFriendCircleMessages.run({ ...verified("group-owner"), data: { circleId: created.circleId } });
  assert.equal(hiddenForBlockedMember.messages.length, 0, "messages are hidden when either member has blocked the other");
  await handlers.unblockPrivateFriendCircleMember.run({ ...verified("group-owner"), data: { circleId: created.circleId, memberUid: joinedUid } });
  assert.equal((await handlers.listPrivateFriendCircleMessages.run({ ...verified("group-owner"), data: { circleId: created.circleId } })).messages.length, 1);
  await handlers.deletePrivateFriendCircleMessage.run({ ...verified(joinedUid), data: { circleId: created.circleId, messageId: posted.messageId } });
  assert.equal((await circleRef.collection("messages").doc(posted.messageId).get()).exists, false);

  await db.collection("admin_access_assignments").doc("group-reviewer").set({ active: true, scopes: ["platform.operations.view", "platform.operations.control"], expiresAt: null });
  const adminRequest = { ...verified("group-reviewer"), data: {} };
  assert.equal((await handlers.listOpenPrivateFriendCircleReports.run(adminRequest)).reports.length, 1);
  await handlers.reviewPrivateFriendCircleReport.run({ ...adminRequest, data: { reportId: (await db.collection("private_friend_circle_reports").where("circleId", "==", created.circleId).get()).docs[0].id, action: "resolve", reviewNote: "Reviewed with the group safety policy." } });
  assert.equal((await handlers.listOpenPrivateFriendCircleReports.run(adminRequest)).reports.length, 0);

  await handlers.removePrivateFriendCircleMember.run({ ...verified("group-owner"), data: { circleId: created.circleId, memberUid: joinedUid } });
  await assert.rejects(handlers.listPrivateFriendCircleMessages.run({ ...verified(joinedUid), data: { circleId: created.circleId } }), (error) => error.code === "permission-denied");
  const replacement = await handlers.createPrivateFriendCircleInvite.run({ ...verified("group-owner"), data: { circleId: created.circleId } });
  await handlers.acceptPrivateFriendCircleInvite.run({ ...verified("invitee-c", "Casey"), data: { token: replacement.token } });
  await handlers.transferPrivateFriendCircleOwnership.run({ ...verified("group-owner"), data: { circleId: created.circleId, memberUid: "invitee-c" } });
  await handlers.leavePrivateFriendCircle.run({ ...verified("group-owner"), data: { circleId: created.circleId } });
  const remaining = await handlers.listMyPrivateFriendCircles.run(verified("group-owner"));
  assert.equal(remaining.circles.length, 0);
  assert.equal((await circleRef.get()).get("ownerUid"), "invitee-c");
  await handlers.closePrivateFriendCircle.run({ ...verified("invitee-c"), data: { circleId: created.circleId } });
  assert.equal((await circleRef.get()).exists, false);
});
