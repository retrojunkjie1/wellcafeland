import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { readFileSync } from "node:fs";

const PROJECT_ID = "demo-wellnesscafe-rules";
const PLAN_A = "plan-owned-by-client-a";
const PLAN_B = "plan-owned-by-client-b";
let testEnv;

beforeAll(async () => {
  const rules = readFileSync("firestore.rules", "utf8");
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { host: "127.0.0.1", port: 8081, rules },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const firestore = context.firestore();
    await setDoc(doc(firestore, "carePlans", PLAN_A), {
      userId: "client-a",
      title: "Private plan A",
    });
    await setDoc(doc(firestore, "carePlans", PLAN_A, "items", "step-1"), {
      title: "Private support step A",
    });
    await setDoc(doc(firestore, "carePlans", PLAN_B), {
      userId: "client-b",
      title: "Private plan B",
    });
    await setDoc(doc(firestore, "carePlans", PLAN_B, "items", "step-1"), {
      title: "Private support step B",
    });
    await setDoc(doc(firestore, "users", "client-a"), {
      uid: "client-a",
      role: "client",
      isAdmin: false,
      displayName: "Client A",
    });
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

describe("clinical care-plan Firestore rules", () => {
  it("lets a client read their plan, its items, and the items list", async () => {
    const firestore = testEnv.authenticatedContext("client-a").firestore();

    await assertSucceeds(getDoc(doc(firestore, "carePlans", PLAN_A)));
    await assertSucceeds(getDoc(doc(firestore, "carePlans", PLAN_A, "items", "step-1")));
    await assertSucceeds(getDocs(collection(firestore, "carePlans", PLAN_A, "items")));
  });

  it("denies another signed-in client access to the plan and nested items", async () => {
    const firestore = testEnv.authenticatedContext("client-b").firestore();

    await assertFails(getDoc(doc(firestore, "carePlans", PLAN_A)));
    await assertFails(getDoc(doc(firestore, "carePlans", PLAN_A, "items", "step-1")));
    await assertFails(getDocs(collection(firestore, "carePlans", PLAN_A, "items")));
    await assertSucceeds(getDoc(doc(firestore, "carePlans", PLAN_B, "items", "step-1")));
  });

  it("denies signed-out reads and all client-side plan writes", async () => {
    const signedOutDb = testEnv.unauthenticatedContext().firestore();
    const ownerDb = testEnv.authenticatedContext("client-a").firestore();

    await assertFails(getDoc(doc(signedOutDb, "carePlans", PLAN_A, "items", "step-1")));
    await assertFails(setDoc(doc(ownerDb, "carePlans", PLAN_A, "items", "step-2"), { title: "Client write" }));
    await assertFails(setDoc(doc(ownerDb, "carePlans", "client-created-plan"), { userId: "client-a" }));
  });

  it("prevents users from granting themselves practitioner or admin roles", async () => {
    const ownerDb = testEnv.authenticatedContext("client-a").firestore();
    const newAccountDb = testEnv.authenticatedContext("new-client").firestore();

    await assertFails(updateDoc(doc(ownerDb, "users", "client-a"), { roles: ["provider"] }));
    await assertFails(updateDoc(doc(ownerDb, "users", "client-a"), { role: "provider" }));
    await assertFails(setDoc(doc(newAccountDb, "users", "new-client"), {
      uid: "new-client",
      role: "admin",
      roles: ["admin"],
      isAdmin: true,
    }));
  });

  it("allows the client-space choice but never a self-assigned practitioner space", async () => {
    const clientDb = testEnv.authenticatedContext("new-client").firestore();
    const applicantDb = testEnv.authenticatedContext("new-applicant").firestore();

    await assertSucceeds(setDoc(doc(clientDb, "users", "new-client"), {
      uid: "new-client",
      role: "client",
      roles: ["client"],
      workspaceIntent: "client",
      isAdmin: false,
    }));
    await assertSucceeds(setDoc(doc(applicantDb, "users", "new-applicant"), {
      uid: "new-applicant",
      role: "client",
      roles: [],
      workspaceIntent: "practitioner",
      isAdmin: false,
    }));
    await assertFails(setDoc(doc(testEnv.authenticatedContext("self-promoting").firestore(), "users", "self-promoting"), {
      uid: "self-promoting",
      role: "client",
      roles: ["provider"],
      workspaceIntent: "both",
      isAdmin: false,
    }));
  });

  it("allows a user with trusted provider claims to create their matching profile", async () => {
    const providerDb = testEnv.authenticatedContext("provider-user", {
      role: "provider",
      roles: ["provider"],
      provider: true,
    }).firestore();

    await assertSucceeds(setDoc(doc(providerDb, "users", "provider-user"), {
      uid: "provider-user",
      role: "provider",
      roles: ["provider"],
      isAdmin: false,
    }));
  });

  it("keeps private user subcollections owner-only without widening profile access", async () => {
    const ownerDb = testEnv.authenticatedContext("client-a").firestore();
    const anotherDb = testEnv.authenticatedContext("client-b").firestore();

    await assertSucceeds(setDoc(doc(ownerDb, "users", "client-a", "savedMessages", "message-1"), {
      text: "Private saved item",
    }));
    await assertFails(getDoc(doc(anotherDb, "users", "client-a", "savedMessages", "message-1")));
  });

  it("keeps support activity callable-only even for an authenticated account", async () => {
    const clientDb = testEnv.authenticatedContext("client-a").firestore();
    const adminDb = testEnv.authenticatedContext("admin-a", { admin: true }).firestore();
    const event = { uid: "client-a", feature: "home", eventCode: "page_opened" };

    await assertFails(getDoc(doc(clientDb, "support_activity_events", "client-event")));
    await assertFails(setDoc(doc(clientDb, "support_activity_events", "client-event"), event));
    await assertFails(getDoc(doc(adminDb, "support_activity_events", "client-event")));
    await assertFails(setDoc(doc(adminDb, "support_activity_events", "admin-forged-event"), event));
  });

  it("keeps abuse signals and their review audit callable-only", async () => {
    const clientDb = testEnv.authenticatedContext("client-a").firestore();
    const adminDb = testEnv.authenticatedContext("admin-a", { admin: true }).firestore();
    const signal = { uid: "client-a", signalCode: "ai_quota_blocks", status: "open" };
    const review = { uid: "client-a", outcome: "no_action", reviewedBy: "admin-a" };

    await assertFails(getDoc(doc(clientDb, "account_security_signals", "signal-1")));
    await assertFails(setDoc(doc(clientDb, "account_security_signals", "signal-1"), signal));
    await assertFails(getDoc(doc(adminDb, "account_security_signals", "signal-1")));
    await assertFails(setDoc(doc(adminDb, "account_security_signals", "signal-1"), signal));
    await assertFails(getDoc(doc(adminDb, "account_security_signal_reviews", "review-1")));
    await assertFails(setDoc(doc(adminDb, "account_security_signal_reviews", "review-1"), review));
  });

  it("does not let a legacy admin claim read member profiles or bypass callable scopes", async () => {
    const legacyAdminDb = testEnv.authenticatedContext("legacy-admin", { admin: true }).firestore();
    const godAdminDb = testEnv.authenticatedContext("god-admin", { godAdmin: true }).firestore();
    await assertFails(getDoc(doc(legacyAdminDb, "users", "client-a")));
    await assertFails(getDoc(doc(godAdminDb, "users", "client-a")));
    await assertFails(setDoc(doc(legacyAdminDb, "sessionTemplates", "template-1"), { title: "No scope" }));
  });

  it("allows only the assigned Firestore admin scope and keeps assignment records callable-only", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "admin_access_assignments", "scoped-admin"), {
        active: true,
        scopes: ["platform.operations.control"],
        expiresAt: null,
      });
    });
    const scopedDb = testEnv.authenticatedContext("scoped-admin").firestore();
    await assertSucceeds(setDoc(doc(scopedDb, "sessionTemplates", "template-allowed"), { title: "Scoped control" }));
    await assertFails(setDoc(doc(scopedDb, "resources", "resource-denied"), { title: "No directory scope" }));
    await assertFails(getDoc(doc(scopedDb, "admin_access_assignments", "scoped-admin")));
    await assertFails(getDoc(doc(scopedDb, "admin_access_audit", "event-1")));
  });
});
