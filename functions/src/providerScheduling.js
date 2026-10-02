const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { recordTrustedSupportActivity } = require("./supportActivity");
const { requireVerifiedAccount } = require("./accountAccess");

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();
const { Timestamp, FieldValue } = admin.firestore;
const REGION = "us-central1";

async function requireProvider(request) {
  const uid = requireVerifiedAccount(request, "use practitioner scheduling");
  const profile = await db.collection("users").doc(uid).get();
  const data = profile.exists ? profile.data() : {};
  const role = request.auth.token.role || data.role || "";
  const roles = Array.isArray(data.roles) ? data.roles : [];
  const allowed = request.auth.token.provider === true
    || ["provider", "provider_admin"].includes(role)
    || roles.some((item) => ["provider", "provider_admin"].includes(item));
  if (!allowed) throw new HttpsError("permission-denied", "Practitioner access is required.");
  // Never let profile data redirect a practitioner token to another account.
  return uid;
}
exports.requireProvider = requireProvider;

const AVAILABILITY_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DEFAULT_TIMEZONE = "America/Denver";
function isTimezone(value) {
  if (typeof value !== "string" || value.length > 80) return false;
  try { new Intl.DateTimeFormat("en-US", { timeZone: value }).format(); return true; } catch { return false; }
}
function cleanWeeklyHours(value) {
  if (!Array.isArray(value) || value.length !== 7) throw new HttpsError("invalid-argument", "Add one availability setting for each day of the week.");
  return value.map((item, dayOfWeek) => {
    if (!item || item.dayOfWeek !== dayOfWeek || typeof item.enabled !== "boolean") throw new HttpsError("invalid-argument", "Availability days are not in the expected order.");
    if (!item.enabled) return { dayOfWeek, enabled: false, start: "", end: "" };
    const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    if (!timePattern.test(item.start) || !timePattern.test(item.end) || item.end <= item.start) {
      throw new HttpsError("invalid-argument", `Choose a valid start and end time for ${AVAILABILITY_DAYS[dayOfWeek]}.`);
    }
    return { dayOfWeek, enabled: true, start: item.start, end: item.end };
  });
}

exports.getMyProviderAvailability = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const providerId = await requireProvider(request);
  const snapshot = await db.collection("provider_availability").doc(providerId).get();
  const data = snapshot.exists ? snapshot.data() : {};
  return {
    timezone: isTimezone(data.timezone) ? data.timezone : DEFAULT_TIMEZONE,
    weeklyHours: Array.isArray(data.weeklyHours) ? data.weeklyHours : AVAILABILITY_DAYS.map((_, dayOfWeek) => ({ dayOfWeek, enabled: false, start: "", end: "" })),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || null,
  };
});

exports.saveMyProviderAvailability = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const providerId = await requireProvider(request);
  const timezone = request.data?.timezone;
  if (!isTimezone(timezone)) throw new HttpsError("invalid-argument", "Choose a valid time zone.");
  const weeklyHours = cleanWeeklyHours(request.data?.weeklyHours);
  await db.collection("provider_availability").doc(providerId).set({
    providerId, timezone, weeklyHours, updatedAt: FieldValue.serverTimestamp(),
  });
  return { ok: true, timezone, weeklyHours };
});

exports.getConnectedPractitionerAvailability = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireClientAccount(request, "view practitioner appointment times");
  const providerId = typeof request.data?.providerId === "string" ? request.data.providerId.trim() : "";
  if (!providerId) throw new HttpsError("invalid-argument", "Choose a practitioner.");
  const assignment = await db.collection("clientProviderAssignments")
    .where("providerId", "==", providerId).where("clientId", "==", clientId).where("status", "==", "active").limit(1).get();
  if (assignment.empty) throw new HttpsError("permission-denied", "You can view scheduling hours only for a practitioner you’re connected to.");
  const snapshot = await db.collection("provider_availability").doc(providerId).get();
  if (!snapshot.exists) return { timezone: null, weeklyHours: [], upcomingSlots: [] };
  const data = snapshot.data();
  const durationMinutes = Number(request.data?.durationMinutes || 45);
  const timezone = isTimezone(data.timezone) ? data.timezone : null;
  const weeklyHours = Array.isArray(data.weeklyHours) ? data.weeklyHours : [];
  const upcomingSlots = timezone ? await upcomingProviderSlots(providerId, { timezone, weeklyHours }, durationMinutes) : [];
  return { timezone, weeklyHours, upcomingSlots };
});

function isWithinProviderHours(startAt, endAt, timezone, weeklyHours) {
  if (!isTimezone(timezone) || !Array.isArray(weeklyHours)) return false;
  const format = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const startParts = Object.fromEntries(format.formatToParts(startAt).map(({ type, value }) => [type, value]));
  const endParts = Object.fromEntries(format.formatToParts(endAt).map(({ type, value }) => [type, value]));
  if (startParts.weekday !== endParts.weekday) return false;
  const dayOfWeek = AVAILABILITY_DAYS.indexOf(startParts.weekday);
  const window = weeklyHours.find((item) => item.dayOfWeek === dayOfWeek && item.enabled);
  if (!window) return false;
  const startMinutes = Number(startParts.hour) * 60 + Number(startParts.minute);
  const endMinutes = Number(endParts.hour) * 60 + Number(endParts.minute);
  const windowStart = Number(window.start?.slice(0, 2)) * 60 + Number(window.start?.slice(3, 5));
  const windowEnd = Number(window.end?.slice(0, 2)) * 60 + Number(window.end?.slice(3, 5));
  return startMinutes >= windowStart && endMinutes <= windowEnd;
}

function zonedParts(date, timezone) {
  return Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit",
    weekday: "long", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(date).map(({ type, value }) => [type, value]));
}

function localDateTimeToDate(year, month, day, hour, minute, timezone) {
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let candidate = target;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = zonedParts(new Date(candidate), timezone);
    const represented = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
    const correction = target - represented;
    if (correction === 0) return new Date(candidate);
    candidate += correction;
  }
  const parts = zonedParts(new Date(candidate), timezone);
  if (Number(parts.year) === year && Number(parts.month) === month && Number(parts.day) === day
    && Number(parts.hour) === hour && Number(parts.minute) === minute) return new Date(candidate);
  return null;
}

async function upcomingProviderSlots(providerId, availability, durationMinutes) {
  if (![30, 45, 60, 90].includes(durationMinutes)) throw new HttpsError("invalid-argument", "Choose a supported session length.");
  const { timezone, weeklyHours } = availability;
  const now = new Date();
  const today = zonedParts(now, timezone);
  const todayUtc = Date.UTC(Number(today.year), Number(today.month) - 1, Number(today.day));
  const slots = [];
  for (let offset = 0; offset < 21; offset += 1) {
    const calendar = new Date(todayUtc + offset * 24 * 60 * 60 * 1000);
    const year = calendar.getUTCFullYear();
    const month = calendar.getUTCMonth() + 1;
    const day = calendar.getUTCDate();
    const window = weeklyHours.find((item) => item.dayOfWeek === calendar.getUTCDay() && item.enabled);
    if (!window) continue;
    const windowStart = Number(window.start.slice(0, 2)) * 60 + Number(window.start.slice(3, 5));
    const windowEnd = Number(window.end.slice(0, 2)) * 60 + Number(window.end.slice(3, 5));
    for (let minute = windowStart; minute + durationMinutes <= windowEnd; minute += 30) {
      const startAt = localDateTimeToDate(year, month, day, Math.floor(minute / 60), minute % 60, timezone);
      const endMinute = minute + durationMinutes;
      const endAt = localDateTimeToDate(year, month, day, Math.floor(endMinute / 60), endMinute % 60, timezone);
      if (startAt && endAt && endAt.getTime() - startAt.getTime() === durationMinutes * 60_000
        && startAt.getTime() >= now.getTime() + 60 * 60 * 1000) slots.push({ startAt, endAt });
    }
  }
  if (!slots.length) return [];
  const lastEnd = slots[slots.length - 1].endAt;
  const [appointments, requests] = await Promise.all([
    db.collection("appointments").where("providerId", "==", providerId)
      .where("startAt", ">=", Timestamp.fromDate(new Date(now.getTime() - 4 * 60 * 60 * 1000)))
      .where("startAt", "<", Timestamp.fromDate(lastEnd)).limit(500).get(),
    db.collection("appointment_requests").where("providerId", "==", providerId)
      .where("status", "==", "pending").limit(500).get(),
  ]);
  const occupied = [
    ...appointments.docs.map((doc) => doc.data()).filter((item) => item.status !== "cancelled"),
    ...requests.docs.map((doc) => doc.data()),
  ].map((item) => ({
    start: item.startAt?.toDate?.()?.getTime?.() ?? item.requestedStartAt?.toDate?.()?.getTime?.() ?? 0,
    end: item.endAt?.toDate?.()?.getTime?.() ?? item.requestedEndAt?.toDate?.()?.getTime?.() ?? 0,
  }));
  return slots.filter((slot) => !occupied.some((item) => item.start < slot.endAt.getTime() && item.end > slot.startAt.getTime()))
    .map((slot) => ({
      startAt: slot.startAt.toISOString(),
      endAt: slot.endAt.toISOString(),
      label: `${new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "long", month: "short", day: "numeric" }).format(slot.startAt)} · ${new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", minute: "2-digit" }).format(slot.startAt)} · ${timezone}`,
    }));
}

function requireClientAccount(request, action) {
  return requireVerifiedAccount(request, action);
}

exports.listMyConnectedPractitioners = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireClientAccount(request, "request a session");
  const snapshot = await db.collection("clientProviderAssignments")
    .where("clientId", "==", clientId)
    .where("status", "==", "active")
    .limit(100)
    .get();
  const practitioners = await Promise.all(snapshot.docs.map(async (doc) => {
    const providerId = doc.get("providerId");
    if (!providerId) return null;
    const profile = await db.collection("realHelpProviders").doc(providerId).get();
    return { id: providerId, name: profile.exists ? (profile.get("name") || "Your practitioner") : "Your practitioner" };
  }));
  return { practitioners: practitioners.filter(Boolean) };
});

exports.listMyAppointmentRequests = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireClientAccount(request, "view session requests");
  const snapshot = await db.collection("appointment_requests")
    .where("clientId", "==", clientId)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  const providerIds = [...new Set(snapshot.docs.map((doc) => doc.get("providerId")).filter(Boolean))];
  const names = new Map(await Promise.all(providerIds.map(async (providerId) => {
    const profile = await db.collection("realHelpProviders").doc(providerId).get();
    return [providerId, profile.exists ? (profile.get("name") || "Your practitioner") : "Your practitioner"];
  })));
  return { requests: snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      providerId: data.providerId,
      practitionerName: names.get(data.providerId) || "Your practitioner",
      requestedStartAt: data.requestedStartAt?.toDate?.()?.toISOString?.() || null,
      requestedEndAt: data.requestedEndAt?.toDate?.()?.toISOString?.() || null,
      status: data.status,
      responseMessage: data.responseMessage || "",
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
    };
  }) };
});

exports.requestProviderAppointment = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const clientId = requireClientAccount(request, "request a session");
  const providerId = typeof request.data?.providerId === "string" ? request.data.providerId.trim() : "";
  const note = typeof request.data?.note === "string" ? request.data.note.trim() : "";
  const startAt = asDate(request.data?.requestedStartAt, "Requested start time");
  const endAt = asDate(request.data?.requestedEndAt, "Requested end time");
  if (!providerId) throw new HttpsError("invalid-argument", "Choose a practitioner.");
  if (startAt.getTime() < Date.now() + 5 * 60_000) throw new HttpsError("invalid-argument", "Choose a future time, at least five minutes from now.");
  if (endAt <= startAt || endAt.getTime() - startAt.getTime() > 4 * 60 * 60 * 1000) {
    throw new HttpsError("invalid-argument", "Choose an end time after the start, within four hours.");
  }
  if (note.length > 240) throw new HttpsError("invalid-argument", "Keep your note under 240 characters.");
  const requestRef = db.collection("appointment_requests").doc();
  await db.runTransaction(async (transaction) => {
    const availabilitySnapshot = await transaction.get(db.collection("provider_availability").doc(providerId));
    if (!availabilitySnapshot.exists) throw new HttpsError("failed-precondition", "This practitioner hasn’t published appointment times yet. Contact them to ask about scheduling.");
    const availability = availabilitySnapshot.data();
    if (!isWithinProviderHours(startAt, endAt, availability.timezone, availability.weeklyHours)) {
      throw new HttpsError("failed-precondition", "Choose a time that falls within the practitioner’s published hours.");
    }
    const assignment = await transaction.get(db.collection("clientProviderAssignments")
      .where("providerId", "==", providerId)
      .where("clientId", "==", clientId)
      .where("status", "==", "active")
      .limit(1));
    if (assignment.empty) throw new HttpsError("permission-denied", "You can request a session only with a practitioner you’re connected to.");
    const pending = await transaction.get(db.collection("appointment_requests")
      .where("clientId", "==", clientId)
      .where("providerId", "==", providerId)
      .where("status", "==", "pending")
      .limit(1));
    if (!pending.empty) throw new HttpsError("already-exists", "You already have a session request waiting for this practitioner.");
    const [appointments, providerRequests] = await Promise.all([
      transaction.get(db.collection("appointments").where("providerId", "==", providerId)
        .where("startAt", ">=", Timestamp.fromDate(new Date(startAt.getTime() - 4 * 60 * 60 * 1000)))
        .where("startAt", "<", Timestamp.fromDate(endAt))),
      transaction.get(db.collection("appointment_requests").where("providerId", "==", providerId).where("status", "==", "pending").limit(500)),
    ]);
    const collides = appointments.docs.some((doc) => {
      const item = doc.data();
      return item.status !== "cancelled" && item.startAt?.toDate?.()?.getTime?.() < endAt.getTime()
        && item.endAt?.toDate?.()?.getTime?.() > startAt.getTime();
    }) || providerRequests.docs.some((doc) => {
      const item = doc.data();
      return item.requestedStartAt?.toDate?.()?.getTime?.() < endAt.getTime()
        && item.requestedEndAt?.toDate?.()?.getTime?.() > startAt.getTime();
    });
    if (collides) throw new HttpsError("already-exists", "That opening was just requested or booked. Please choose another available time.");
    transaction.create(requestRef, {
      clientId,
      providerId,
      requestedStartAt: Timestamp.fromDate(startAt),
      requestedEndAt: Timestamp.fromDate(endAt),
      note,
      status: "pending",
      responseMessage: "",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  await recordTrustedSupportActivity([
    { uid: clientId, feature: "sessions", eventCode: "session_request_sent" },
    { uid: providerId, feature: "sessions", eventCode: "session_request_received" },
  ]);
  return { ok: true, requestId: requestRef.id, status: "pending" };
});

exports.listProviderAppointmentRequests = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const providerId = await requireProvider(request);
  const snapshot = await db.collection("appointment_requests")
    .where("providerId", "==", providerId)
    .where("status", "==", "pending")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();
  return { requests: snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      clientId: data.clientId,
      requestedStartAt: data.requestedStartAt?.toDate?.()?.toISOString?.() || null,
      requestedEndAt: data.requestedEndAt?.toDate?.()?.toISOString?.() || null,
      note: data.note || "",
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
    };
  }) };
});

exports.respondToProviderAppointmentRequest = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const providerId = await requireProvider(request);
  const requestId = typeof request.data?.requestId === "string" ? request.data.requestId.trim() : "";
  const decision = request.data?.decision;
  const responseMessage = typeof request.data?.responseMessage === "string" ? request.data.responseMessage.trim().slice(0, 240) : "";
  if (!requestId || !["accept", "decline"].includes(decision)) throw new HttpsError("invalid-argument", "Choose a request and a response.");
  const requestRef = db.collection("appointment_requests").doc(requestId);
  const appointmentRef = db.collection("appointments").doc();
  const outcome = await db.runTransaction(async (transaction) => {
    const requestDoc = await transaction.get(requestRef);
    if (!requestDoc.exists || requestDoc.get("providerId") !== providerId) {
      throw new HttpsError("not-found", "This session request is no longer available.");
    }
    const data = requestDoc.data();
    if (data.status !== "pending") {
      // A successful response can reach Firestore even if the client loses the
      // network before it receives the result. Repeating that same response
      // should return the canonical outcome without creating another session.
      if (decision === "accept" && data.status === "accepted" && data.appointmentId) {
        return { status: "accepted", appointmentId: data.appointmentId, newlyResponded: false };
      }
      if (decision === "decline" && data.status === "declined") {
        return { status: "declined", newlyResponded: false };
      }
      throw new HttpsError("failed-precondition", "This request has already received a response. Refresh the schedule to see its current status.");
    }
    if (decision === "decline") {
      transaction.update(requestRef, {
        status: "declined",
        responseMessage: responseMessage || "Your practitioner can’t meet at the requested time. You can ask about another time.",
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { status: "declined", clientId: data.clientId, newlyResponded: true };
    }
    const sessionDetails = cleanSessionDetails(request.data?.sessionFormat || "in-person", request.data?.meetingLink || "");
    const assignment = await transaction.get(db.collection("clientProviderAssignments")
      .where("providerId", "==", providerId)
      .where("clientId", "==", data.clientId)
      .where("status", "==", "active")
      .limit(1));
    if (assignment.empty) throw new HttpsError("failed-precondition", "This client is no longer connected to your practice.");
    const startAt = data.requestedStartAt?.toDate?.();
    const endAt = data.requestedEndAt?.toDate?.();
    if (!startAt || !endAt || startAt.getTime() < Date.now()) throw new HttpsError("failed-precondition", "This requested time has passed. Ask the client to choose another time.");
    const existing = await transaction.get(db.collection("appointments")
      .where("providerId", "==", providerId)
      .where("startAt", "<", Timestamp.fromDate(endAt)));
    const collision = existing.docs.some((doc) => {
      const item = doc.data();
      const existingStart = item.startAt?.toDate?.()?.getTime?.() || 0;
      const existingEnd = item.endAt?.toDate?.()?.getTime?.() || 0;
      return item.status !== "cancelled" && existingStart < endAt.getTime() && existingEnd > startAt.getTime();
    });
    if (collision) throw new HttpsError("already-exists", "That time conflicts with another session. Offer a different time instead.");
    transaction.create(appointmentRef, {
      clientId: data.clientId,
      providerId,
      startAt: Timestamp.fromDate(startAt),
      endAt: Timestamp.fromDate(endAt),
      status: "scheduled",
      ...sessionDetails,
      note: data.note || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    transaction.update(requestRef, {
      status: "accepted",
      responseMessage: responseMessage || "Your practitioner accepted the requested time.",
      appointmentId: appointmentRef.id,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { status: "accepted", appointmentId: appointmentRef.id, clientId: data.clientId, newlyResponded: true };
  });
  if (outcome.newlyResponded) {
    const eventCode = decision === "accept" ? "session_request_accepted" : "session_request_declined";
    await recordTrustedSupportActivity([
      { uid: providerId, feature: "sessions", eventCode },
      { uid: outcome.clientId, feature: "sessions", eventCode },
    ]);
  }
  return { ok: true, status: outcome.status, appointmentId: outcome.appointmentId };
});

exports.listProviderClients = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const providerId = await requireProvider(request);
  const snapshot = await db.collection("clientProviderAssignments")
    .where("providerId", "==", providerId)
    .where("status", "==", "active")
    .limit(500)
    .get();
  return {
    assignments: snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        clientId: data.clientId,
        providerId: data.providerId,
        orgId: data.orgId || null,
        relationshipType: data.relationshipType || "primary",
        status: data.status || "active",
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null,
      };
    }),
  };
});

function asDate(value, field) {
  const date = value instanceof Timestamp ? value.toDate() : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new HttpsError("invalid-argument", `${field} is not a valid date.`);
  return date;
}

function cleanSessionDetails(sessionFormat = "in-person", meetingLink = "") {
  if (!["in-person", "video", "wellnesscafe-video"].includes(sessionFormat)) {
    throw new HttpsError("invalid-argument", "Choose an in-person or video session.");
  }
  if (["in-person", "wellnesscafe-video"].includes(sessionFormat)) {
    if (meetingLink) throw new HttpsError("invalid-argument", "Remove the external video link for this session format.");
    if (sessionFormat === "wellnesscafe-video" && process.env.WELLNESSCAFE_VIDEO_ENABLED !== "true") {
      throw new HttpsError("failed-precondition", "WellnessCafe private rooms are not enabled for this environment yet.");
    }
    return { sessionFormat, meetingLink: null };
  }
  if (typeof meetingLink !== "string" || !meetingLink.trim() || meetingLink.length > 2048) {
    throw new HttpsError("invalid-argument", "Add a video meeting link before scheduling an online session.");
  }
  let parsed;
  try { parsed = new URL(meetingLink.trim()); } catch { throw new HttpsError("invalid-argument", "Enter a valid HTTPS video meeting link."); }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || !parsed.hostname.includes(".")) {
    throw new HttpsError("invalid-argument", "Video meeting links must use HTTPS and must not contain a username or password.");
  }
  return { sessionFormat, meetingLink: parsed.toString() };
}

async function hasAppointmentCollision(transaction, providerId, startAt, endAt, excludeId = "") {
  const snapshot = await transaction.get(db.collection("appointments")
    .where("providerId", "==", providerId)
    .where("startAt", "<", Timestamp.fromDate(endAt)));
  return snapshot.docs.some((doc) => {
    if (doc.id === excludeId) return false;
    const item = doc.data();
    const existingStart = item.startAt?.toDate?.()?.getTime?.() || 0;
    const existingEnd = item.endAt?.toDate?.()?.getTime?.() || 0;
    return item.status !== "cancelled" && existingStart < endAt.getTime() && existingEnd > startAt.getTime();
  });
}

function serialize(doc) {
  const data = doc.data();
  const request = data.changeRequest && typeof data.changeRequest === "object" ? data.changeRequest : null;
  return {
    id: doc.id,
    clientId: data.clientId,
    providerId: data.providerId,
    orgId: data.orgId || null,
    startAt: data.startAt?.toDate?.()?.toISOString?.() || null,
    endAt: data.endAt?.toDate?.()?.toISOString?.() || null,
    status: data.status || "scheduled",
    sessionFormat: data.sessionFormat || "in-person",
    meetingLink: data.meetingLink || "",
    note: data.note || "",
    changeRequest: request ? {
      status: request.status || "pending",
      message: request.message || "",
      requestedAt: request.requestedAt?.toDate?.()?.toISOString?.() || null,
      responseMessage: request.responseMessage || "",
    } : null,
  };
}

exports.listProviderAppointments = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const providerId = await requireProvider(request);
  const from = request.data?.from ? asDate(request.data.from, "Start date") : new Date();
  const until = request.data?.to ? asDate(request.data.to, "End date") : new Date(from.getTime() + 90 * 24 * 60 * 60 * 1000);
  if (until <= from) throw new HttpsError("invalid-argument", "Choose an end date after the start date.");

  const snapshot = await db.collection("appointments")
    .where("providerId", "==", providerId)
    .where("startAt", ">=", Timestamp.fromDate(from))
    .where("startAt", "<=", Timestamp.fromDate(until))
    .orderBy("startAt", "asc")
    .limit(250)
    .get();
  return { appointments: snapshot.docs.map(serialize).filter((item) => item.status !== "cancelled") };
});

exports.listMyUpcomingAppointments = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid || request.auth.token.firebase?.sign_in_provider === "anonymous") {
    throw new HttpsError("unauthenticated", "Sign in to view appointments booked for you.");
  }
  const now = new Date();
  const snapshot = await db.collection("appointments")
    .where("clientId", "==", uid)
    .where("status", "in", ["scheduled", "confirmed"])
    .where("startAt", ">=", Timestamp.fromDate(now))
    .orderBy("startAt", "asc")
    .limit(250)
    .get();
  const upcoming = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      providerId: data.providerId,
      startAt: data.startAt?.toDate?.()?.toISOString?.() || null,
      endAt: data.endAt?.toDate?.()?.toISOString?.() || null,
      status: data.status || "scheduled",
      sessionFormat: data.sessionFormat || "in-person",
      meetingLink: data.meetingLink || "",
      changeRequest: data.changeRequest && typeof data.changeRequest === "object" ? {
        status: data.changeRequest.status || "pending",
        message: data.changeRequest.message || "",
        requestedAt: data.changeRequest.requestedAt?.toDate?.()?.toISOString?.() || null,
        responseMessage: data.changeRequest.responseMessage || "",
      } : null,
    };
  });

  const providers = await Promise.all([...new Set(upcoming.map((item) => item.providerId).filter(Boolean))]
    .map(async (providerId) => {
      const profile = await db.collection("realHelpProviders").doc(providerId).get();
      return [providerId, profile.exists ? (profile.get("name") || "Your practitioner") : "Your practitioner"];
    }));
  const names = new Map(providers);
  return {
    appointments: upcoming.map(({ providerId, ...item }) => ({ ...item, practitionerName: names.get(providerId) || "Your practitioner" })),
  };
});

exports.respondToMyAppointment = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid || request.auth.token.firebase?.sign_in_provider === "anonymous") {
    throw new HttpsError("unauthenticated", "Sign in to respond to an appointment.");
  }
  const appointmentId = typeof request.data?.appointmentId === "string" ? request.data.appointmentId.trim() : "";
  if (!appointmentId) throw new HttpsError("invalid-argument", "Choose an appointment.");
  const ref = db.collection("appointments").doc(appointmentId);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists || snapshot.get("clientId") !== uid) {
      throw new HttpsError("not-found", "This appointment is not available in your schedule.");
    }
    const current = snapshot.data();
    // A retry after a lost response returns the saved state as success.
    if (current.status === "confirmed") return { ok: true, status: "confirmed" };
    if (current.status !== "scheduled") {
      throw new HttpsError("failed-precondition", "This appointment no longer needs a response.");
    }
    if (!current.startAt?.toDate || current.startAt.toDate().getTime() <= Date.now()) {
      throw new HttpsError("failed-precondition", "This appointment has already started or passed.");
    }
    transaction.update(ref, {
      status: "confirmed",
      clientConfirmedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { ok: true, status: "confirmed" };
  });
});

exports.listAppointmentsForProviderClient = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const providerId = await requireProvider(request);
  const clientId = typeof request.data?.clientId === "string" ? request.data.clientId.trim() : "";
  if (!clientId) throw new HttpsError("invalid-argument", "Choose a client.");
  const assignment = await db.collection("clientProviderAssignments")
    .where("providerId", "==", providerId)
    .where("clientId", "==", clientId)
    .where("status", "==", "active")
    .limit(1)
    .get();
  if (assignment.empty) throw new HttpsError("permission-denied", "You can only view appointments for a client currently assigned to you.");
  const from = request.data?.from ? asDate(request.data.from, "Start date").getTime() : Date.now();
  const to = request.data?.to ? asDate(request.data.to, "End date").getTime() : Number.POSITIVE_INFINITY;
  if (to <= from) throw new HttpsError("invalid-argument", "Choose an end date after the start date.");
  const snapshot = await db.collection("appointments")
    .where("providerId", "==", providerId)
    .where("clientId", "==", clientId)
    .limit(250)
    .get();
  const appointments = snapshot.docs.map(serialize)
    .filter((item) => item.status !== "cancelled" && item.startAt
      && new Date(item.startAt).getTime() >= from && new Date(item.startAt).getTime() <= to)
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
  return { appointments };
});

exports.requestAppointmentChange = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const uid = request.auth?.uid;
  if (!uid || request.auth.token.firebase?.sign_in_provider === "anonymous") {
    throw new HttpsError("unauthenticated", "Sign in to contact your practitioner about an appointment.");
  }
  const appointmentId = typeof request.data?.appointmentId === "string" ? request.data.appointmentId.trim() : "";
  const message = typeof request.data?.message === "string" ? request.data.message.trim() : "";
  if (!appointmentId) throw new HttpsError("invalid-argument", "Choose an appointment.");
  if (message.length > 240) throw new HttpsError("invalid-argument", "Keep your note under 240 characters.");
  const ref = db.collection("appointments").doc(appointmentId);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists || snapshot.get("clientId") !== uid) {
      throw new HttpsError("not-found", "This appointment is not available in your schedule.");
    }
    const current = snapshot.data();
    if (!["scheduled", "confirmed"].includes(current.status) || !current.startAt?.toDate || current.startAt.toDate().getTime() <= Date.now()) {
      throw new HttpsError("failed-precondition", "This appointment can no longer be changed from your schedule.");
    }
    if (current.changeRequest?.status === "pending") {
      if (current.changeRequest.requestedBy === uid) return { ok: true, status: "pending", alreadyPending: true };
      throw new HttpsError("already-exists", "You already have a time-change request waiting for a response.");
    }
    transaction.update(ref, {
      changeRequest: {
        status: "pending",
        message,
        requestedBy: uid,
        requestedAt: FieldValue.serverTimestamp(),
        responseMessage: "",
      },
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { ok: true, status: "pending" };
  });
});

exports.respondToAppointmentChangeRequest = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const providerId = await requireProvider(request);
  const appointmentId = typeof request.data?.appointmentId === "string" ? request.data.appointmentId.trim() : "";
  const decision = request.data?.decision;
  if (!appointmentId) throw new HttpsError("invalid-argument", "Choose an appointment.");
  if (!['decline'].includes(decision)) throw new HttpsError("invalid-argument", "Choose a valid response.");
  const responseMessage = typeof request.data?.responseMessage === "string" ? request.data.responseMessage.trim() : "";
  if (responseMessage.length > 240) throw new HttpsError("invalid-argument", "Keep your response under 240 characters.");
  const ref = db.collection("appointments").doc(appointmentId);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists || snapshot.get("providerId") !== providerId) {
      throw new HttpsError("not-found", "This appointment is not available in your schedule.");
    }
    const current = snapshot.data();
    if (current.changeRequest?.status === "declined") return { ok: true, status: "declined", alreadyResponded: true };
    if (current.changeRequest?.status !== "pending") {
      throw new HttpsError("failed-precondition", "There is no open time-change request for this appointment.");
    }
    transaction.update(ref, {
      "changeRequest.status": "declined",
      "changeRequest.responseMessage": responseMessage || "The current time remains scheduled. Please contact your practitioner if you would like to discuss another option.",
      "changeRequest.respondedAt": FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { ok: true, status: "declined" };
  });
});

exports.createProviderAppointment = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const providerId = await requireProvider(request);
  const { clientId, note = "" } = request.data || {};
  if (typeof clientId !== "string" || !clientId.trim()) throw new HttpsError("invalid-argument", "Choose a client.");
  const startAt = asDate(request.data?.startAt, "Start time");
  const endAt = asDate(request.data?.endAt, "End time");
  const now = Date.now();
  if (startAt.getTime() < now - 60_000) throw new HttpsError("invalid-argument", "Choose a future start time.");
  if (endAt <= startAt || endAt.getTime() - startAt.getTime() > 4 * 60 * 60 * 1000) {
    throw new HttpsError("invalid-argument", "Choose an end time after the start, within four hours.");
  }
  if (typeof note !== "string" || note.length > 300) throw new HttpsError("invalid-argument", "Keep the appointment note under 300 characters.");
  const sessionDetails = cleanSessionDetails(request.data?.sessionFormat || "in-person", request.data?.meetingLink || "");

  const appointmentRef = db.collection("appointments").doc();
  await db.runTransaction(async (transaction) => {
    const assignment = await transaction.get(db.collection("clientProviderAssignments")
      .where("providerId", "==", providerId)
      .where("clientId", "==", clientId.trim())
      .where("status", "==", "active")
      .limit(1));
    if (assignment.empty) throw new HttpsError("permission-denied", "You can only schedule for a client currently assigned to you.");
    if (await hasAppointmentCollision(transaction, providerId, startAt, endAt)) {
      throw new HttpsError("already-exists", "You already have an appointment during that time.");
    }
    transaction.create(appointmentRef, {
      clientId: clientId.trim(),
      providerId,
      orgId: request.data?.orgId || null,
      startAt: Timestamp.fromDate(startAt),
      endAt: Timestamp.fromDate(endAt),
      status: "scheduled",
      ...sessionDetails,
      note: note.trim() || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
  return { appointmentId: appointmentRef.id };
});

exports.updateProviderAppointment = onCall({ region: REGION, enforceAppCheck: true }, async (request) => {
  const providerId = await requireProvider(request);
  const appointmentId = typeof request.data?.appointmentId === "string" ? request.data.appointmentId.trim() : "";
  if (!appointmentId) throw new HttpsError("invalid-argument", "Choose an appointment to update.");
  const ref = db.collection("appointments").doc(appointmentId);
  const status = request.data?.status;
  if (status !== undefined && !["cancelled", "completed"].includes(status)) {
    throw new HttpsError("invalid-argument", "Choose a valid appointment status.");
  }
  const movingTime = request.data?.startAt !== undefined || request.data?.endAt !== undefined;
  const startAt = movingTime ? asDate(request.data?.startAt, "Start time") : null;
  const endAt = movingTime ? asDate(request.data?.endAt, "End time") : null;
  if (movingTime) {
    if (startAt.getTime() < Date.now() - 60_000) throw new HttpsError("invalid-argument", "Choose a future start time.");
    if (endAt <= startAt || endAt.getTime() - startAt.getTime() > 4 * 60 * 60 * 1000) {
      throw new HttpsError("invalid-argument", "Choose an end time after the start, within four hours.");
    }
  }
  if (request.data?.note !== undefined && (typeof request.data.note !== "string" || request.data.note.length > 300)) {
    throw new HttpsError("invalid-argument", "Keep the appointment note under 300 characters.");
  }

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists || snapshot.get("providerId") !== providerId) {
      throw new HttpsError("not-found", "This appointment is not available in your schedule.");
    }
    const current = snapshot.data();
    if (current.status === "cancelled") throw new HttpsError("failed-precondition", "This appointment has already been cancelled.");
    const patch = { updatedAt: FieldValue.serverTimestamp() };
    if (request.data?.sessionFormat !== undefined || request.data?.meetingLink !== undefined) {
      const sessionDetails = cleanSessionDetails(
        request.data?.sessionFormat ?? current.sessionFormat ?? "in-person",
        request.data?.meetingLink ?? current.meetingLink ?? "",
      );
      patch.sessionFormat = sessionDetails.sessionFormat;
      patch.meetingLink = sessionDetails.meetingLink;
    }
    if (status !== undefined) patch.status = status;
    if (movingTime) {
      if (!["scheduled", "confirmed"].includes(current.status)) throw new HttpsError("failed-precondition", "Only upcoming appointments can be moved.");
      const activeAssignment = await transaction.get(db.collection("clientProviderAssignments")
        .where("providerId", "==", providerId)
        .where("clientId", "==", current.clientId)
        .where("status", "==", "active")
        .limit(1));
      if (activeAssignment.empty) throw new HttpsError("permission-denied", "You can reschedule only while this person is connected to your practice.");
      if (await hasAppointmentCollision(transaction, providerId, startAt, endAt, appointmentId)) {
        throw new HttpsError("already-exists", "You already have an appointment during that time.");
      }
      patch.startAt = Timestamp.fromDate(startAt);
      patch.endAt = Timestamp.fromDate(endAt);
      // A client confirmed the old time, not this newly offered one. Require a
      // fresh confirmation so both workspaces show the same pending response.
      if (current.status === "confirmed") patch.status = "scheduled";
      if (current.changeRequest?.status === "pending") {
        patch["changeRequest.status"] = "accepted";
        patch["changeRequest.responseMessage"] = "Your practitioner updated the session time.";
        patch["changeRequest.respondedAt"] = FieldValue.serverTimestamp();
      }
    }
    if (request.data?.note !== undefined) patch.note = request.data.note.trim() || null;
    if (Object.keys(patch).length === 1) throw new HttpsError("invalid-argument", "Choose a change to save.");
    transaction.update(ref, patch);
    return { ok: true, status: patch.status || current.status };
  });
});
