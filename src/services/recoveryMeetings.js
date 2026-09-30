import { buildApiUrl } from "@/services/apiBase";
import { getAppCheckHeaders } from "@/services/appCheckHeaders";

export async function searchRecoveryMeetings({ location, format, fellowship = "na", signal } = {}) {
  const response = await fetch(buildApiUrl("/searchRecoveryMeetings"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...await getAppCheckHeaders() },
    body: JSON.stringify({ location, format, fellowship }),
    signal,
  });
  let data;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok || !data?.ok) {
    const error = new Error(data?.message || "The meeting search could not be completed.");
    error.code = data?.code || "MEETING_SEARCH_FAILED";
    throw error;
  }
  return data;
}
