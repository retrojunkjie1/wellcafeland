import { BREATHKEEPER_QUESTION, runWellnessExperience } from "@/ai/experience/experienceEngine";

export { BREATHKEEPER_QUESTION };

export async function requestBreathkeeperCue(executeExperience = runWellnessExperience) {
  const response = await executeExperience("practice.breathing-cue", {});
  const result = response?.result || response;
  const invitation = typeof result?.invitation === "string" ? result.invitation.trim() : "";
  if (!invitation || invitation.length > 240) {
    throw new Error("Breathkeeper did not return a short, usable cue.");
  }
  return invitation;
}
