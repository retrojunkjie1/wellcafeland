/**
 * Client for buildClinicalPlan callable.
 */

import { callFunction } from "@/lib/functionsClient";

export async function buildClinicalPlan(answers) {
  const payload = {
    concerns: answers.concerns || [],
    commitment: answers.commitment || "medium",
    support: answers.support || "some",
    rawText: answers.rawText || "",
    safety: answers.safety || "",
    traumaSensitive: Boolean(answers.traumaSensitive),
  };
  return callFunction("buildClinicalPlan", payload, { throwOnError: false });
}
