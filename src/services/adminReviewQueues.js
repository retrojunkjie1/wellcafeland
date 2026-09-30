import { httpsCallable } from "firebase/functions";
import { auth, functions } from "@/firebase";

export async function loadAdminApplicationQueueCounts() {
  if (!auth.currentUser || auth.currentUser.isAnonymous) {
    throw new Error("Sign in with an administrator account to view review queues.");
  }
  const result = await httpsCallable(functions, "getAdminApplicationQueueCounts")();
  return result.data || {};
}
