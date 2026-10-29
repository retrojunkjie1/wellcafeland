/**
 * buildClinicalPlan — Clinical Formulation Engine entry point.
 * Callable function: validates input, stores answers, builds formulation + care plan, audits.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("./firebaseAdminCompat.cjs");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const { runEngine, createAuditEvent, hash } = require("./engine");

const ENGINE_VERSION = "wc_os_engine_v1";

function validateAndNormalizeInput(data) {
  if (!data || typeof data !== "object") {
    return { concerns: [], commitment: "medium", support: "some", rawText: "", freeText: "", safety: "" };
  }
  const concerns = Array.isArray(data.concerns) ? data.concerns.map(String).slice(0, 10) : [];
  const commitment = ["low", "medium", "high", "very_high"].includes(String(data.commitment).toLowerCase())
    ? String(data.commitment).toLowerCase()
    : "medium";
  const support = ["none", "some", "strong"].includes(String(data.support).toLowerCase())
    ? String(data.support).toLowerCase()
    : "some";
  const rawText = String(data.rawText || data.freeText || "").slice(0, 2000);
  const safety = String(data.safety || "").slice(0, 500);
  const traumaSensitive = Boolean(data.traumaSensitive);
  return { concerns, commitment, support, rawText, freeText: rawText, safety, traumaSensitive };
}

exports.buildClinicalPlan = onCall(
  {
    region: "us-central1",
    enforceAppCheck: true,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in to build your plan.");
    }

    const uid = request.auth.uid;
    if (request.auth.token?.firebase?.sign_in_provider === "anonymous") {
      throw new HttpsError("unauthenticated", "Sign in to save an account-owned plan. Guest support tools remain available.");
    }
    const answers = validateAndNormalizeInput(request.data);
    const requestId = typeof request.data?.requestId === "string" && /^[A-Za-z0-9_-]{20,80}$/.test(request.data.requestId)
      ? request.data.requestId
      : null;
    const sessionId = requestId
      ? `session_${uid}_${hash({ uid, requestId })}`
      : `session_${uid}_${Date.now()}`;
    const result = runEngine(answers, sessionId);
    const { formulation, risk, carePlan, summary, inputHash, outputHash } = result;
    const response = {
      ok: true,
      sessionId,
      summary: {
        headline: summary.headline,
        todayPriority: summary.todayPriority,
        focus: summary.focus,
        riskLevel: summary.riskLevel,
        escalationPhrase: summary.escalationPhrase,
        firstThree: summary.firstThree,
      },
      requiresEscalationScreen: result.requiresEscalationScreen,
      blocksCasualCoaching: result.blocksCasualCoaching,
    };

    const sessionRef = db.collection("assessmentSessions").doc(sessionId);
    if (requestId) {
      const existingSession = await sessionRef.get();
      if (existingSession.exists) {
        const saved = existingSession.data();
        if (saved.inputHash && saved.inputHash !== inputHash) {
          throw new HttpsError("failed-precondition", "This plan request was already used with different answers. Return to setup to start a new request.");
        }
        if (saved.planResponse?.ok) return saved.planResponse;
      }
    }

    const batch = db.batch();
    batch.set(sessionRef, {
      userId: uid,
      answers,
      inputHash,
      planResponse: response,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      engineVersion: ENGINE_VERSION,
    });

    const answersCol = sessionRef.collection("answers");
    for (const [qid, val] of Object.entries(answers)) {
      if (val !== undefined && val !== null) {
        batch.set(answersCol.doc(String(qid).replace(/[^a-zA-Z0-9_-]/g, "_")), { value: val });
      }
    }

    batch.set(db.collection("clinicalFormulations").doc(sessionId), {
      userId: uid,
      ...formulation,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    batch.set(db.collection("carePlans").doc(sessionId), {
      userId: uid,
      sessionId,
      formulationId: sessionId,
      firstThree: carePlan.firstThree,
      horizon72h: carePlan.horizon72h,
      itemCount: carePlan.items.length,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    for (const item of carePlan.items.slice(0, 50)) {
      batch.set(db.collection("carePlans").doc(sessionId).collection("items").doc(item.id), {
        ...item,
        createdAt: admin.firestore.Timestamp.fromDate(item.createdAt || new Date()),
      });
    }

    if (risk.level === "yellow" || risk.level === "orange" || risk.level === "red") {
      batch.set(db.collection("safetyFlags").doc(sessionId), {
        userId: uid,
        riskLevel: risk.level,
        drivers: risk.drivers,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    const auditEvent = createAuditEvent({
      type: "buildClinicalPlan",
      sessionId,
      engineVersion: ENGINE_VERSION,
      inputHash,
      outputHash,
      riskLevel: risk.level,
      pathway: formulation.recommendedPathways[0] || "stabilization",
      metadata: { itemCount: carePlan.items.length },
    });
    batch.set(db.collection("auditEvents").doc(`${sessionId}_buildClinicalPlan`), {
      ...auditEvent,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    try {
      await batch.commit();
    } catch (writeErr) {
      console.error("[buildClinicalPlan] Firestore batch failed:", writeErr?.code || "unknown");
      throw new HttpsError("unavailable", "Your plan could not be saved. Please retry.");
    }

    return response;
  }
);
