import { httpsCallable } from "firebase/functions";
import { auth, functions } from "@/firebase";
import { logTelemetry, trackSupportAction } from "@/telemetry/telemetry";

async function call(name, data = {}, { allowAnonymous = false, allowSignedOut = false } = {}) {
  if (!auth.currentUser && !allowSignedOut) throw new Error("Sign in or continue as a guest to continue.");
  if (auth.currentUser?.isAnonymous && !allowAnonymous) throw new Error("You’re using a guest account. Sign in with a personal account to continue.");
  const callable = httpsCallable(functions, name);
  try {
    const result = await callable(data);
    logTelemetry("function_call", { success: true });
    return result.data || {};
  } catch (error) {
    logTelemetry("function_call", { level: "error", errorCode: error?.code });
    throw error;
  }
}

export const submitPractitionerApplication = (profile) => call("submitPractitionerApplication", profile);
export const getMyPractitionerApplication = () => call("getMyPractitionerApplication");
export const listPractitionersForReview = () => call("listPractitionersForReview");
export const reviewPractitionerApplication = (uid, decision, reviewNote = "", confirmPublicDirectoryClaim = false) =>
  call("reviewPractitionerApplication", { uid, decision, reviewNote, confirmPublicDirectoryClaim });
export const listVerifiedPractitioners = ({ type = "", search = "", serviceFormat = "", accessibilityOption = "", deliveryOption = "", costOption = "", city = "", region = "", acceptingNewClients = false } = {}) =>
  call("listVerifiedPractitioners", { type, search, serviceFormat, accessibilityOption, deliveryOption, costOption, city, region, acceptingNewClients }, { allowAnonymous: true, allowSignedOut: true });
export async function searchPublicPractitionerDirectory({ city = "", region = "", category = "" } = {}) {
  const result = await call("searchPublicPractitionerDirectory", { city, region, category }, { allowAnonymous: true, allowSignedOut: true });
  logTelemetry("directory_search", { hasResults: Array.isArray(result.listings) && result.listings.length > 0 });
  return result;
}
export async function requestPractitionerConnection(practitionerId, introduction = "") {
  try {
    const result = await call("requestPractitionerConnection", { practitionerId, introduction });
    return result;
  } catch (error) {
    trackSupportAction("providers", "connection_request_failed", error?.code);
    throw error;
  }
}
export const listPractitionerConnectionRequests = () => call("listPractitionerConnectionRequests");
export const listMyPractitionerConnectionRequests = () => call("listMyPractitionerConnectionRequests");
export async function respondToPractitionerConnection(requestId, decision) {
  try {
    const result = await call("respondToPractitionerConnection", { requestId, decision });
    return result;
  } catch (error) {
    trackSupportAction("providers", "connection_response_failed", error?.code);
    throw error;
  }
}
export const listMyPractitionerShares = () => call("listMyPractitionerShares");
export const setPractitionerShare = (practitionerId, scopes) => call("setPractitionerShare", { practitionerId, scopes });
export const endMyPractitionerConnection = (practitionerId) => call("endMyPractitionerConnection", { practitionerId });
export const getProviderClientOverview = (clientId) => call("getProviderClientOverview", { clientId });
export const sendPractitionerSupportTool = (clientId, toolId, message = "", followUpDays = 0) => call("sendPractitionerSupportTool", { clientId, toolId, message, followUpDays });
export const listMyPractitionerSupport = () => call("listMyPractitionerSupport");
export const listMyDailyPractice = () => call("listMyDailyPractice");
export const markPractitionerSupportSeen = (supportId, action) => call("markPractitionerSupportSeen", { supportId, action });
export const submitPractitionerPracticeProgress = (supportId, outcome, note = "") => call("submitPractitionerPracticeProgress", { supportId, outcome, note });
export const exportMyWellnessData = () => call("exportMyWellnessData");
