const normalize = (value) => String(value || "").toLowerCase();

/** Classify only explicit platform failures; never infer an App Check failure from auth alone. */
export function classifyProviderRequestFailure(error) {
  const code = normalize(error?.code);
  const message = normalize(error?.message);

  if (
    code.includes("app-check")
    || code.includes("app_check")
    || code === "app_check_required"
    || code === "app_check_invalid"
    || message.includes("app check")
    || message.includes("app verification")
  ) return "app-check";

  if (code.includes("permission-denied") || code.includes("unauthorized")) return "access";
  if (code.includes("unauthenticated") || code.includes("id-token-expired")) return "auth";
  return "load";
}
