const { onRequest } = require("firebase-functions/v2/https");
const axios = require("axios");
const admin = require("firebase-admin");
const { verifyHttpAppCheck } = require("./httpAppCheck");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const BMLT_SEARCH_URL = "https://aggregator.bmltenabled.org/main_server/client_interface/json/";
const MAX_LOCATION_LENGTH = 120;
const MAX_PAGE_SIZE = 30;
const STATE_LOOKUP_PAGE_SIZE = 100;
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const rateLimits = new Map();
let formatNamesCache = { at: 0, value: {} };

const US_STATES = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA", colorado: "CO",
  connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID",
  illinois: "IL", indiana: "IN", iowa: "IA", kansas: "KS", kentucky: "KY", louisiana: "LA",
  maine: "ME", maryland: "MD", massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS",
  missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
  "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND", ohio: "OH",
  oklahoma: "OK", oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT", virginia: "VA",
  washington: "WA", "west virginia": "WV", wisconsin: "WI", wyoming: "WY", "district of columbia": "DC",
};

function clean(value, max = 240) {
  return String(value || "").replace(/[<>\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function normalizeMeeting(record, formatNames = {}) {
  const day = Number(record.weekday_tinyint);
  const start = clean(record.start_time, 12).slice(0, 5);
  const duration = clean(record.duration_time, 12).slice(0, 5);
  const root = clean(record.root_server_uri, 300);
  const virtualLink = clean(record.virtual_meeting_link, 500);
  const safeVirtualLink = /^https:\/\//i.test(virtualLink) ? virtualLink : "";
  const addressParts = [record.location_street, record.location_municipality, record.location_province, record.location_postal_code_1]
    .map((part) => clean(part, 100)).filter(Boolean);

  return {
    id: clean(record.id_bigint || record.worldid_mixed, 80),
    name: clean(record.meeting_name, 120) || "N.A. meeting",
    weekday: Number.isInteger(day) && day >= 1 && day <= 7 ? day : null,
    startTime: /^\d{2}:\d{2}$/.test(start) ? start : "",
    duration: /^\d{2}:\d{2}$/.test(duration) ? duration : "",
    timeZone: clean(record.time_zone, 60),
    venueType: Number(record.venue_type),
    location: clean(record.location_text, 180),
    address: addressParts.join(", "),
    formats: clean(record.formats, 120).split(",").map((item) => formatNames[item.trim()] || "").filter(Boolean),
    virtualLink: safeVirtualLink,
    sourceArea: clean(record.service_body_name, 120),
    sourceHost: (() => {
      try { return new URL(root).hostname; } catch { return "BMLT public meeting feed"; }
    })(),
  };
}

function getLocationSearchTerms(location) {
  const normalized = location.toLowerCase().trim().replace(/\./g, "");
  const stateName = Object.keys(US_STATES).find((name) => normalized === name || normalized.endsWith(`, ${name}`));
  const terms = [{ value: location.trim(), stateCode: "" }];
  if (stateName) {
    terms.push({
      value: normalized === stateName ? US_STATES[stateName] : `${location.slice(0, location.length - stateName.length)}${US_STATES[stateName]}`,
      stateCode: US_STATES[stateName],
    });
  }
  return terms.filter((term, index, list) => term.value && list.findIndex((candidate) => candidate.value === term.value) === index);
}

function stateCodeForRecord(value) {
  const state = clean(value, 40).toLowerCase().trim();
  return US_STATES[state] || state.toUpperCase();
}

function requestIsRateLimited(req) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now - entry.startedAt >= RATE_LIMIT_WINDOW_MS) {
    rateLimits.set(ip, { startedAt: now, count: 1 });
    if (rateLimits.size > 1000) {
      for (const [key, value] of rateLimits) if (now - value.startedAt >= RATE_LIMIT_WINDOW_MS) rateLimits.delete(key);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function locationTokens(location) {
  return [...new Set(clean(location, MAX_LOCATION_LENGTH).toLowerCase().normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter((token) => token.length > 1))].slice(0, 10);
}

async function searchPublishedDirectory(location, format, fellowship) {
  const tokens = locationTokens(location);
  if (!tokens.length) return [];
  const snapshot = await db.collection("recovery_meetings")
    .where("fellowship", "==", fellowship)
    .where("searchTokens", "array-contains-any", tokens)
    .limit(150)
    .get();
  if (snapshot.empty) return [];
  const sourceIds = [...new Set(snapshot.docs.map((doc) => doc.get("sourceId")).filter(Boolean))];
  const sources = await Promise.all(sourceIds.map((id) => db.collection("recovery_meeting_directory_sources").doc(id).get()));
  const activeRevision = new Map(sources.filter((doc) => doc.exists && doc.get("status") === "active")
    .map((doc) => [doc.id, doc.get("activeRevision")]));
  const allowedVenueTypes = format === "online" ? new Set([2, 3]) : new Set([1, 3]);
  const normalizedQuery = clean(location, MAX_LOCATION_LENGTH).toLowerCase();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((meeting) => activeRevision.get(meeting.sourceId) === meeting.revisionId)
    .filter((meeting) => allowedVenueTypes.has(Number(meeting.venueType)))
    .map((meeting) => {
      const area = [meeting.city, meeting.region, meeting.postalCode, meeting.country, meeting.location, meeting.address].join(" ").toLowerCase();
      const strongTokens = tokens.filter((token) => !/^[a-z]{2}$/.test(token));
      const requiredTokens = strongTokens.length ? strongTokens : tokens;
      const hits = requiredTokens.filter((token) => meeting.searchTokens?.includes(token)).length;
      const exactArea = area.includes(normalizedQuery.replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim());
      return { ...meeting, _score: hits === requiredTokens.length ? hits + (exactArea ? 4 : 0) : 0 };
    })
    .filter((meeting) => meeting._score > 0)
    .sort((left, right) => right._score - left._score || left.name.localeCompare(right.name))
    .slice(0, 30)
    .map((meeting) => ({
      id: meeting.id, name: meeting.name, weekdays: meeting.weekdays || [], startTime: meeting.startTime || "",
      endTime: meeting.endTime || "", timeZone: meeting.timeZone || "", venueType: meeting.venueType,
      location: meeting.location || "", address: meeting.address || "", formats: meeting.formats || [],
      virtualLink: meeting.virtualLink || "", sourceArea: meeting.sourceArea || "",
      source: "WellnessCafe authorized directory",
    }));
}

async function getFormatNames() {
  if (Date.now() - formatNamesCache.at < 6 * 60 * 60 * 1000) return formatNamesCache.value;
  try {
    const response = await axios.get(BMLT_SEARCH_URL, { params: { switcher: "GetFormats", lang_enum: "en" }, timeout: 7000 });
    const names = {};
    for (const item of Array.isArray(response.data) ? response.data : []) {
      const key = clean(item.key_string, 12);
      const name = clean(item.name_string, 60);
      if (key && name) names[key] = name;
    }
    formatNamesCache = { at: Date.now(), value: names };
    return names;
  } catch {
    return {};
  }
}

exports.searchRecoveryMeetings = onRequest(
  { region: "us-central1", cors: true, timeoutSeconds: 20, memory: "256MiB" },
  async (req, res) => {
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).json({ ok: false, code: "METHOD_NOT_ALLOWED" });
    if (!await verifyHttpAppCheck(req, res)) return;
    if (requestIsRateLimited(req)) return res.status(429).json({ ok: false, code: "RATE_LIMITED", message: "Please wait a moment, then search again." });

    let body = req.body || {};
    if (typeof body === "string") {
      try { body = JSON.parse(body || "{}"); } catch { return res.status(400).json({ ok: false, code: "INVALID_REQUEST" }); }
    }
    const location = clean(body.location, MAX_LOCATION_LENGTH);
    const format = body.format === "online" ? "online" : body.format === "in-person" ? "in-person" : "";
    const fellowship = body.fellowship === "aa" ? "aa" : body.fellowship === "na" || !body.fellowship ? "na" : "";
    if (location.length < 2) return res.status(400).json({ ok: false, code: "LOCATION_REQUIRED", message: "Enter a city, region, or postal code." });
    if (!format) return res.status(400).json({ ok: false, code: "INVALID_FORMAT", message: "Choose online or in person." });
    if (!fellowship) return res.status(400).json({ ok: false, code: "INVALID_FELLOWSHIP", message: "Choose A.A. or N.A." });

    let localMeetings = [];
    try {
      localMeetings = await searchPublishedDirectory(location, format, fellowship);
      if (fellowship === "aa") {
        return res.status(200).json({ ok: true, fellowship, format, location, source: "WellnessCafe authorized directory", searchedAt: new Date().toISOString(), meetings: localMeetings });
      }
      const locationTerms = getLocationSearchTerms(location);
      let records = [];
      for (const term of locationTerms) {
        const params = new URLSearchParams();
        params.set("switcher", "GetSearchResults");
        params.set("SearchString", term.value);
        for (const venueType of (format === "online" ? [2, 3] : [1, 3])) params.append("venue_types[]", String(venueType));
        params.set("page_size", String(term.stateCode ? STATE_LOOKUP_PAGE_SIZE : MAX_PAGE_SIZE));
        params.set("page_num", "1");
        const response = await axios.get(BMLT_SEARCH_URL, {
          params,
          timeout: 14000,
          headers: { Accept: "application/json", "User-Agent": "WellnessCafeOS/1.0 meeting search" },
        });
        records = Array.isArray(response.data) ? response.data : [];
        if (term.stateCode) records = records.filter((record) => stateCodeForRecord(record.location_province) === term.stateCode);
        if (records.length) break;
      }
      const formatNames = await getFormatNames();
      const meetings = records.filter((record) => String(record.published) !== "0").map((record) => normalizeMeeting(record, formatNames));
      const merged = [...localMeetings, ...meetings];
      return res.status(200).json({ ok: true, fellowship, format, location, source: localMeetings.length ? "WellnessCafe authorized directory and public N.A. listings" : "Public N.A. meeting feed", searchedAt: new Date().toISOString(), meetings: merged, localCount: localMeetings.length, publicCount: meetings.length });
    } catch (error) {
      if (localMeetings.length && fellowship === "na") {
        return res.status(200).json({ ok: true, fellowship, format, location, source: "WellnessCafe authorized directory", searchedAt: new Date().toISOString(), meetings: localMeetings, localCount: localMeetings.length, publicCount: 0, publicSourceUnavailable: true });
      }
      if (error?.message && error?.name !== "AxiosError") console.error("Published meeting directory search failed", error);
      const fellowshipName = fellowship === "aa" ? "A.A." : "N.A.";
      return res.status(502).json({ ok: false, code: "MEETING_SOURCE_UNAVAILABLE", message: `The ${fellowshipName} meeting directory could not be reached. Try again in a moment or open the official ${fellowshipName} finder.` });
    }
  }
);

exports._normalizeMeeting = normalizeMeeting;
exports._searchPublishedDirectory = searchPublishedDirectory;
