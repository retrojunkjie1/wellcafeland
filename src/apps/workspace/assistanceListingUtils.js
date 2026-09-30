import { normalizeExternalUrl } from "@/utils/normalizeUrl";

export function dedupeResourceListings(items = []) {
  const output = [];
  const seenKeys = new Map();
  for (const item of items) {
    const title = String(item?.name || item?.title || "").trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ");
    const phone = String(item?.phone || "").replace(/\D/g, "");
    const region = String(item?.region || item?.locationLine || item?.address || "").trim().toLowerCase();
    const rawUrl = normalizeExternalUrl(item?.website || item?.url);
    let urlKey = "";
    try {
      const url = new URL(rawUrl);
      urlKey = `${url.hostname.toLowerCase().replace(/^www\./, "")}${url.pathname.replace(/\/+$/, "")}`;
    } catch {
      // A missing or invalid URL is handled by the other stable identifiers.
    }
    const keys = [
      urlKey && `url:${urlKey}`,
      phone && title && `contact:${title}:${phone}`,
      region && title && `location:${title}:${region}`,
      title.length >= 18 && !region && !phone && !urlKey && `title:${title}`,
    ].filter(Boolean);
    const existingIndex = keys.map((key) => seenKeys.get(key)).find((index) => index !== undefined);
    if (existingIndex === undefined) {
      const index = output.push(item) - 1;
      keys.forEach((key) => seenKeys.set(key, index));
      continue;
    }

    const previous = output[existingIndex];
    output[existingIndex] = {
      ...item,
      ...previous,
      ...Object.fromEntries(Object.entries(item).filter(([key, value]) => (previous[key] === null || previous[key] === undefined || previous[key] === "") && value !== null && value !== undefined && value !== "")),
      curated: Boolean(previous.curated || item.curated),
    };
    keys.forEach((key) => seenKeys.set(key, existingIndex));
  }
  return output;
}
