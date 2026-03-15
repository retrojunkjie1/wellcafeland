/**
 * buildClinicalPlan — Clinical Formulation Engine entry point.
 * Callable function: validates input, stores answers, builds formulation + care plan, audits.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

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
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in to build your plan.");
    }

    const uid = request.auth.uid;
    const sessionId = `session_${uid}_${Date.now()}`;
    const answers = validateAndNormalizeInput(request.data);

    let result;
    try {
      result = runEngine(answers, sessionId);
    } catch (err) {
      const fallbackAnswers = { concerns: [], commitment: "medium", support: "some", rawText: "", freeText: "", safety: "" };
      result = runEngine(fallbackAnswers, sessionId);
    }

    const { formulation, risk, carePlan, summary, inputHash, outputHash } = result;

    try {
      await db.collection("assessmentSessions").doc(sessionId).set({
        userId: uid,
        answers,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        engineVersion: ENGINE_VERSION,
      });

      const answersCol = db.collection("assessmentSessions").doc(sessionId).collection("answers");
      for (const [qid, val] of Object.entries(answers)) {
        if (val !== undefined && val !== null) {
          await answersCol.doc(String(qid).replace(/[^a-zA-Z0-9_-]/g, "_")).set({ value: val });
        }
      }

      await db.collection("clinicalFormulations").doc(sessionId).set({
        userId: uid,
        ...formulation,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await db.collection("carePlans").doc(sessionId).set({
        userId: uid,
        sessionId,
        formulationId: sessionId,
        firstThree: carePlan.firstThree,
        horizon72h: carePlan.horizon72h,
        itemCount: carePlan.items.length,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      for (const item of carePlan.items.slice(0, 50)) {
        await db.collection("carePlans").doc(sessionId).collection("items").doc(item.id).set({
          ...item,
          createdAt: admin.firestore.Timestamp.fromDate(item.createdAt || new Date()),
        });
      }

      if (risk.level === "yellow" || risk.level === "orange" || risk.level === "red") {
        await db.collection("safetyFlags").doc(sessionId).set({
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
      await db.collection("auditEvents").doc(`${sessionId}_${Date.now()}`).set({
        ...auditEvent,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (writeErr) {
      console.error("[buildClinicalPlan] Firestore write failed:", writeErr.message);
    }

    return {
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
  }
);
