// src/admin/pages/AdminSystem.jsx
import React, { useState, useEffect } from "react";
import { httpsCallable, getFunctions } from "firebase/functions";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import app from "@/firebase";

export function AdminSystem() {
  const [featureFlags, setFeatureFlags] = useState({});
  const [systemSettings, setSystemSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Try admin/* collections first, fallback to system_settings/global
      const [flagsDoc, settingsDoc, systemDoc] = await Promise.all([
        getDoc(doc(db, "admin", "featureFlags")).catch(() => ({ exists: () => false })),
        getDoc(doc(db, "admin", "systemSettings")).catch(() => ({ exists: () => false })),
        getDoc(doc(db, "system_settings", "global")).catch(() => ({ exists: () => false })),
      ]);

      if (flagsDoc.exists()) {
        const flagsData = flagsDoc.data();
        setFeatureFlags(typeof flagsData === 'object' && flagsData !== null ? flagsData : {});
      }
      
      if (settingsDoc.exists()) {
        const settingsData = settingsDoc.data();
        setSystemSettings(typeof settingsData === 'object' && settingsData !== null ? settingsData : {});
      } else if (systemDoc.exists()) {
        // Fallback: use system_settings/global
        const systemData = systemDoc.data();
        const features = systemData.features?.flags || {};
        setFeatureFlags(features);
        // Extract system-level settings
        const sysSettings = {};
        Object.keys(systemData).forEach(key => {
          if (key !== 'features' && key !== 'theme' && key !== 'guardrails' && typeof systemData[key] !== 'object') {
            sysSettings[key] = systemData[key];
          }
        });
        setSystemSettings(sysSettings);
      }
    } catch (err) {
      console.error("[AdminSystem] Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateFeatureFlag = async (key, value) => {
    try {
      const functions = getFunctions(app);
      const adminUpdateFeatureFlags = httpsCallable(functions, "adminUpdateFeatureFlags");
      await adminUpdateFeatureFlags({
        patch: { [key]: value },
      });
      setFeatureFlags({ ...featureFlags, [key]: value });
    } catch (err) {
      console.error("Failed to update feature flag:", err);
    }
  };

  const updateSystemSetting = async (key, value) => {
    try {
      const functions = getFunctions(app);
      const adminUpdateSystemSettings = httpsCallable(functions, "adminUpdateSystemSettings");
      await adminUpdateSystemSettings({
        patch: { [key]: value },
      });
      setSystemSettings({ ...systemSettings, [key]: value });
    } catch (err) {
      console.error("Failed to update system setting:", err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">System</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-white mb-3">Feature Flags</h3>
          {loading ? (
            <div className="text-sm text-white/60">Loading...</div>
          ) : (
            <div className="space-y-2">
              {Object.entries(featureFlags).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div>
                    <div className="text-sm text-white">{key}</div>
                    <div className="text-xs text-white/60">
                      {typeof value === "boolean" ? (value ? "Enabled" : "Disabled") : String(value)}
                    </div>
                  </div>
                  {typeof value === "boolean" && (
                    <button
                      type="button"
                      onClick={() => updateFeatureFlag(key, !value)}
                      className={`rounded border px-3 py-1 text-xs transition ${
                        value
                          ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
                          : "border-white/15 bg-white/5 text-white/60"
                      }`}
                    >
                      {value ? "ON" : "OFF"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-white mb-3">System Settings</h3>
          {loading ? (
            <div className="text-sm text-white/60">Loading system settings...</div>
          ) : Object.keys(systemSettings).length === 0 ? (
            <div className="text-sm text-white/60">No system settings found. Create them in Firestore at /admin/systemSettings or /system_settings/global</div>
          ) : (
            <div className="space-y-2">
              {Object.entries(systemSettings).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div className="text-sm text-white mb-1">{key}</div>
                  <input
                    type="text"
                    value={String(value)}
                    onChange={(e) => updateSystemSetting(key, e.target.value)}
                    className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-sm text-white"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

