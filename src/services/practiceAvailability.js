import { httpsCallable } from "firebase/functions";
import { functions } from "@/firebase";

export async function getPublicPracticeAvailability() {
  const result = await httpsCallable(functions, "getPublicPracticeAvailability")({});
  return result.data || {};
}
