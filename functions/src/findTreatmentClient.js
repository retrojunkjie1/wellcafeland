// functions/src/findTreatmentClient.js
// FindTreatment.gov API client with normalization and error handling

const axios = require("axios");
const crypto = require("crypto");

const FINDTREATMENT_BASE_URL = process.env.FINDTREATMENT_BASE_URL || "https://findtreatment.gov";
const MAX_PAGE_SIZE = 100;
const TIMEOUT_MS = 30000; // 30s timeout
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;

/**
 * Sleep utility for retries
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Normalize phone number for deduplication
 */
function normalizePhone(phone) {
  if (!phone || typeof phone !== "string") return "";
  return phone.replace(/\D/g, ""); // Remove all non-digits
}

/**
 * Normalize address for deduplication
 */
function normalizeAddress(address) {
  if (!address || typeof address !== "string") return "";
  return address
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .replace(/\s+/g, " "); // Normalize whitespace
}

/**
 * Generate dedupe hash from normalized fields
 */
function generateDedupeHash(name, phone, address) {
  const normalizedName = (name || "").toLowerCase().trim();
  const normalizedPhone = normalizePhone(phone);
  const normalizedAddr = normalizeAddress(address);
  const combined = `${normalizedName}|${normalizedPhone}|${normalizedAddr}`;
  return crypto.createHash("sha256").update(combined).digest("hex").substring(0, 16);
}

/**
 * Generate stable external source ID from FindTreatment data
 */
function generateExternalSourceId(facility) {
  if (facility.facility_id) {
    return `ft-${facility.facility_id}`;
  }
  // Fallback: hash-based ID
  const name = facility.name || "";
  const phone = normalizePhone(facility.phone || "");
  const addr = normalizeAddress(facility.address || "");
  const combined = `${name}|${phone}|${addr}`;
  const hash = crypto.createHash("md5").update(combined).digest("hex").substring(0, 12);
  return `ft-${hash}`;
}

/**
 * Normalize FindTreatment.gov facility data to internal schema
 */
function normalizeFacility(facility, metadata = {}) {
  const name = facility.name || facility.facility_name || "Unknown Facility";
  const phone = facility.phone || facility.phone_number || "";
  const address = facility.address || facility.street_address || "";
  const city = facility.city || "";
  const state = facility.state || facility.state_code || "";
  const zip = facility.zip || facility.zip_code || "";

  // Extract service codes/tags
  const serviceTags = [];
  if (facility.service_codes) {
    serviceTags.push(...facility.service_codes);
  }
  if (facility.specialty_programs) {
    serviceTags.push(...facility.specialty_programs);
  }

  // Type tags
  const typeTags = [];
  if (facility.type_of_care) {
    typeTags.push(...facility.type_of_care.split(",").map(t => t.trim()));
  }

  // Geo coordinates
  let geoPoint = null;
  if (facility.latitude && facility.longitude) {
    geoPoint = {
      _latitude: parseFloat(facility.latitude),
      _longitude: parseFloat(facility.longitude),
    };
  }

  // Distance (if provided)
  const distance = metadata.distance || null;

  return {
    source: "findtreatment.gov",
    externalSourceId: generateExternalSourceId(facility),
    dedupeHash: generateDedupeHash(name, phone, address),
    name,
    phone: normalizePhone(phone),
    address,
    city,
    state,
    zip,
    geo: geoPoint,
    serviceTags: [...new Set(serviceTags)], // Dedupe tags
    typeTags: [...new Set(typeTags)],
    distance,
    website: facility.website || null,
    email: facility.email || null,
    updatedAt: new Date(),
    fetchedAt: new Date(),
    verificationStatus: "unverified",
    // Preserve raw data for reference
    rawData: {
      facility_id: facility.facility_id || null,
      npi: facility.npi || null,
      source_system: "findtreatment.gov",
    },
  };
}

/**
 * Query FindTreatment.gov API with retry logic
 */
async function queryFindTreatment(params, retryCount = 0) {
  const url = `${FINDTREATMENT_BASE_URL}/locator/exportsAsJson/v2`;

  // Validate and sanitize params
  const safeParams = {
    page: Math.max(1, parseInt(params.page) || 1),
    pageSize: Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(params.pageSize) || 50)),
  };

  // Add optional params if provided
  if (params.sAddr) {
    safeParams.sAddr = String(params.sAddr).substring(0, 100); // Limit length
  }
  if (params.limitType !== undefined) {
    safeParams.limitType = Math.max(0, Math.min(2, parseInt(params.limitType) || 0));
  }
  if (params.limitValue !== undefined) {
    safeParams.limitValue = String(params.limitValue).substring(0, 50);
  }
  if (params.sType) {
    const validTypes = ["sa", "mh", "both"];
    if (validTypes.includes(params.sType)) {
      safeParams.sType = params.sType;
    }
  }
  if (params.sCodes) {
    safeParams.sCodes = String(params.sCodes).substring(0, 200); // Limit length
  }
  if (params.sort) {
    safeParams.sort = String(params.sort).substring(0, 50);
  }
  if (params.name) {
    safeParams.name = String(params.name).substring(0, 100);
  }
  if (params.address) {
    safeParams.address = String(params.address).substring(0, 200);
  }
  if (params.phone) {
    safeParams.phone = normalizePhone(params.phone);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await axios.get(url, {
      params: safeParams,
      timeout: TIMEOUT_MS,
      signal: controller.signal,
      headers: {
        "User-Agent": "WellnessCafe-OS/1.0",
        "Accept": "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (response.status !== 200) {
      throw new Error(`FindTreatment API returned status ${response.status}`);
    }

    const data = response.data;

    // Handle different response formats
    if (Array.isArray(data)) {
      return {
        facilities: data,
        total: data.length,
        page: safeParams.page,
        pageSize: safeParams.pageSize,
        hasMore: data.length === safeParams.pageSize,
      };
    }

    if (data.results && Array.isArray(data.results)) {
      return {
        facilities: data.results,
        total: data.total || data.results.length,
        page: safeParams.page,
        pageSize: safeParams.pageSize,
        hasMore: data.hasMore !== undefined ? data.hasMore : data.results.length === safeParams.pageSize,
      };
    }

    // Fallback: wrap single facility
    return {
      facilities: [data],
      total: 1,
      page: safeParams.page,
      pageSize: safeParams.pageSize,
      hasMore: false,
    };
  } catch (error) {
    if (retryCount < MAX_RETRIES && (
      error.code === "ECONNRESET" ||
      error.code === "ETIMEDOUT" ||
      error.message.includes("timeout") ||
      error.response?.status >= 500
    )) {
      const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount);
      await sleep(delay);
      return queryFindTreatment(params, retryCount + 1);
    }
    throw error;
  }
}

/**
 * Search FindTreatment.gov with pagination support
 */
async function searchFindTreatment(params) {
  const allFacilities = [];
  let page = 1;
  let hasMore = true;
  const maxPages = params.maxPages || 10; // Safety limit

  while (hasMore && page <= maxPages) {
    const result = await queryFindTreatment({ ...params, page });
    allFacilities.push(...result.facilities);

    hasMore = result.hasMore;
    page++;

    // Small delay between pages to be respectful
    if (hasMore && page <= maxPages) {
      await sleep(200);
    }
  }

  // Normalize all facilities
  const normalized = allFacilities.map(facility => 
    normalizeFacility(facility, { distance: facility.distance || null })
  );

  return normalized;
}

module.exports = {
  searchFindTreatment,
  queryFindTreatment,
  normalizeFacility,
  generateDedupeHash,
  generateExternalSourceId,
};

