import { httpsCallable } from "firebase/functions";
import { auth, functions } from "@/firebase";

async function callAdminAgentControl(name, payload = {}) {
  if (!auth.currentUser || auth.currentUser.isAnonymous) {
    throw new Error("Sign in with an administrator account to manage agent controls.");
  }
  const callable = httpsCallable(functions, name);
  const result = await callable(payload);
  return result.data || {};
}

export const getAdminAgentControls = () => callAdminAgentControl("getAdminAgentControls");
export const setAdminAgentControl = (agentId, enabled) =>
  callAdminAgentControl("setAdminAgentControl", { agentId, enabled });
