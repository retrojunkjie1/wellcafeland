// src/admin/pages/AdminDeploy.jsx
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { httpsCallable, getFunctions } from "firebase/functions";
import app from "@/firebase";
import { db } from "@/firebase";
import { APP_VERSION } from "@/config/version";
import { firebaseConfig } from "@/config/firebaseConfig";
import { callAiSession } from "@/services/aiSessionClient";

export function AdminDeploy() {
  const [deployInfo, setDeployInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionBuilderHealth, setSessionBuilderHealth] = useState(null);
  const [testingHealth, setTestingHealth] = useState(false);

  useEffect(() => {
    loadDeployInfo();
  }, []);

  const loadDeployInfo = async () => {
    try {
      const deployDoc = await getDoc(doc(db, "admin", "deploy"));
      if (deployDoc.exists()) {
        setDeployInfo(deployDoc.data());
      }
    } catch (err) {
      console.error("Failed to load deploy info:", err);
      setDeployInfo(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Deploy</h2>
      <p className="text-sm text-white/60">
        Deployment is managed manually via CLI. Use <code className="text-xs bg-white/10 px-1 py-0.5 rounded">firebase deploy</code> to deploy hosting and functions.
      </p>

      <div className="space-y-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60 mb-1">Expected Project ID</div>
          <div className="text-sm font-medium text-white">
            {firebaseConfig?.projectId || "N/A"}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/60 mb-1">Frontend Build Version</div>
          <div className="text-sm font-medium text-white">{APP_VERSION}</div>
        </div>

        {loading ? (
          <div className="text-sm text-white/60">Loading deploy info...</div>
        ) : deployInfo?.lastDeployAt ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60 mb-1">Last Backend Deploy (from Firestore)</div>
            <div className="text-sm font-medium text-white">
              {deployInfo.lastDeployAt?.toDate?.()?.toLocaleString() || "Unknown"}
            </div>
            <div className="text-xs text-white/40 mt-1">Note: This timestamp is manually updated after deployment.</div>
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60 mb-1">Last Deploy</div>
            <div className="text-sm text-white/60">No deploy info found in Firestore</div>
            <div className="text-xs text-white/40 mt-1">Deploy info must be manually recorded in /admin/deploy document.</div>
          </div>
        )}
      </div>

      {/* Dev-only: Session Builder Health Check */}
      {(import.meta.env.DEV || window.location.hostname === "localhost") && (
        <div className="mt-8 space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Session Builder Health Check</h3>
                <p className="text-xs text-white/60">Test the session generation function (dev only)</p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  setTestingHealth(true);
                  setSessionBuilderHealth(null);
                  try {
                    const correlationId = `health_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
                    const data = await callAiSession({
                      mode: "generate_session",
                      supportType: "grounding",
                      tone: "calm",
                      minutes: 5,
                      note: "Health check test",
                      correlationId,
                    });
                    
                    setSessionBuilderHealth({
                      ok: data.ok !== false,
                      hasSession: !!data.session,
                      hasMessage: !!data.message,
                      hasCorrelationId: !!data.correlationId,
                      correlationId: data.correlationId,
                      message: data.ok === false 
                        ? data.message?.text || data.error?.message || "Unknown error"
                        : "✅ Session builder is healthy",
                    });
                  } catch (err) {
                    const msg = err.code === "AUTH_REQUIRED" ? "Please sign in to continue." : err.message;
                    setSessionBuilderHealth({
                      ok: false,
                      message: `❌ Health check failed: ${msg}`,
                    });
                  } finally {
                    setTestingHealth(false);
                  }
                }}
                disabled={testingHealth}
                className="px-4 py-2 text-xs font-medium rounded border border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20 disabled:opacity-50 transition"
              >
                {testingHealth ? "Testing..." : "Test Session Builder"}
              </button>
            </div>

            {sessionBuilderHealth && (
              <div className={`rounded border p-3 text-xs ${
                sessionBuilderHealth.ok
                  ? "border-green-400/30 bg-green-400/10 text-green-200"
                  : "border-red-400/30 bg-red-400/10 text-red-200"
              }`}>
                <div className="font-medium mb-1">{sessionBuilderHealth.message}</div>
                {sessionBuilderHealth.correlationId && (
                  <div className="text-[10px] opacity-70 mt-1">Correlation ID: {sessionBuilderHealth.correlationId}</div>
                )}
                {sessionBuilderHealth.hasSession && (
                  <div className="text-[10px] opacity-70 mt-1">✓ Session object present</div>
                )}
                {sessionBuilderHealth.hasMessage && (
                  <div className="text-[10px] opacity-70 mt-1">✓ Standardized message present</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

