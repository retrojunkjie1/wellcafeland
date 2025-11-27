// src/ai/predictive/predictiveRecoveryEngine.js

/**
 * Predictive Recovery Engine (PRE v1)
 * Main facade for predictive recovery analysis
 */

import { getClientTelemetryWindow } from "./predictiveDataAggregator";
import { computeRecoveryRisk } from "./predictiveRiskEngine";
import { generateWeeklySummary } from "./weeklySummaryEngine";
import { DEFAULT_ANALYSIS_WINDOW_DAYS } from "./predictiveConfig";

/**
 * Run predictive recovery engine for a client
 * @param {string} clientId - Client user ID
 * @param {object} options - Analysis options
 * @param {number} options.days - Number of days to analyze (default: 7)
 * @returns {Promise<object>} Predictive recovery analysis
 */
export async function runPredictiveRecoveryEngineForClient(clientId, options = {}) {
  try {
    if (!clientId) {
      return {
        clientId: null,
        riskScore: null,
        riskLevel: "insufficient_data",
        keyContributors: [],
        positiveSignals: [],
        negativeSignals: [],
        weeklySummary: {
          title: "Analysis Unavailable",
          summaryText: "Client ID is required for analysis.",
          keyHighlights: [],
          suggestedFocusAreas: [],
        },
        confidence: "low",
        error: "Missing client ID",
      };
    }

    const { days = DEFAULT_ANALYSIS_WINDOW_DAYS } = options;

    // Step 1: Aggregate telemetry window
    const telemetryWindow = await getClientTelemetryWindow(clientId, { days });

    // Step 2: Compute risk score
    const riskInfo = computeRecoveryRisk(telemetryWindow);

    // Step 3: Generate weekly summary
    const weeklySummary = generateWeeklySummary(telemetryWindow, riskInfo);

    return {
      clientId,
      riskScore: riskInfo.riskScore,
      riskLevel: riskInfo.riskLevel,
      keyContributors: riskInfo.keyContributors,
      positiveSignals: riskInfo.positiveSignals,
      negativeSignals: riskInfo.negativeSignals,
      weeklySummary,
      confidence: riskInfo.confidence,
      dataPoints: telemetryWindow.totalDataPoints,
      analysisWindow: {
        fromDate: telemetryWindow.fromDate,
        toDate: telemetryWindow.toDate,
        days,
      },
    };
  } catch (err) {
    console.warn("Predictive recovery engine failed (non-critical):", err.message);
    return {
      clientId,
      riskScore: null,
      riskLevel: "insufficient_data",
      keyContributors: [],
      positiveSignals: [],
      negativeSignals: [],
      weeklySummary: {
        title: "Analysis Unavailable",
        summaryText: "Unable to complete analysis at this time. Please try again later.",
        keyHighlights: [],
        suggestedFocusAreas: [],
      },
      confidence: "low",
      error: err.message,
    };
  }
}

/**
 * Batch analyze multiple clients
 * @param {string[]} clientIds - Array of client IDs
 * @param {object} options - Analysis options
 * @returns {Promise<Array>} Array of analysis results
 */
export async function batchAnalyzeClients(clientIds, options = {}) {
  try {
    if (!Array.isArray(clientIds) || clientIds.length === 0) {
      return [];
    }

    // Limit batch size for performance
    const limitedIds = clientIds.slice(0, 10);
    
    // Run analyses in parallel (but limit concurrency)
    const results = await Promise.all(
      limitedIds.map((clientId) =>
        runPredictiveRecoveryEngineForClient(clientId, options).catch((err) => {
          console.warn(`Batch analysis failed for client ${clientId}:`, err.message);
          return {
            clientId,
            riskScore: null,
            riskLevel: "insufficient_data",
            error: err.message,
          };
        })
      )
    );

    return results;
  } catch (err) {
    console.warn("Batch analysis failed (non-critical):", err.message);
    return [];
  }
}

