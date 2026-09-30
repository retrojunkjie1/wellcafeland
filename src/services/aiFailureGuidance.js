/** Choose recovery actions that match the request instead of routing every failure to a directory. */
export function getAIServiceFailureActions({ routeIntent = "UNKNOWN", directoryRequested = false, retryable = true } = {}) {
  const actions = [];
  if (retryable) actions.push({ label: "Retry", action: "retry" });

  if (directoryRequested || routeIntent === "DIRECTORY") {
    actions.push({ label: "Open support search", action: "open_directory" });
  } else if (routeIntent === "RESTRICTED") {
    actions.push({ label: "Browse practitioners", action: "open_practitioners" });
  } else {
    actions.push({ label: "Continue offline", action: "offline" });
  }

  return actions;
}
