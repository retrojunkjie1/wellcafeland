import { normalizeExternalUrl } from "@/utils/normalizeUrl";

const CATEGORY_TERMS = {
  housing: /housing|shelter|safe house|safe home|homeless|refuge|accommodation|survivor support/i,
  food: /food[- ]bank|food[- ]pantry|food[- ]assistance|food[- ]relief|food[- ]support|hunger relief|meal program|community kitchen|grocery|nutrition support|feeding program/i,
  funding: /benefit|cash assistance|social protection|grant|financial assistance|utility assistance|income support|welfare|social register/i,
  programs: /treatment|rehabilitation|rehab|addiction|substance use|detox|counsel(?:ing|ling)|psychotherap|clinical care|mental health clinic/i,
  circles: /peer support|peer[- ]led|peer recovery|peer circle|recovery meeting|recovery group|mutual aid|community circle|support group|fellowship meeting|alcoholics anonymous|narcotics anonymous|\b(?:aa|na) meetings?\b|12[- ]step|mutual support/i,
  emergency: /crisis|emergency|urgent support|helpline|hotline|safety response|domestic violence|suicide prevention/i,
};

const CATEGORY_EXCLUSIONS = {
  housing: /property for sale|real estate agent|hotel booking/i,
  food: /restaurant|food delivery|grocery store opening/i,
  funding: /fundraising for organization|donate to us|investment grant/i,
  programs: /school program|academic program|sports club/i,
  circles: /online search directory|find a local group by city|meeting finder only/i,
  emergency: /news article|crime report|emergency preparedness course/i,
};

export function isHelpCategoryRelevant(item, category) {
  const terms = CATEGORY_TERMS[category];
  if (!terms) return true;
  const tags = Array.isArray(item?.tags) ? item.tags.join(" ") : item?.tags || "";
  const text = [
    item?.title, item?.name, item?.description, item?.summary, item?.snippet,
    item?.type, item?.resourceType, item?.category, item?.serviceType, tags,
  ].filter(Boolean).join(" ").toLowerCase();
  return terms.test(text) && !CATEGORY_EXCLUSIONS[category]?.test(text);
}

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
      // A single official calendar often links to many distinct meetings.
      // Keep separate offerings from that source while still merging duplicate
      // copies of the same titled listing.
      urlKey && title && `url:${urlKey}:${title}`,
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
