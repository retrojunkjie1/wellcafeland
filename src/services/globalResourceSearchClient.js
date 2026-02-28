// src/services/globalResourceSearchClient.js
// Phase 52: Single entrypoint for global resource search — POST /api/globalResourceSearch

import { searchDirectory } from "./directorySearch";
import { buildApiUrl } from "./apiBase";

const DEFAULT_ENDPOINT = "/api/globalResourceSearch";
const ALIAS_ENDPOINT = "/api/searchLiveResources";

export function getSearchEndpoint() {
  return buildApiUrl("/globalResourceSearch");
}

export function isLiveResults(meta) {
  if (!meta) return false;
  return meta.provider === "live" || (!meta.fallback && meta.sourceCount > 0);
}

export function isVerifiedPathways(meta) {
  if (!meta) return false;
  return meta.fallback === true || meta.provider === "fallback" || meta.fallback === "curated" || meta.fallback === "firestore";
}

export function isProviderNotSubscribed(data) {
  return data?.code === "PROVIDER_NOT_SUBSCRIBED";
}

export async function searchGlobalResources(params) {
  return searchDirectory({
    ...params,
  });
}

export { searchDirectory };
