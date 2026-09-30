import { httpsCallable } from "firebase/functions";
import { auth, functions } from "@/firebase";

function assertAdminSession() {
  if (!auth.currentUser || auth.currentUser.isAnonymous) {
    throw new Error("Sign in with an administrator account to manage workspace access.");
  }
}

export async function findAdminWorkspaceAccount(email) {
  assertAdminSession();
  const result = await httpsCallable(functions, "findAdminWorkspaceAccount")({ email });
  return result.data || { found: false };
}

export async function grantPractitionerWorkspace(email, providerType) {
  assertAdminSession();
  const result = await httpsCallable(functions, "grantPractitionerWorkspace")({ email, providerType });
  return result.data || {};
}

export async function listAdminWorkspaceAccessEvents() {
  assertAdminSession();
  const result = await httpsCallable(functions, "listAdminWorkspaceAccessEvents")({});
  return result.data || { events: [] };
}
