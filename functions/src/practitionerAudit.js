const admin = require("firebase-admin");

const COLLECTION = "practitioner_data_access_audit";

/**
 * Stage an append-only, content-free audit event in the same transaction as
 * the protected action. Never pass client-authored text into this event.
 */
function practitionerAuditEvent(event) {
  const allowedFields = new Set(["visitPurpose", "priorities", "questions", "accessPreferences", "needType", "goal", "context", "preferredTiming", "contactPreference", "recoveryProgress", "wellnessPatterns", "practiceProgress", "assessments", "writtenReflections"]);
  const fields = Array.isArray(event.fields)
    ? [...new Set(event.fields.filter((field) => allowedFields.has(field)))].slice(0, allowedFields.size)
    : [];
  const recordIds = Array.isArray(event.recordIds)
    ? [...new Set(event.recordIds.filter((id) => typeof id === "string" && id.length <= 140))].slice(0, 30)
    : [];
  const scopeChanges = Array.isArray(event.scopeChanges)
    ? event.scopeChanges.filter((change) => change && typeof change.scope === "string" && change.scope.length <= 80)
      .slice(0, 20).map(({ scope, enabled }) => ({ scope, enabled: enabled === true }))
    : [];

  return {
    schemaVersion: 1,
    action: String(event.action || "unknown").slice(0, 80),
    actorUid: String(event.actorUid || "").slice(0, 160),
    clientUid: String(event.clientUid || "").slice(0, 160),
    practitionerUid: typeof event.practitionerUid === "string" ? event.practitionerUid.slice(0, 160) : null,
    preparationId: typeof event.preparationId === "string" ? event.preparationId.slice(0, 140) : null,
    fields,
    recordIds,
    scopeChanges,
    statusChange: event.statusChange && typeof event.statusChange === "object" ? {
      from: String(event.statusChange.from || "").slice(0, 60),
      to: String(event.statusChange.to || "").slice(0, 60),
    } : null,
    resultCount: Number.isInteger(event.resultCount) ? Math.max(0, Math.min(event.resultCount, 30)) : null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
}

function stagePractitionerAudit(transaction, db, event) {
  const ref = db.collection(COLLECTION).doc();
  transaction.create(ref, practitionerAuditEvent(event));
  return ref.id;
}

module.exports = { COLLECTION, practitionerAuditEvent, stagePractitionerAudit };
