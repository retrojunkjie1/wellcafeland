import { httpsCallable } from "firebase/functions";
import { functions } from "@/firebase";

async function call(name, data = {}) {
  const result = await httpsCallable(functions, name)(data);
  return result.data || {};
}

export const listHelpDirectoryForAdmin = (status = "all") => call("listHelpDirectoryForAdmin", { status });
export const saveHelpDirectoryDraft = (record) => call("saveHelpDirectoryDraft", record);
export const setHelpDirectoryStatus = (id, action, reviewNote) => call("setHelpDirectoryStatus", { id, action, reviewNote });
export const searchPublicHelpListings = (category, area) => call("searchPublicHelpListings", { category, area });
export const reportHelpListingIssue = (listingId, issue, details = "", submissionId) => call("reportHelpListingIssue", { listingId, issue, details, submissionId });
export const reviewHelpDirectoryCorrection = (reportId, action, reviewNote) => call("reviewHelpDirectoryCorrection", { reportId, action, reviewNote });
