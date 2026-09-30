import { httpsCallable } from "firebase/functions";
import { auth, functions } from "@/firebase";

let cachedSnapshot = null;
let cachedAt = 0;
let pendingRequest = null;
const CACHE_MS = 15_000;

export function invalidateAdminOperationalSnapshot() {
  cachedAt = 0;
}

export async function getAdminOperationalSnapshot({ force = false } = {}) {
  if (!auth.currentUser || auth.currentUser.isAnonymous) {
    throw new Error("Sign in with an administrator account to view system operations.");
  }
  if (!force && cachedSnapshot && Date.now() - cachedAt < CACHE_MS) return cachedSnapshot;
  if (pendingRequest) return pendingRequest;

  const callable = httpsCallable(functions, "getAdminOperationalSnapshot");
  pendingRequest = callable({})
    .then(({ data }) => {
      cachedSnapshot = data || null;
      cachedAt = Date.now();
      return cachedSnapshot;
    })
    .finally(() => { pendingRequest = null; });

  return pendingRequest;
}
