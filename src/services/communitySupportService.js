import { httpsCallable } from "firebase/functions";
import { signInAnonymously } from "firebase/auth";
import { auth, functions } from "@/firebase";

async function invoke(name, data = {}, { allowGuest = true } = {}) {
  if (!auth.currentUser) {
    if (!allowGuest) throw new Error("Sign in with a verified email account to continue.");
    await signInAnonymously(auth);
  }
  const callable = httpsCallable(functions, name);
  const result = await callable(data);
  return result.data;
}

export const createCommunityNeed = (data) => invoke("createCommunityNeed", data);
export const listMyCommunityNeeds = () => invoke("listMyCommunityNeeds");
export const closeCommunityNeed = (needId) => invoke("closeCommunityNeed", { needId });
export const finishCommunityNeed = (needId, outcome) => invoke("finishCommunityNeed", { needId, outcome });
export const getMyCommunityGivingStatus = () => invoke("getMyCommunityGivingStatus");
export const listOpenCommunityNeeds = (filters) => invoke("listOpenCommunityNeeds", filters, { allowGuest: false });
export const applyToCommunityGiving = (data) => invoke("applyToCommunityGiving", data, { allowGuest: false });
export const createCommunitySupportOffer = (needId) => invoke("createCommunitySupportOffer", { needId }, { allowGuest: false });
export const respondToCommunityOffer = (needId, supporterUid, decision) => invoke(
  "respondToCommunityOffer",
  { needId, supporterUid, decision }
);
export const shareCommunityDeliveryDetails = (needId, address, phone) => invoke(
  "shareCommunityDeliveryDetails",
  { needId, address, phone }
);
export const listMyCommunityOffers = () => invoke("listMyCommunityOffers", {}, { allowGuest: false });
export const listCommunityGiverApplications = () => invoke("listCommunityGiverApplications", {}, { allowGuest: false });
export const reviewCommunityGiverApplication = (applicantUid, decision) => invoke(
  "reviewCommunityGiverApplication",
  { applicantUid, decision },
  { allowGuest: false }
);
