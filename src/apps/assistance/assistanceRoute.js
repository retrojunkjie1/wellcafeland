const hasValue = (params, key) => Boolean(params.get(key)?.trim());

export function getAssistanceEntry(search) {
  const params = search instanceof URLSearchParams ? search : new URLSearchParams(search);
  const intent = `${params.get("query") || ""} ${params.get("priority") || ""}`.toLowerCase();

  if (/\b(aa|na|a\.a\.|n\.a\.|alcoholics anonymous|narcotics anonymous)\b/.test(intent)) {
    return "meetings";
  }
  if (["priority", "domain", "query", "region"].some((key) => hasValue(params, key))) {
    return "finder";
  }
  return "hub";
}
