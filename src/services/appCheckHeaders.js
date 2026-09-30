import { getAppCheckToken } from "@/firebase/appCheck";

/** Return a short-lived App Check header for protected HTTP Functions. */
export async function getAppCheckHeaders() {
  try {
    const token = await getAppCheckToken();
    return token ? { "X-Firebase-AppCheck": token } : {};
  } catch {
    // Local/emulator requests may not have App Check initialized. Production
    // endpoints reject the missing header, so this never grants access.
    return {};
  }
}
