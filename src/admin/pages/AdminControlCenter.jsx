// src/admin/pages/AdminControlCenter.jsx
// Control Center - Feature flags, theme tokens, system settings with 2-step approval

import React, { useState, useEffect } from "react";
import { httpsCallable, getFunctions } from "firebase/functions";
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { getAuth } from "firebase/auth";
import app from "@/firebase";
import { WhatChangedView } from "../components/WhatChangedView";

export function AdminControlCenter() {
  const auth = getAuth();
  const user = auth.currentUser;
  const [featureFlags, setFeatureFlags] = useState({});
  const [themeTokens, setThemeTokens] = useState({});
  const [systemSettings, setSystemSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dangerZoneOpen, setDangerZoneOpen] = useState(false);
  const [guardrails, setGuardrails] = useState({ allowDangerousActions: false, requireTwoStep: true });

  const loadData = async () => {
    try {
      setLoading(true);
      const settingsDoc = await getDoc(doc(db, "system_settings", "global"));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setFeatureFlags(data.features?.flags || {});
        setThemeTokens(data.theme?.tokens || {});
        setSystemSettings(data);
        setGuardrails(data.guardrails || { allowDangerousActions: false, requireTwoStep: true });
      }
    } catch (err) {
      console.error("Failed to load system settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const proposeAction = async (type, target, payload, rollbackPayload) => {
    if (!user) return;

    try {
      const actionRef = await addDoc(collection(db, "admin_actions"), {
        createdAt: serverTimestamp(),
        createdByUid: user.uid,
        createdByEmail: user.email,
        type,
        target,
        payload,
        status: "proposed",
        rollbackPayload,
        reason: "",
      });

      setPendingAction({
        id: actionRef.id,
        type,
        target,
        payload,
        rollbackPayload,
      });
      setShowConfirm(true);
    } catch (err) {
      console.error("Failed to propose action:", err);
    }
  };

  const executeAction = async () => {
    if (!pendingAction || !user) return;

    try {
      const functions = getFunctions(app);
      const adminExecuteAction = httpsCallable(functions, "adminExecuteAction");
      await adminExecuteAction({ actionId: pendingAction.id });

      // Reload data
      await loadData();
      setShowConfirm(false);
      setPendingAction(null);
    } catch (err) {
      console.error("Failed to execute action:", err);
      alert(`Failed: ${err.message}`);
    }
  };

  const handleFlagToggle = (key) => {
    const newValue = !featureFlags[key];
    const rollback = { [key]: featureFlags[key] };
    proposeAction("SET_FEATURE_FLAG", "system", { [key]: newValue }, rollback);
  };

  const handleThemeTokenChange = (key, value) => {
    const rollback = { [key]: themeTokens[key] };
    proposeAction("SET_THEME_TOKEN", "system", { [key]: value }, rollback);
  };

  if (loading) {
    return <div className="text-sm text-white/60">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Control Center</h2>

      {/* Feature Flags */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white">Feature Flags</h3>
        {Object.keys(featureFlags).length === 0 ? (
          <p className="text-sm text-white/60">No feature flags configured</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(featureFlags).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg border border-white/10 bg-white/5">
                <span className="text-sm text-white">{key}</span>
                <button
                  type="button"
                  onClick={() => handleFlagToggle(key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? "bg-amber-500" : "bg-white/20"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Theme Tokens */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-white">Theme Tokens</h3>
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/60">Typography Scale</label>
            <input
              type="number"
              step="0.1"
              value={themeTokens.typographyScale || 1}
              onChange={(e) => handleThemeTokenChange("typographyScale", parseFloat(e.target.value))}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/60">Spacing Scale</label>
            <input
              type="number"
              step="0.1"
              value={themeTokens.spacingScale || 1}
              onChange={(e) => handleThemeTokenChange("spacingScale", parseFloat(e.target.value))}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs text-white/60">Card Radius</label>
            <input
              type="number"
              value={themeTokens.cardRadius || 12}
              onChange={(e) => handleThemeTokenChange("cardRadius", parseInt(e.target.value))}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
            />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-lg border border-red-400/30 bg-red-900/10 p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-red-300">Danger Zone</h3>
          <button
            type="button"
            onClick={() => setDangerZoneOpen(!dangerZoneOpen)}
            className="text-xs text-red-300/70 hover:text-red-300"
          >
            {dangerZoneOpen ? "Hide" : "Show"}
          </button>
        </div>
        {dangerZoneOpen && (
          <div className="space-y-3 mt-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white">Allow Dangerous Actions</div>
                <div className="text-xs text-white/60 mt-1">
                  When enabled, overrides and high-risk actions are available.
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!guardrails.allowDangerousActions && !confirm("Enable dangerous actions? This requires 2-step confirmation.")) return;
                  const newValue = !guardrails.allowDangerousActions;
                  await proposeAction(
                    "SET_SYSTEM_SETTINGS",
                    "system",
                    { guardrails: { ...guardrails, allowDangerousActions: newValue } },
                    { guardrails }
                  );
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  guardrails.allowDangerousActions ? "bg-red-500" : "bg-white/20"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    guardrails.allowDangerousActions ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            {guardrails.allowDangerousActions && (
              <div className="text-xs text-red-300/70 bg-red-900/20 p-2 rounded">
                ⚠️ Dangerous actions are enabled. All actions are still audited and reversible.
              </div>
            )}
          </div>
        )}
      </div>

      {/* What Changed - Last 10 Actions */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h3 className="text-sm font-medium text-white mb-2">What Changed (Last 10 Actions)</h3>
        <WhatChangedView />
      </div>

      {/* Confirmation Modal */}
      {showConfirm && pendingAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Confirm Action</h3>
            <p className="text-sm text-white/70 mb-4">
              {guardrails.requireTwoStep 
                ? "This action requires 2-step confirmation. Click approve to execute. This will be logged in the audit trail."
                : "Are you sure you want to execute this action? This will be logged in the audit trail."}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={executeAction}
                className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
              >
                Approve & Execute
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setPendingAction(null);
                }}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

