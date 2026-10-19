const { SHARED_DATA_CAPABILITIES } = require("./practitionerWorkspacePolicy");
const { stagePractitionerAudit } = require("./practitionerAudit");

const OUTCOMES = new Set(["tried", "not-yet", "not-a-fit", "prefer-not-to-say"]);
const TOOL_ID = /^[a-z0-9][a-z0-9._-]{0,79}$/i;

function normalizeWitnessRequest(input = {}) {
  const clientId = typeof input.clientId === "string" ? input.clientId.trim() : "";
  if (!clientId || clientId.length > 160 || clientId.includes("/")) {
    const error = new Error("Choose an active client connection first.");
    error.code = "INVALID_WITNESS_CLIENT";
    throw error;
  }
  return { clientId };
}

function numericValue(value) {
  return Number.isFinite(value) && value >= 0 && value <= 10 ? value : null;
}

function toDay(value) {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  return date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : null;
}

function buildMetricSnapshot(rows, scopes) {
  const definitions = [
    ...(scopes.recoveryProgress ? [["cravingIntensity", "Craving intensity"], ["triggerIntensity", "Trigger intensity"]] : []),
    ...(scopes.wellnessPatterns ? [["energy", "Energy"], ["stress", "Stress"], ["sleep", "Sleep"]] : []),
  ];
  return definitions.flatMap(([key, label]) => {
    const series = rows.map((row) => ({ value: numericValue(row[key]), date: toDay(row.date || row.timestamp) }))
      .filter((entry) => entry.value !== null)
      .reverse();
    if (series.length < 2) return [];
    const first = series[0];
    const latest = series[series.length - 1];
    return [{
      label,
      first: first.value,
      latest: latest.value,
      change: latest.value - first.value,
      firstDate: first.date,
      latestDate: latest.date,
      entries: series.length,
    }];
  });
}

function buildPracticeSnapshot(docs) {
  const totals = new Map();
  for (const doc of docs) {
    const data = doc.data();
    if (typeof data.toolId !== "string" || !TOOL_ID.test(data.toolId) || !OUTCOMES.has(data.outcome)) continue;
    const current = totals.get(data.toolId) || { toolId: data.toolId, tried: 0, notYet: 0, notFit: 0, preferNot: 0 };
    if (data.outcome === "tried") current.tried += 1;
    if (data.outcome === "not-yet") current.notYet += 1;
    if (data.outcome === "not-a-fit") current.notFit += 1;
    if (data.outcome === "prefer-not-to-say") current.preferNot += 1;
    totals.set(data.toolId, current);
  }
  return [...totals.values()].slice(0, 8);
}

async function loadWitnessSnapshot({ db, providerScheduling, request, clientId }) {
  const practitionerId = await providerScheduling.requireProviderCapability(request, "client.shared_overview.read");
  return db.runTransaction(async (transaction) => {
    await providerScheduling.requireProviderCapabilityInTransaction(transaction, request, "client.shared_overview.read");
    const { capabilities } = await providerScheduling.getProviderCapabilitiesForRequest(request, transaction);
    const allowedScopes = Object.fromEntries(Object.entries(SHARED_DATA_CAPABILITIES)
      .map(([key, capability]) => [key, capabilities.has(capability)]));
    const [assignment, share, settings] = await Promise.all([
      transaction.get(db.collection("clientProviderAssignments").where("clientId", "==", clientId).where("providerId", "==", practitionerId).where("status", "==", "active").limit(1)),
      transaction.get(db.collection("client_practitioner_shares").doc(`${clientId}_${practitionerId}`)),
      transaction.get(db.doc("admin/systemSettings")),
    ]);
    if (assignment.empty) {
      const error = new Error("This person is not in your active connections.");
      error.code = "WITNESS_CONNECTION_REQUIRED";
      throw error;
    }
    if (settings.data()?.settings?.features?.sessionSharing === false) {
      const error = new Error("Client sharing is temporarily paused.");
      error.code = "WITNESS_SHARING_PAUSED";
      throw error;
    }
    const assignmentId = assignment.docs[0].id;
    const scopes = share.exists && (!share.get("assignmentId") || share.get("assignmentId") === assignmentId)
      ? share.get("scopes") || {} : {};
    const visible = Object.fromEntries(Object.keys(SHARED_DATA_CAPABILITIES)
      .map((key) => [key, scopes[key] === true && allowedScopes[key] === true]));
    const canReadCheckins = visible.recoveryProgress || visible.wellnessPatterns;
    const canReadPractice = visible.practiceProgress === true;
    const [checkins, practice] = await Promise.all([
      canReadCheckins
        ? transaction.get(db.collection("checkins").where("userId", "==", clientId).orderBy("timestamp", "desc").limit(14))
        : Promise.resolve({ docs: [] }),
      canReadPractice
        ? transaction.get(db.collection("client_practitioner_practice_updates").where("practitionerId", "==", practitionerId).where("clientId", "==", clientId).orderBy("submittedAt", "desc").limit(30))
        : Promise.resolve({ docs: [] }),
    ]);
    const metrics = buildMetricSnapshot(checkins.docs.map((doc) => doc.data()), visible);
    const practices = buildPracticeSnapshot(practice.docs);
    stagePractitionerAudit(transaction, db, {
      action: "witness.shared_timeline.read",
      actorUid: practitionerId,
      clientUid: clientId,
      practitionerUid: practitionerId,
      recordIds: [...checkins.docs.map((doc) => doc.id), ...practice.docs.map((doc) => doc.id)],
      fields: [
        ...(visible.recoveryProgress ? ["recoveryProgress"] : []),
        ...(visible.wellnessPatterns ? ["wellnessPatterns"] : []),
        ...(practices.length ? ["practiceProgress"] : []),
      ],
      resultCount: metrics.length + practices.length,
    });
    if (!metrics.length && !practices.length) {
      return {
        available: false,
        message: "There are not enough client-shared numeric check-ins or practice updates to prepare a timeline yet.",
      };
    }
    return {
      available: true,
      source: "client-shared information only",
      note: "Recorded values and practice choices are shown without interpreting clinical meaning or risk.",
      metrics,
      practiceOutcomes: practices,
    };
  });
}

module.exports = { normalizeWitnessRequest, buildMetricSnapshot, buildPracticeSnapshot, loadWitnessSnapshot };
