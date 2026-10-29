const { createHash, randomBytes } = require("node:crypto");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("./firebaseAdminCompat.cjs");
const { requireVerifiedAccount } = require("./accountAccess");
const aiBrain = require("../aiBrain");
const { consumeMessageRequestQuota } = require("../aiRateLimiter");
const { requireAdminScope } = require("./adminAuthorization");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const REGION = "us-central1";
const INVITE_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_MEMBERS = 12;
const MAX_MESSAGE_LENGTH = 1200;

function cleanText(value, limit) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

function validInviteToken(token) {
  return typeof token === "string" && /^[A-Za-z0-9_-]{40,60}$/.test(token);
}

function inviteIsUsable(data, circle) {
  const expiresAt = data.expiresAt?.toDate?.();
  return data.status === "active"
    && data.usedAt == null
    && expiresAt instanceof Date
    && expiresAt.getTime() > Date.now()
    && circle.activeInviteHash === data.tokenHash;
}

function validCircleId(circleId) {
  return typeof circleId === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(circleId);
}

async function requireMember(circleId, uid) {
  if (!validCircleId(circleId)) throw new HttpsError("invalid-argument", "Choose a valid friend group.");
  const circleRef = db.collection("private_friend_circles").doc(circleId);
  const [circle, member] = await Promise.all([
    circleRef.get(),
    circleRef.collection("private_members").doc(uid).get(),
  ]);
  if (!circle.exists || circle.get("status") === "closed") throw new HttpsError("not-found", "This friend group is no longer available.");
  if (!member.exists) throw new HttpsError("permission-denied", "You need to be a member of this group to view it.");
  return { circleRef, circle, memberRef: member.ref, member };
}

async function requireCircleOwner(circleId, uid) {
  if (typeof circleId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(circleId)) {
    throw new HttpsError("invalid-argument", "Choose a valid friend group.");
  }
  const circleRef = db.collection("private_friend_circles").doc(circleId);
  const circle = await circleRef.get();
  if (!circle.exists) throw new HttpsError("not-found", "This friend group is no longer available.");
  if (circle.get("ownerUid") !== uid) throw new HttpsError("permission-denied", "Only the group creator can manage its invitations.");
  return { circleRef, circle };
}

exports.createPrivateFriendCircle = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireVerifiedAccount(request, "create a private friend group");
  const name = cleanText(request.data?.name, 60);
  const description = cleanText(request.data?.description, 240);
  if (name.length < 2) throw new HttpsError("invalid-argument", "Give your group a name of at least two characters.");

  const circleRef = db.collection("private_friend_circles").doc();
  const memberRef = circleRef.collection("private_members").doc(uid);
  const auditRef = db.collection("private_friend_circle_audit").doc();
  await db.runTransaction(async (transaction) => {
    transaction.create(circleRef, {
      name,
      description,
      ownerUid: uid,
      memberCount: 1,
      activeInviteHash: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    transaction.create(memberRef, {
      uid,
      role: "owner",
      displayName: cleanText(request.auth?.token?.name, 60),
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    transaction.create(auditRef, {
      circleId: circleRef.id,
      actorUid: uid,
      action: "group_created",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  return { ok: true, circleId: circleRef.id };
});

exports.listMyPrivateFriendCircles = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireVerifiedAccount(request, "view your private friend groups");
  const memberships = await db.collectionGroup("private_members").where("uid", "==", uid).limit(50).get();
  const circles = await Promise.all(memberships.docs.map(async (membership) => {
    const circleDoc = await membership.ref.parent.parent.get();
    if (!circleDoc.exists) return null;
    const data = circleDoc.data();
    const blocks = await circleDoc.ref.collection("private_blocks").where("blockerUid", "==", uid).get();
    const blockedMembers = await Promise.all(blocks.docs.map(async (block) => {
      const blockedMember = await circleDoc.ref.collection("private_members").doc(block.get("blockedUid")).get();
      return blockedMember.exists ? { uid: blockedMember.id, displayName: cleanText(blockedMember.get("displayName"), 60) || "Friend" } : null;
    }));
    return {
      id: circleDoc.id,
      name: data.name,
      description: data.description || "",
      memberCount: Number.isInteger(data.memberCount) ? data.memberCount : 1,
      role: membership.get("role") || "member",
      blockedMembers: blockedMembers.filter(Boolean),
      ...(membership.get("role") === "owner" ? { members: (await circleDoc.ref.collection("private_members").get()).docs.map((member) => ({
          uid: member.id,
          displayName: cleanText(member.get("displayName"), 60) || (member.get("role") === "owner" ? "Organizer" : "Friend"),
          role: member.get("role") || "member",
        })) } : {}),
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
    };
  }));
  return { circles: circles.filter(Boolean).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")) };
});

exports.createPrivateFriendCircleInvite = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireVerifiedAccount(request, "invite a friend");
  const { circleRef } = await requireCircleOwner(request.data?.circleId, uid);
  const token = randomBytes(32).toString("base64url");
  const hash = tokenHash(token);
  const inviteRef = db.collection("private_friend_circle_invites").doc(hash);
  const auditRef = db.collection("private_friend_circle_audit").doc();
  const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + INVITE_LIFETIME_MS);

  await db.runTransaction(async (transaction) => {
    const circle = await transaction.get(circleRef);
    if (!circle.exists || circle.get("ownerUid") !== uid) throw new HttpsError("permission-denied", "You can no longer manage this group.");
    const previousHash = circle.get("activeInviteHash");
    const previousInviteRef = previousHash ? db.collection("private_friend_circle_invites").doc(previousHash) : null;
    const previousInvite = previousInviteRef ? await transaction.get(previousInviteRef) : null;
    if (previousInvite?.exists && previousInvite.get("status") === "active") {
      transaction.update(previousInviteRef, { status: "replaced", replacedAt: admin.firestore.FieldValue.serverTimestamp() });
    }
    transaction.create(inviteRef, {
      circleId: circleRef.id,
      tokenHash: hash,
      createdByUid: uid,
      status: "active",
      usedAt: null,
      expiresAt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    transaction.update(circleRef, {
      activeInviteHash: hash,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    transaction.create(auditRef, {
      circleId: circleRef.id,
      actorUid: uid,
      action: "invite_created",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  return { ok: true, token, expiresAt: expiresAt.toDate().toISOString(), singleUse: true };
});

exports.previewPrivateFriendCircleInvite = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  // The invite itself is a short-lived bearer secret. A friend must be able to
  // preview it before signing in; accepting it still requires a verified user.
  const uid = request.auth?.uid && request.auth?.token?.firebase?.sign_in_provider !== "anonymous"
    ? request.auth.uid
    : null;
  const token = request.data?.token;
  if (!validInviteToken(token)) throw new HttpsError("invalid-argument", "This invitation link is not valid.");
  const hash = tokenHash(token);
  const invite = await db.collection("private_friend_circle_invites").doc(hash).get();
  if (!invite.exists) throw new HttpsError("not-found", "This invitation link is no longer available.");
  const data = invite.data();
  const circleDoc = await db.collection("private_friend_circles").doc(data.circleId).get();
  if (!circleDoc.exists || !inviteIsUsable(data, circleDoc.data())) {
    throw new HttpsError("failed-precondition", "This invite has expired, was used, or was replaced by a newer link.");
  }
  if (uid && circleDoc.get("ownerUid") === uid) return { alreadyMember: true, circle: { id: circleDoc.id, name: circleDoc.get("name"), memberCount: circleDoc.get("memberCount") || 1 } };
  if (!uid) return {
    alreadyMember: false,
    circle: {
      id: circleDoc.id,
      name: circleDoc.get("name"),
      description: circleDoc.get("description") || "",
      memberCount: Number.isInteger(circleDoc.get("memberCount")) ? circleDoc.get("memberCount") : 1,
    },
  };
  const membership = await circleDoc.ref.collection("private_members").doc(uid).get();
  return {
    alreadyMember: membership.exists,
    circle: {
      id: circleDoc.id,
      name: circleDoc.get("name"),
      description: circleDoc.get("description") || "",
      memberCount: Number.isInteger(circleDoc.get("memberCount")) ? circleDoc.get("memberCount") : 1,
    },
  };
});

exports.acceptPrivateFriendCircleInvite = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireVerifiedAccount(request, "join a private friend group");
  const token = request.data?.token;
  if (!validInviteToken(token)) throw new HttpsError("invalid-argument", "This invitation link is not valid.");
  const hash = tokenHash(token);
  const inviteRef = db.collection("private_friend_circle_invites").doc(hash);
  const invite = await inviteRef.get();
  if (!invite.exists) throw new HttpsError("not-found", "This invitation link is no longer available.");
  const circleId = invite.get("circleId");
  const circleRef = db.collection("private_friend_circles").doc(circleId);
  const memberRef = circleRef.collection("private_members").doc(uid);
  const auditRef = db.collection("private_friend_circle_audit").doc();
  const result = await db.runTransaction(async (transaction) => {
    const freshInvite = await transaction.get(inviteRef);
    const circle = await transaction.get(circleRef);
    const membership = await transaction.get(memberRef);
    if (!freshInvite.exists || !circle.exists || !inviteIsUsable(freshInvite.data(), circle.data())) {
      throw new HttpsError("failed-precondition", "This invite has expired, was used, or was replaced by a newer link.");
    }
    if (membership.exists) return { alreadyMember: true };
    if (freshInvite.get("createdByUid") === uid) throw new HttpsError("failed-precondition", "You already created this friend group.");
    if ((circle.get("memberCount") || 1) >= MAX_MEMBERS) throw new HttpsError("resource-exhausted", "This friend group has reached its 12-person limit.");

    transaction.create(memberRef, {
      uid,
      role: "member",
      displayName: cleanText(request.auth?.token?.name, 60),
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    transaction.update(circleRef, {
      memberCount: admin.firestore.FieldValue.increment(1),
      activeInviteHash: null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    transaction.update(inviteRef, { status: "used", usedAt: admin.firestore.FieldValue.serverTimestamp() });
    transaction.create(auditRef, {
      circleId,
      actorUid: uid,
      action: "invite_accepted",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { alreadyMember: false };
  });
  return { ok: true, circleId, alreadyMember: result.alreadyMember };
});

exports.revokePrivateFriendCircleInvite = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireVerifiedAccount(request, "manage a friend group invitation");
  const { circleRef } = await requireCircleOwner(request.data?.circleId, uid);
  let revoked = false;
  const auditRef = db.collection("private_friend_circle_audit").doc();
  await db.runTransaction(async (transaction) => {
    const circle = await transaction.get(circleRef);
    const hash = circle.get("activeInviteHash");
    if (!hash) return;
    const inviteRef = db.collection("private_friend_circle_invites").doc(hash);
    const invite = await transaction.get(inviteRef);
    if (invite.exists && invite.get("status") === "active") {
      transaction.update(inviteRef, { status: "revoked", revokedAt: admin.firestore.FieldValue.serverTimestamp() });
      revoked = true;
      transaction.create(auditRef, {
        circleId: circleRef.id,
        actorUid: uid,
        action: "invite_revoked",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    transaction.update(circleRef, { activeInviteHash: null, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  });
  return { ok: true, revoked };
});

exports.listPrivateFriendCircleMessages = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireVerifiedAccount(request, "view group messages");
  const { circleRef } = await requireMember(request.data?.circleId, uid);
  const snapshot = await circleRef.collection("messages").orderBy("createdAt", "desc").limit(50).get();
  const blocks = await circleRef.collection("private_blocks").get();
  const hiddenUids = new Set(blocks.docs.flatMap((block) => {
    if (block.get("blockerUid") === uid) return [block.get("blockedUid")];
    if (block.get("blockedUid") === uid) return [block.get("blockerUid")];
    return [];
  }));
  return {
    messages: snapshot.docs.filter((message) => !hiddenUids.has(message.get("authorUid"))).reverse().map((message) => ({
      id: message.id,
      authorUid: message.get("authorUid"),
      authorName: message.get("authorName") || "Friend",
      text: message.get("text") || "",
      createdAt: message.get("createdAt")?.toDate?.()?.toISOString?.() || null,
    })),
  };
});

exports.blockPrivateFriendCircleMember = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireVerifiedAccount(request, "block a friend group member");
  const circleId = request.data?.circleId;
  const targetUid = typeof request.data?.memberUid === "string" ? request.data.memberUid : "";
  if (!validCircleId(circleId) || !targetUid || targetUid.length > 128 || targetUid === uid) throw new HttpsError("invalid-argument", "Choose another group member to block.");
  const circleRef = db.collection("private_friend_circles").doc(circleId);
  const actorRef = circleRef.collection("private_members").doc(uid);
  const targetRef = circleRef.collection("private_members").doc(targetUid);
  const blockRef = circleRef.collection("private_blocks").doc(`${uid}_${targetUid}`);
  await db.runTransaction(async (transaction) => {
    const [circle, actor, target] = await Promise.all([transaction.get(circleRef), transaction.get(actorRef), transaction.get(targetRef)]);
    if (!circle.exists || !actor.exists || !target.exists) throw new HttpsError("permission-denied", "Both people must currently belong to this group.");
    transaction.set(blockRef, { blockerUid: uid, blockedUid: targetUid, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  });
  return { ok: true };
});

exports.unblockPrivateFriendCircleMember = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireVerifiedAccount(request, "unblock a friend group member");
  const circleId = request.data?.circleId;
  const targetUid = typeof request.data?.memberUid === "string" ? request.data.memberUid : "";
  if (!validCircleId(circleId) || !targetUid || targetUid.length > 128 || targetUid === uid) throw new HttpsError("invalid-argument", "Choose a valid group member to unblock.");
  const circleRef = db.collection("private_friend_circles").doc(circleId);
  const actorRef = circleRef.collection("private_members").doc(uid);
  const blockRef = circleRef.collection("private_blocks").doc(`${uid}_${targetUid}`);
  await db.runTransaction(async (transaction) => {
    const [circle, actor, block] = await Promise.all([transaction.get(circleRef), transaction.get(actorRef), transaction.get(blockRef)]);
    if (!circle.exists || !actor.exists) throw new HttpsError("permission-denied", "You need to belong to this group to manage its block list.");
    if (block.exists) transaction.delete(blockRef);
  });
  return { ok: true };
});

exports.reportPrivateFriendCircleMessage = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireVerifiedAccount(request, "report a group message");
  const circleId = request.data?.circleId;
  const messageId = request.data?.messageId;
  const reason = cleanText(request.data?.reason, 40);
  const details = cleanText(request.data?.details, 280);
  if (!validCircleId(circleId) || typeof messageId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(messageId)) throw new HttpsError("invalid-argument", "Choose a valid message to report.");
  if (!["harassment", "unsafe_content", "spam", "other"].includes(reason)) throw new HttpsError("invalid-argument", "Choose a reason for the report.");
  const circleRef = db.collection("private_friend_circles").doc(circleId);
  const reporterRef = circleRef.collection("private_members").doc(uid);
  const messageRef = circleRef.collection("messages").doc(messageId);
  const reportId = createHash("sha256").update(`${circleId}:${messageId}:${uid}`).digest("hex");
  const reportRef = db.collection("private_friend_circle_reports").doc(reportId);
  const rateRef = db.collection("private_friend_circle_report_limits").doc(uid);
  await db.runTransaction(async (transaction) => {
    const [circle, reporter, message, existing, rate] = await Promise.all([transaction.get(circleRef), transaction.get(reporterRef), transaction.get(messageRef), transaction.get(reportRef), transaction.get(rateRef)]);
    if (!circle.exists || !reporter.exists || !message.exists) throw new HttpsError("permission-denied", "Only current group members can report a message that is still available.");
    if (message.get("authorUid") === uid) throw new HttpsError("failed-precondition", "You cannot report your own message.");
    if (existing.exists) throw new HttpsError("already-exists", "You already reported this message. The report is in the admin review queue.");
    const now = Date.now();
    const startedAt = rate.get("windowStartedAt")?.toMillis?.() || 0;
    const count = now - startedAt < 60 * 60 * 1000 ? Number(rate.get("count") || 0) : 0;
    if (count >= 5) throw new HttpsError("resource-exhausted", "You’ve sent several reports recently. Please wait before sending another.");
    transaction.set(rateRef, { windowStartedAt: admin.firestore.Timestamp.fromMillis(count ? startedAt : now), count: count + 1 });
    transaction.create(reportRef, {
      circleId,
      messageId,
      reportedUid: message.get("authorUid"),
      reporterUid: uid,
      reason,
      details,
      status: "open",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  return { ok: true };
});

exports.listOpenPrivateFriendCircleReports = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  await requireAdminScope(request, "platform.operations.view");
  const snapshot = await db.collection("private_friend_circle_reports").orderBy("createdAt", "desc").limit(100).get();
  return { reports: snapshot.docs.filter((doc) => doc.get("status") === "open").map((doc) => ({ id: doc.id, circleId: doc.get("circleId"), messageId: doc.get("messageId"), reportedUid: doc.get("reportedUid"), reporterUid: doc.get("reporterUid"), reason: doc.get("reason"), details: doc.get("details") || "", createdAt: doc.get("createdAt")?.toDate?.()?.toISOString?.() || null })) };
});

exports.reviewPrivateFriendCircleReport = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const { uid } = await requireAdminScope(request, "platform.operations.control");
  const reportId = request.data?.reportId;
  const action = request.data?.action;
  const note = cleanText(request.data?.reviewNote, 500);
  if (typeof reportId !== "string" || !/^[0-9a-f]{64}$/.test(reportId) || !["resolve", "dismiss"].includes(action) || note.length < 15) throw new HttpsError("invalid-argument", "Choose a report, a review decision, and a short note.");
  const reportRef = db.collection("private_friend_circle_reports").doc(reportId);
  const auditRef = db.collection("private_friend_circle_audit").doc();
  await db.runTransaction(async (transaction) => {
    const report = await transaction.get(reportRef);
    if (!report.exists) throw new HttpsError("not-found", "That report is no longer available.");
    if (report.get("status") !== "open") throw new HttpsError("failed-precondition", "That report was already reviewed.");
    transaction.update(reportRef, { status: action === "resolve" ? "resolved" : "dismissed", reviewNote: note, reviewedBy: uid, reviewedAt: admin.firestore.FieldValue.serverTimestamp() });
    transaction.create(auditRef, { circleId: report.get("circleId"), actorUid: uid, action: `message_report_${action}`, createdAt: admin.firestore.FieldValue.serverTimestamp() });
  });
  return { ok: true };
});

exports.deletePrivateFriendCircleMessage = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireVerifiedAccount(request, "delete your group message");
  const circleId = request.data?.circleId;
  const messageId = request.data?.messageId;
  if (!validCircleId(circleId) || typeof messageId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(messageId)) {
    throw new HttpsError("invalid-argument", "Choose a valid message to delete.");
  }
  const circleRef = db.collection("private_friend_circles").doc(circleId);
  const memberRef = circleRef.collection("private_members").doc(uid);
  const messageRef = circleRef.collection("messages").doc(messageId);
  const auditRef = db.collection("private_friend_circle_audit").doc();
  await db.runTransaction(async (transaction) => {
    const [circle, member, message] = await Promise.all([transaction.get(circleRef), transaction.get(memberRef), transaction.get(messageRef)]);
    if (!circle.exists || !member.exists) throw new HttpsError("permission-denied", "You are no longer a member of this group.");
    if (!message.exists || message.get("authorUid") !== uid) throw new HttpsError("permission-denied", "You can delete only your own messages.");
    transaction.delete(messageRef);
    transaction.create(auditRef, { circleId, actorUid: uid, action: "own_message_deleted", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  });
  return { ok: true };
});

exports.postPrivateFriendCircleMessage = onCall({ region: REGION, enforceAppCheck: true, secrets: ["OPENAI_API_KEY"] }, async (request) => {
  const uid = requireVerifiedAccount(request, "post in a private friend group");
  const circleId = request.data?.circleId;
  const text = typeof request.data?.text === "string" ? request.data.text.trim() : "";
  if (!text || text.length > MAX_MESSAGE_LENGTH) throw new HttpsError("invalid-argument", `Write a message of 1 to ${MAX_MESSAGE_LENGTH} characters.`);
  await requireMember(circleId, uid);
  const quota = await consumeMessageRequestQuota({ db, uid });
  if (!quota.allowed) throw new HttpsError("resource-exhausted", `Please wait ${quota.retryAfterSeconds} seconds before posting again.`);

  let decision;
  try {
    decision = await aiBrain.reviewCommunityContent({ content: text, uid });
  } catch (error) {
    if (error?.code === "RATE_LIMITED") throw new HttpsError("resource-exhausted", error.message);
    if (error?.code === "INVALID_CHERUBIM_CONTENT") throw new HttpsError("invalid-argument", error.message);
    console.error("[friendCircles] Safety review unavailable", { uid, code: error?.code || "UNKNOWN" });
    throw new HttpsError("unavailable", "The message safety check is unavailable. Nothing was posted; please try again shortly.");
  }
  if (!decision.safe) throw new HttpsError("failed-precondition", decision.suggestion || "Please revise this message before sharing it.");

  const circleRef = db.collection("private_friend_circles").doc(circleId);
  const memberRef = circleRef.collection("private_members").doc(uid);
  const messageRef = circleRef.collection("messages").doc();
  await db.runTransaction(async (transaction) => {
    const [circle, member] = await Promise.all([transaction.get(circleRef), transaction.get(memberRef)]);
    if (!circle.exists || circle.get("status") === "closed" || !member.exists) throw new HttpsError("permission-denied", "You are no longer a member of this group.");
    transaction.create(messageRef, {
      authorUid: uid,
      authorName: cleanText(request.auth?.token?.name, 60) || "Friend",
      text,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    transaction.update(circleRef, { updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  });
  return { ok: true, messageId: messageRef.id };
});

exports.removePrivateFriendCircleMember = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireVerifiedAccount(request, "manage group members");
  const circleId = request.data?.circleId;
  const targetUid = typeof request.data?.memberUid === "string" ? request.data.memberUid : "";
  if (!validCircleId(circleId) || !targetUid || targetUid.length > 128 || targetUid === uid) throw new HttpsError("invalid-argument", "Choose a group member to remove.");
  const circleRef = db.collection("private_friend_circles").doc(circleId);
  const ownerRef = circleRef.collection("private_members").doc(uid);
  const targetRef = circleRef.collection("private_members").doc(targetUid);
  const auditRef = db.collection("private_friend_circle_audit").doc();
  await db.runTransaction(async (transaction) => {
    const [circle, owner, target] = await Promise.all([transaction.get(circleRef), transaction.get(ownerRef), transaction.get(targetRef)]);
    if (!circle.exists || !owner.exists || circle.get("ownerUid") !== uid || owner.get("role") !== "owner") throw new HttpsError("permission-denied", "Only the group organizer can remove a member.");
    if (!target.exists || target.get("role") === "owner") throw new HttpsError("not-found", "That member is no longer in this group.");
    transaction.delete(targetRef);
    transaction.update(circleRef, { memberCount: admin.firestore.FieldValue.increment(-1), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    transaction.create(auditRef, { circleId, actorUid: uid, action: "member_removed", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  });
  return { ok: true };
});

exports.leavePrivateFriendCircle = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireVerifiedAccount(request, "leave a private friend group");
  const circleId = request.data?.circleId;
  if (!validCircleId(circleId)) throw new HttpsError("invalid-argument", "Choose a valid friend group.");
  const circleRef = db.collection("private_friend_circles").doc(circleId);
  const memberRef = circleRef.collection("private_members").doc(uid);
  const auditRef = db.collection("private_friend_circle_audit").doc();
  await db.runTransaction(async (transaction) => {
    const [circle, member] = await Promise.all([transaction.get(circleRef), transaction.get(memberRef)]);
    if (!circle.exists || !member.exists) throw new HttpsError("not-found", "You are no longer in this group.");
    if (member.get("role") === "owner") throw new HttpsError("failed-precondition", "Transfer organizer status before leaving this group.");
    transaction.delete(memberRef);
    transaction.update(circleRef, { memberCount: admin.firestore.FieldValue.increment(-1), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    transaction.create(auditRef, { circleId, actorUid: uid, action: "member_left", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  });
  return { ok: true };
});

exports.transferPrivateFriendCircleOwnership = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireVerifiedAccount(request, "transfer group organizer status");
  const circleId = request.data?.circleId;
  const targetUid = typeof request.data?.memberUid === "string" ? request.data.memberUid : "";
  if (!validCircleId(circleId) || !targetUid || targetUid === uid || targetUid.length > 128) throw new HttpsError("invalid-argument", "Choose another group member as organizer.");
  const circleRef = db.collection("private_friend_circles").doc(circleId);
  const ownerRef = circleRef.collection("private_members").doc(uid);
  const targetRef = circleRef.collection("private_members").doc(targetUid);
  const auditRef = db.collection("private_friend_circle_audit").doc();
  await db.runTransaction(async (transaction) => {
    const [circle, owner, target] = await Promise.all([transaction.get(circleRef), transaction.get(ownerRef), transaction.get(targetRef)]);
    if (!circle.exists || !owner.exists || circle.get("ownerUid") !== uid || owner.get("role") !== "owner") throw new HttpsError("permission-denied", "Only the current organizer can transfer this group.");
    if (!target.exists) throw new HttpsError("not-found", "That member is no longer in this group.");
    transaction.update(circleRef, { ownerUid: targetUid, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    transaction.update(ownerRef, { role: "member" });
    transaction.update(targetRef, { role: "owner" });
    transaction.create(auditRef, { circleId, actorUid: uid, action: "organizer_transferred", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  });
  return { ok: true };
});

exports.closePrivateFriendCircle = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = requireVerifiedAccount(request, "close a private friend group");
  const circleId = request.data?.circleId;
  if (!validCircleId(circleId)) throw new HttpsError("invalid-argument", "Choose a valid friend group.");
  const circleRef = db.collection("private_friend_circles").doc(circleId);
  const memberRef = circleRef.collection("private_members").doc(uid);
  const auditRef = db.collection("private_friend_circle_audit").doc();
  await db.runTransaction(async (transaction) => {
    const [circle, owner] = await Promise.all([transaction.get(circleRef), transaction.get(memberRef)]);
    if (!circle.exists || !owner.exists || circle.get("ownerUid") !== uid || owner.get("role") !== "owner") throw new HttpsError("permission-denied", "Only the organizer can close this group.");
    if ((circle.get("memberCount") || 1) !== 1) throw new HttpsError("failed-precondition", "Remove or transfer the other members before closing this group.");
    const activeInviteHash = circle.get("activeInviteHash");
    if (activeInviteHash) {
      const inviteRef = db.collection("private_friend_circle_invites").doc(activeInviteHash);
      const invite = await transaction.get(inviteRef);
      if (invite.exists && invite.get("status") === "active") transaction.update(inviteRef, { status: "revoked", revokedAt: admin.firestore.FieldValue.serverTimestamp() });
    }
    transaction.delete(memberRef);
    transaction.delete(circleRef);
    transaction.create(auditRef, { circleId, actorUid: uid, action: "group_closed", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  });
  await db.recursiveDelete(circleRef);
  return { ok: true };
});
