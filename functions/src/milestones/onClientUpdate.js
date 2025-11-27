// functions/src/milestones/onClientUpdate.js

/**
 * Cloud Function: onClientUpdate
 * Triggers when a client document is updated
 * Tracks sober days, awards milestones, handles relapses
 */

const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");
const { computeDaysSober } = require("./computeDaysSober");
const {
  getEarnedMilestones,
  getMilestoneForDays,
  getRelapseMessage,
} = require("./milestoneConfig");

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

/**
 * Check if a milestone document already exists
 */
async function milestoneExists(clientId, milestoneDays) {
  try {
    const milestoneRef = db
      .collection("clients")
      .doc(clientId)
      .collection("milestones")
      .doc(String(milestoneDays));
    const doc = await milestoneRef.get();
    return doc.exists;
  } catch (err) {
    console.warn(`Failed to check milestone existence: ${err.message}`);
    return false;
  }
}

/**
 * Create a milestone document
 */
async function createMilestone(clientId, milestone, daysSober) {
  try {
    const milestoneRef = db
      .collection("clients")
      .doc(clientId)
      .collection("milestones")
      .doc(String(milestone.days));

    const milestoneData = {
      milestone: milestone.days,
      earnedAt: admin.firestore.FieldValue.serverTimestamp(),
      coinAssetPath: milestone.coinAssetPath,
      tier: milestone.tier,
      notifiedAdmin: false,
      daysSoberAtEarned: daysSober,
    };

    await milestoneRef.set(milestoneData);
    return milestoneData;
  } catch (err) {
    console.error(`Failed to create milestone: ${err.message}`);
    throw err;
  }
}

/**
 * Notify admin of a milestone achievement
 */
async function notifyAdmin(clientId, milestone) {
  try {
    const adminEventRef = db.collection("adminEvents").doc();
    await adminEventRef.set({
      type: "milestone_achieved",
      clientId,
      milestone: milestone.days,
      tier: milestone.tier,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
    });
  } catch (err) {
    console.warn(`Failed to notify admin: ${err.message}`);
    // Non-critical, don't throw
  }
}

/**
 * Handle relapse detection and recording
 */
async function handleRelapse(clientId, beforeData, afterData) {
  try {
    const beforeLastUse = beforeData?.lastUseAt;
    const afterLastUse = afterData?.lastUseAt;

    // Detect relapse: lastUseAt changed and is recent (within last 7 days)
    if (beforeLastUse && afterLastUse) {
      const beforeTime = beforeLastUse.toMillis
        ? beforeLastUse.toMillis()
        : beforeLastUse;
      const afterTime = afterLastUse.toMillis
        ? afterLastUse.toMillis()
        : afterLastUse;

      // If lastUseAt was updated to a more recent date, treat as relapse
      if (afterTime > beforeTime) {
        const daysSinceRelapse = Math.floor(
          (Date.now() - afterTime) / (1000 * 60 * 60 * 24)
        );

        // Only treat as relapse if it's recent (within last 7 days)
        if (daysSinceRelapse <= 7) {
          // Create relapse document
          const relapseRef = db
            .collection("clients")
            .doc(clientId)
            .collection("relapses")
            .doc();
          await relapseRef.set({
            occurredAt: afterLastUse,
            recordedAt: admin.firestore.FieldValue.serverTimestamp(),
            message: getRelapseMessage(),
            previousSoberStart: beforeData?.soberStart || null,
            previousSoberDays: computeDaysSober(beforeData?.soberStart) || 0,
          });

          // Update client document
          const clientRef = db.collection("clients").doc(clientId);
          await clientRef.update({
            relapseCount: admin.firestore.FieldValue.increment(1),
            soberStart: afterLastUse, // Reset to new start date
            lastRelapseAt: afterLastUse,
            relapseMessage: getRelapseMessage(),
          });

          // Notify admin
          const adminEventRef = db.collection("adminEvents").doc();
          await adminEventRef.set({
            type: "relapse_recorded",
            clientId,
            occurredAt: afterLastUse,
            previousSoberDays: computeDaysSober(beforeData?.soberStart) || 0,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
          });

          return true;
        }
      }
    }

    return false;
  } catch (err) {
    console.error(`Failed to handle relapse: ${err.message}`);
    return false;
  }
}

/**
 * Process milestones for a client
 */
async function processMilestones(clientId, daysSober) {
  if (!daysSober || daysSober < 0) {
    return;
  }

  try {
    const earnedMilestones = getEarnedMilestones(daysSober);
    const batch = db.batch();

    for (const milestone of earnedMilestones) {
      // Check if milestone already exists
      const exists = await milestoneExists(clientId, milestone.days);
      if (!exists) {
        // Create milestone document
        const milestoneRef = db
          .collection("clients")
          .doc(clientId)
          .collection("milestones")
          .doc(String(milestone.days));

        batch.set(milestoneRef, {
          milestone: milestone.days,
          earnedAt: admin.firestore.FieldValue.serverTimestamp(),
          coinAssetPath: milestone.coinAssetPath,
          tier: milestone.tier,
          notifiedAdmin: false,
          daysSoberAtEarned: daysSober,
        });

        // Notify admin (separate write, non-blocking)
        notifyAdmin(clientId, milestone).catch((err) => {
          console.warn(`Admin notification failed: ${err.message}`);
        });
      }
    }

    // Commit batch
    if (earnedMilestones.length > 0) {
      await batch.commit();
      console.log(
        `Processed ${earnedMilestones.length} milestone(s) for client ${clientId}`
      );
    }
  } catch (err) {
    console.error(`Failed to process milestones: ${err.message}`);
  }
}

/**
 * Main Cloud Function
 */
exports.onClientUpdate = onDocumentUpdated(
  {
    document: "clients/{clientId}",
    region: "us-central1",
  },
  async (event) => {
    const clientId = event.params.clientId;
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();

    try {
      // Check for relapse first
      const isRelapse = await handleRelapse(clientId, beforeData, afterData);

      // If relapse occurred, milestones will be recalculated on next update
      if (isRelapse) {
        console.log(`Relapse recorded for client ${clientId}`);
        return;
      }

      // Compute days sober
      const daysSober = computeDaysSober(afterData?.soberStart);

      // Update daysSober field if it changed
      if (daysSober !== null) {
        const beforeDays = computeDaysSober(beforeData?.soberStart);
        if (daysSober !== beforeDays) {
          await event.data.after.ref.update({
            daysSober,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      // Process milestones
      if (daysSober !== null && daysSober > 0) {
        await processMilestones(clientId, daysSober);
      }
    } catch (err) {
      console.error(`Error in onClientUpdate for ${clientId}:`, err);
      // Don't throw - Cloud Functions will retry if needed
    }
  }
);

