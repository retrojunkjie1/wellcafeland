import { httpsCallable } from "firebase/functions";
import { auth, functions } from "@/firebase";

async function callAdminSettings(name, payload = {}) {
  if (!auth.currentUser || auth.currentUser.isAnonymous) {
    throw new Error("Sign in with an administrator account to manage system settings.");
  }
  const result = await httpsCallable(functions, name)(payload);
  return result.data || {};
}

export async function loadAdminSystemSettings() {
  return callAdminSettings("getAdminSystemSettings");
}

export async function saveAdminSystemSettings(settings) {
  return callAdminSettings("setAdminSystemSettings", { settings });
}
