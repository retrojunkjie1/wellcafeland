import { httpsCallable } from "firebase/functions";
import { auth, functions } from "@/firebase";

async function call(name, data = {}) {
  if (!auth.currentUser || auth.currentUser.isAnonymous) {
    throw new Error("Sign in with a personal account to continue.");
  }
  const result = await httpsCallable(functions, name)(data);
  return result.data || {};
}

export const submitRecoveryMeetingSource = (application) => call("submitRecoveryMeetingSource", application);
export const listMyRecoveryMeetingSources = () => call("listMyRecoveryMeetingSources");
export const listRecoveryMeetingSourcesForAdmin = (status = "pending") => call("listRecoveryMeetingSourcesForAdmin", { status });
export const reviewRecoveryMeetingSource = (applicationId, decision, reviewerNote) =>
  call("reviewRecoveryMeetingSource", { applicationId, decision, reviewerNote });
export const validateRecoveryMeetingSourceFeed = (applicationId, feedText) =>
  call("validateRecoveryMeetingSourceFeed", { applicationId, feedText });
export const stageRecoveryMeetingSourceFeed = (applicationId, feedText, reviewerNote) =>
  call("stageRecoveryMeetingSourceFeed", { applicationId, feedText, reviewerNote });
export const publishRecoveryMeetingSourceFeed = (applicationId, reviewerNote) =>
  call("publishRecoveryMeetingSourceFeed", { applicationId, reviewerNote });
export const setRecoveryMeetingSourcePublication = (applicationId, action, reviewerNote) =>
  call("setRecoveryMeetingSourcePublication", { applicationId, action, reviewerNote });
