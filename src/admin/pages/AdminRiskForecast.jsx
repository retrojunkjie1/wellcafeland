// src/admin/pages/AdminRiskForecast.jsx
// Risk forecasting dashboard

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

export function AdminRiskForecast() {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecasts();
  }, []);

  const loadForecasts = async () => {
    try {
      setLoading(true);
      const riskRef = collection(db, "risk_forecast");
      const q = query(riskRef, orderBy("riskScore", "desc"), limit(50));
      const snapshot = await getDocs(q);
      
      const forecastsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setForecasts(forecastsList);
    } catch (err) {
      console.error("Failed to load risk forecasts:", err);
      setForecasts([]);
    } finally {
      setLoading(false);
    }
  };

  // Group predicted issues
  const allPredictedIssues = forecasts.flatMap((f) => 
    (f.predictedIssues || []).map((issue) => ({
      ...issue,
      uid: f.uid,
      email: f.email,
    }))
  );

  // Top predicted issues by probability
  const topIssues = [...allPredictedIssues]
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Risk Forecast</h2>

      {loading ? (
        <div className="text-sm text-white/60">Loading...</div>
      ) : (
        <>
          {/* Top 10 Highest Risk Users */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white">Top 10 Highest Risk Users</h3>
            {forecasts.length === 0 ? (
              <div className="text-sm text-white/60">No risk forecasts available</div>
            ) : (
              <div className="space-y-2">
                {forecasts.slice(0, 10).map((forecast) => (
                  <div
                    key={forecast.id}
                    className={`rounded-lg border p-4 ${
                      forecast.riskScore > 70
                        ? "border-red-400/30 bg-red-900/10"
                        : forecast.riskScore > 40
                        ? "border-yellow-400/30 bg-yellow-900/10"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {forecast.email || forecast.uid?.slice(0, 8) || "Unknown"}
                        </div>
                        <div className="text-xs text-white/60 mt-1">
                          {forecast.createdAt?.toDate?.()?.toLocaleString() || "Unknown time"}
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${
                        forecast.riskScore > 70
                          ? "text-red-400"
                          : forecast.riskScore > 40
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}>
                        {forecast.riskScore}
                      </div>
                    </div>
                    {forecast.reasons?.length > 0 && (
                      <ul className="text-xs text-white/70 space-y-1 mt-2">
                        {forecast.reasons.map((reason, i) => (
                          <li key={i}>• {reason}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Predicted Issues */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-white">Top Predicted Issues</h3>
            {topIssues.length === 0 ? (
              <div className="text-sm text-white/60">No predicted issues</div>
            ) : (
              <div className="space-y-2">
                {topIssues.map((issue, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {issue.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div className="text-xs text-white/60 mt-1">
                          User: {issue.email || issue.uid?.slice(0, 8) || "Unknown"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">
                          {(issue.probability * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-white/60">
                          {issue.windowMinutes}m window
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Interventions (Read-only for now) */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <h3 className="text-sm font-medium text-white mb-2">Suggested Interventions</h3>
            <p className="text-xs text-white/60">
              Intervention controls are read-only in this version. Future updates will allow admins to trigger:
            </p>
            <ul className="text-xs text-white/70 space-y-1 mt-2 list-disc list-inside">
              <li>Banner notifications for high-risk users</li>
              <li>Tool recommendations based on risk patterns</li>
              <li>Support prompts and outreach coordination</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

