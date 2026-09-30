const MAX_FEED_BYTES = 1024 * 1024;
const MAX_MEETINGS = 2000;
const MAX_ISSUES = 12;

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isTime(value) {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) return false;
  const [hour, minute] = value.split(":").map(Number);
  return hour < 24 && minute < 60;
}

function validUrl(value) {
  if (!hasText(value)) return false;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

function hasLocation(meeting) {
  return hasText(meeting.formatted_address)
    || [meeting.address, meeting.city, meeting.state || meeting.region, meeting.country].some(hasText)
    || hasText(meeting.location);
}

function plainText(value, max = 180) {
  return typeof value === "string"
    ? value.replace(/<[^>]*>/g, " ").replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max)
    : "";
}

function normalizeMeetingGuideRecords(meetings, source) {
  return meetings.map((meeting) => {
    const conferenceUrl = validUrl(meeting.conference_url) ? plainText(meeting.conference_url, 500) : "";
    const conferencePhone = plainText(meeting.conference_phone, 60);
    const street = plainText(meeting.address, 120);
    const formattedAddress = plainText(meeting.formatted_address, 240);
    const city = plainText(meeting.city, 80);
    const region = plainText(meeting.state || meeting.region, 80);
    const postalCode = plainText(meeting.postal_code, 24);
    const country = plainText(meeting.country, 60);
    const location = plainText(meeting.location, 120);
    const online = Boolean(conferenceUrl || conferencePhone);
    const hasStreet = Boolean(street || formattedAddress);
    const address = formattedAddress || [street, city, region, postalCode, country].filter(Boolean).join(", ");
    const searchArea = [city, region, postalCode, country, location].join(" ");
    const searchTokens = [...new Set(searchArea.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter((token) => token.length > 1))].slice(0, 40);
    const rawDays = Array.isArray(meeting.day) ? meeting.day : [meeting.day];
    const weekdays = rawDays.map(Number).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6);
    let sourceHost = "";
    try { sourceHost = new URL(source.feedUrl).hostname; } catch { /* validated source links are HTTPS */ }
    return {
      slug: String(meeting.slug).trim(),
      name: plainText(meeting.name, 255),
      weekdays,
      startTime: isTime(meeting.time) ? meeting.time : "",
      endTime: isTime(meeting.end_time) ? meeting.end_time : "",
      timeZone: plainText(meeting.timezone, 80),
      venueType: online ? (hasStreet ? 3 : 2) : 1,
      location,
      address,
      city,
      region,
      postalCode,
      country,
      virtualLink: conferenceUrl,
      virtualPhone: conferencePhone,
      formats: Array.isArray(meeting.types) ? meeting.types.slice(0, 12).map((type) => plainText(type, 24)).filter(Boolean) : [],
      sourceArea: plainText(source.organization, 120),
      sourceHost,
      searchTokens,
    };
  });
}

function failed(reason) {
  return { ok: false, summary: {
    recordCount: 0, onlineCount: 0, inPersonCount: 0, recordsWithNotes: 0,
    errors: [reason], warnings: [], checkedAt: new Date().toISOString(), format: "Meeting Guide JSON",
  } };
}

function validateMeetingGuideText(feedText, source = {}) {
  if (typeof feedText !== "string") return failed("Choose a JSON feed file.");
  const bytes = Buffer.byteLength(feedText, "utf8");
  if (bytes === 0) return failed("The selected file is empty.");
  if (bytes > MAX_FEED_BYTES) return failed("The feed file must be 1 MB or smaller.");

  let meetings;
  try { meetings = JSON.parse(feedText); } catch { return failed("This file is not valid JSON."); }
  if (!Array.isArray(meetings)) return failed("The feed must be a JSON list of meeting records.");
  if (meetings.length === 0) return failed("The feed contains no meeting records.");
  if (meetings.length > MAX_MEETINGS) return failed(`The feed has more than ${MAX_MEETINGS} records. Split it into smaller regional feeds before review.`);

  const errors = [];
  const warnings = [];
  const slugs = new Set();
  let onlineCount = 0;
  let inPersonCount = 0;
  let notesCount = 0;
  const add = (list, message) => { if (list.length < MAX_ISSUES) list.push(message); };

  meetings.forEach((meeting, index) => {
    const row = index + 1;
    if (!meeting || typeof meeting !== "object" || Array.isArray(meeting)) {
      add(errors, `Record ${row} is not an object.`);
      return;
    }
    if (!hasText(meeting.name) || meeting.name.length > 255) add(errors, `Record ${row} needs a name of 1–255 characters.`);
    if (typeof meeting.slug !== "string" && typeof meeting.slug !== "number") {
      add(errors, `Record ${row} needs a unique ID (called “slug” in the feed).`);
    } else {
      const slug = String(meeting.slug).trim();
      if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(slug)) add(errors, `Record ${row} has an ID that is not URL-safe or is longer than 64 characters.`);
      if (slugs.has(slug)) add(errors, `Record ${row} repeats an ID already used in this feed.`);
      slugs.add(slug);
    }

    const days = Array.isArray(meeting.day) ? meeting.day : [meeting.day];
    const byAppointment = meeting.appointment === true || meeting.appointment === "yes";
    const validDay = (day) => (typeof day === "number" && Number.isInteger(day) && day >= 0 && day <= 6)
      || (typeof day === "string" && /^[0-6]$/.test(day));
    if (!byAppointment && (!days.length || days.some((day) => !validDay(day)))) {
      add(errors, `Record ${row} needs a valid weekly day (Sunday 0 through Saturday 6).`);
    }
    if (!byAppointment && !isTime(meeting.time)) add(errors, `Record ${row} needs a start time in 24-hour HH:MM format.`);
    if (hasText(meeting.end_time) && !isTime(meeting.end_time)) add(errors, `Record ${row} has an end time that is not in HH:MM format.`);

    const online = validUrl(meeting.conference_url) || hasText(meeting.conference_phone);
    if (online) onlineCount += 1;
    else inPersonCount += 1;
    if (hasText(meeting.conference_url) && !validUrl(meeting.conference_url)) add(errors, `Record ${row} has a meeting link that is not a valid HTTPS address.`);
    if (online && !hasLocation(meeting)) add(errors, `Record ${row} needs a city or region, including for an online meeting.`);
    if (!online && !hasLocation(meeting)) add(errors, `Record ${row} needs an address or location.`);
    if (hasText(meeting.notes) || hasText(meeting.conference_url_notes) || hasText(meeting.conference_phone_notes)) notesCount += 1;
  });

  if (notesCount > 0) add(warnings, `${notesCount} record${notesCount === 1 ? " has" : "s have"} free-text notes. Review them for member names, personal details, or private meeting information before any publication.`);
  if (onlineCount + inPersonCount !== meetings.length) add(warnings, "Some records could not be categorized as online or in-person from their connection details.");
  const result = {
    ok: errors.length === 0,
    summary: {
      recordCount: meetings.length,
      onlineCount,
      inPersonCount,
      recordsWithNotes: notesCount,
      errors,
      warnings,
      checkedAt: new Date().toISOString(),
      format: "Meeting Guide JSON",
    },
  };
  if (result.ok) result.records = normalizeMeetingGuideRecords(meetings, source);
  return result;
}

module.exports = { validateMeetingGuideText, MAX_FEED_BYTES, MAX_MEETINGS };
