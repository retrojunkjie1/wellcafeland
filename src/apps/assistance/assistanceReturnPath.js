// Return handoffs are intentionally limited to local Daily Practice routes.
// Never accept an arbitrary URL from route state.
export function getPracticeReturnPath(locationState) {
  const returnTo = locationState?.returnTo;
  if (typeof returnTo !== "string" || !/^\/tools\/[A-Za-z0-9._~%-]+$/.test(returnTo)) return "";
  return returnTo;
}
