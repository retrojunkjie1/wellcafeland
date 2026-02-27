/**
 * Append-only event logger for engine decisions.
 */

const crypto = require("crypto");

function hash(obj) {
  const str = JSON.stringify(obj);
  return crypto.createHash("sha256").update(str).digest("hex").slice(0, 16);
}

function createAuditEvent({ type, sessionId, engineVersion, inputHash, outputHash, riskLevel, pathway, metadata = {} }) {
  return {
    type,
    createdAt: new Date(),
    sessionId: sessionId || null,
    engineVersion: engineVersion || "wc_os_engine_v1",
    inputHash: inputHash || null,
    outputHash: outputHash || null,
    riskLevel: riskLevel || null,
    pathway: pathway || null,
    metadata,
  };
}

module.exports = { hash, createAuditEvent };
