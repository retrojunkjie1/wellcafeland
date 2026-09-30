import { httpsCallable } from "firebase/functions";
import { auth, functions } from "@/firebase";
import { trackSupportAction } from "@/telemetry/telemetry";

async function call(name, data, signInMessage) {
  if (!auth?.currentUser || auth.currentUser.isAnonymous) {
    throw new Error(signInMessage);
  }
  if (!functions) throw new Error("Secure messaging is unavailable right now.");
  const response = await httpsCallable(functions, name)(data);
  return response.data || {};
}

export async function listProviderConversationMessages(clientId) {
  const result = await call("listProviderConversationMessages", { clientId }, "Sign in with your practitioner account to use secure messages.");
  return Array.isArray(result.messages) ? result.messages : [];
}

export async function sendProviderMessage(clientId, content) {
  try {
    const result = await call("sendProviderMessage", { clientId, content }, "Sign in with your practitioner account to use secure messages.");
    return result;
  } catch (error) {
    trackSupportAction("sessions", "message_send_failed", error?.code);
    throw error;
  }
}

export async function listMyPractitionerMessages(practitionerId) {
  const result = await call("listMyPractitionerMessages", { practitionerId }, "Sign in to open practitioner messages.");
  return Array.isArray(result.messages) ? result.messages : [];
}

export async function sendClientMessage(practitionerId, content) {
  try {
    const result = await call("sendClientMessage", { practitionerId, content }, "Sign in to send practitioner messages.");
    return result;
  } catch (error) {
    trackSupportAction("sessions", "message_send_failed", error?.code);
    throw error;
  }
}
