// src/admin/pages/AdminOverrides.jsx
// Sovereign Overrides - publish/revert CSS/UI overrides

import React, { useState, useEffect } from "react";
import { doc, getDoc, collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { httpsCallable, getFunctions } from "firebase/functions";
import { db } from "@/firebase";
import { getAuth } from "firebase/auth";
import app from "@/firebase";

export function AdminOverrides() {
  const auth = getAuth();
  const user = auth.currentUser;
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardrails, setGuardrails] = useState({ allowDangerousActions: false });
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [pendingOverride, setPendingOverride] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load guardrails
      const settingsDoc = await getDoc(doc(db, "system_settings", "global"));
      if (settingsDoc.exists()) {
        setGuardrails(settingsDoc.data().guardrails || {});
      }

      // Load current override
      const currentDoc = await getDoc(doc(db, "overrides", "current"));
      if (currentDoc.exists()) {
        setCurrent(currentDoc.data());
      }

      // Load history
      const historyRef = collection(db, "overrides", "history");
      const historyQuery = query(historyRef, orderBy("updatedAt", "desc"), limit(20));
      const historySnapshot = await getDocs(historyQuery);
      setHistory(historySnapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Failed to load overrides:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!pendingOverride || !user) return;

    try {
      const functions = getFunctions(app);
      const adminExecuteAction = httpsCallable(functions, "adminExecuteAction");
      
      // Create action
      const actionRef = await addDoc(collection(db, "admin_actions"), {
        createdAt: serverTimestamp(),
        createdByUid: user.uid,
        createdByEmail: user.email,
        actionType: "publishOverride",
        payload: pendingOverride,
        rollbackPayload: current || {},
        status: "pending",
      });

      await adminExecuteAction({ actionId: actionRef.id });
      await loadData();
      setShowPublishConfirm(false);
      setPendingOverride(null);
    } catch (err) {
      console.error("Failed to publish override:", err);
    }
  };

  const handleRollback = async (historyEntry) => {
    if (!user) return;
    if (!confirm(`Rollback to version ${historyEntry.version}?`)) return;

    try {
      const functions = getFunctions(app);
      const adminExecuteAction = httpsCallable(functions, "adminExecuteAction");
      
      const actionRef = await addDoc(collection(db, "admin_actions"), {
        createdAt: serverTimestamp(),
        createdByUid: user.uid,
        createdByEmail: user.email,
        actionType: "rollbackOverride",
        payload: historyEntry,
        rollbackPayload: current || {},
        status: "pending",
      });

      await adminExecuteAction({ actionId: actionRef.id });
      await loadData();
    } catch (err) {
      console.error("Failed to rollback:", err);
    }
  };

  if (loading) {
    return <div className="text-sm text-white/60">Loading...</div>;
  }

  if (!guardrails.allowDangerousActions) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Overrides</h2>
        <div className="rounded-lg border border-amber-400/30 bg-amber-900/10 p-4">
          <div className="text-sm text-amber-200">Overrides disabled</div>
          <div className="text-xs text-amber-200/70 mt-1">
            Enable "Allow Dangerous Actions" in Control panel to use overrides.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Sovereign Overrides</h2>

      {/* Current Override */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h3 className="text-sm font-medium text-white mb-2">Current Override</h3>
        {current ? (
          <div className="space-y-2 text-xs">
            <div>Version: {current.version || "N/A"}</div>
            <div>Enabled: {current.enabled ? "Yes" : "No"}</div>
            {current.updatedBy && <div>Updated by: {current.updatedBy}</div>}
          </div>
        ) : (
          <div className="text-sm text-white/60">No override active</div>
        )}
      </div>

      {/* Edit Override */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
        <h3 className="text-sm font-medium text-white">Edit Override</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/60 mb-1 block">Enabled</label>
            <input
              type="checkbox"
              checked={pendingOverride?.enabled ?? current?.enabled ?? false}
              onChange={(e) => setPendingOverride({ ...pendingOverride, enabled: e.target.checked })}
              className="rounded"
            />
          </div>

          <div>
            <label className="text-xs text-white/60 mb-1 block">CSS Variables (allowlist only)</label>
            <textarea
              value={JSON.stringify(pendingOverride?.cssVars || current?.cssVars || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setPendingOverride({ ...pendingOverride, cssVars: parsed });
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white font-mono"
              rows={4}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setPendingOverride(current || { enabled: false, version: 1, cssVars: {}, uiPatch: { layout: {} }, killSwitches: {} });
              setShowPublishConfirm(true);
            }}
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
          >
            Publish Override
          </button>
        </div>
      </div>

      {/* History */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h3 className="text-sm font-medium text-white mb-2">History</h3>
        {history.length === 0 ? (
          <div className="text-sm text-white/60">No history</div>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => (
              <div key={entry.id} className="flex justify-between items-center p-2 rounded bg-white/5">
                <div className="text-xs text-white">
                  Version {entry.version} • {entry.updatedBy || "Unknown"} • {entry.updatedAt?.toDate?.()?.toLocaleString() || "Unknown"}
                </div>
                <button
                  type="button"
                  onClick={() => handleRollback(entry)}
                  className="text-xs text-amber-300 hover:text-amber-200"
                >
                  Rollback
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Publish Confirmation */}
      {showPublishConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">Confirm Publish</h3>
            <p className="text-sm text-white/70 mb-4">
              This will apply overrides system-wide. This action is audited and reversible.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePublish}
                className="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
              >
                Publish
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPublishConfirm(false);
                  setPendingOverride(null);
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

