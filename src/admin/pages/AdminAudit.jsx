// src/admin/pages/AdminAudit.jsx
// Admin actions audit log

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { httpsCallable, getFunctions } from "firebase/functions";
import { db } from "@/firebase";
import app from "@/firebase";

export function AdminAudit() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = async () => {
    try {
      setLoading(true);
      const actionsRef = collection(db, "admin_actions");
      const q = query(actionsRef, orderBy("createdAt", "desc"), limit(100));
      const snapshot = await getDocs(q);
      setActions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Failed to load actions:", err);
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (action) => {
    if (!action.rollbackPayload || !confirm("Rollback this action?")) return;

    try {
      const functions = getFunctions(app);
      const adminExecuteAction = httpsCallable(functions, "adminExecuteAction");
      
      // Create rollback action
      const rollbackActionRef = await addDoc(collection(db, "admin_actions"), {
        createdAt: serverTimestamp(),
        createdByUid: action.createdByUid,
        createdByEmail: action.createdByEmail,
        actionType: `rollback_${action.actionType}`,
        payload: action.rollbackPayload,
        rollbackPayload: action.payload,
        status: "pending",
      });

      await adminExecuteAction({ actionId: rollbackActionRef.id });
      await loadActions();
    } catch (err) {
      console.error("Failed to rollback:", err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">Audit Log</h2>

      {loading ? (
        <div className="text-sm text-white/60">Loading...</div>
      ) : actions.length === 0 ? (
        <div className="text-sm text-white/60">No actions found</div>
      ) : (
        <div className="space-y-2">
          {actions.map((action) => (
            <div
              key={action.id}
              className="rounded-lg border border-white/10 bg-white/5 p-3 cursor-pointer hover:bg-white/10"
              onClick={() => setSelectedAction(action)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{action.actionType}</div>
                  <div className="text-xs text-white/60 mt-1">
                    {action.createdByEmail || action.createdByUid} • {action.createdAt?.toDate?.()?.toLocaleString() || "Unknown"}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  action.status === "executed" ? "bg-green-500/20 text-green-300" :
                  action.status === "failed" ? "bg-red-500/20 text-red-300" :
                  action.status === "rolled_back" ? "bg-yellow-500/20 text-yellow-300" :
                  "bg-white/10 text-white/70"
                }`}>
                  {action.status}
                </span>
              </div>
              {action.rollbackPayload && action.status === "executed" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRollback(action);
                  }}
                  className="mt-2 text-xs text-amber-300 hover:text-amber-200"
                >
                  Rollback
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Detail Modal */}
      {selectedAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">{selectedAction.actionType}</h3>
              <button
                type="button"
                onClick={() => setSelectedAction(null)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-white/60 mb-1">Status</div>
                <div className="text-white">{selectedAction.status}</div>
              </div>
              <div>
                <div className="text-white/60 mb-1">Created By</div>
                <div className="text-white">{selectedAction.createdByEmail || selectedAction.createdByUid}</div>
              </div>
              <div>
                <div className="text-white/60 mb-1">Payload</div>
                <pre className="text-xs text-white/80 bg-white/5 p-3 rounded overflow-auto max-h-40">
                  {JSON.stringify(selectedAction.payload, null, 2)}
                </pre>
              </div>
              {selectedAction.rollbackPayload && (
                <div>
                  <div className="text-white/60 mb-1">Rollback Payload</div>
                  <pre className="text-xs text-white/80 bg-white/5 p-3 rounded overflow-auto max-h-40">
                    {JSON.stringify(selectedAction.rollbackPayload, null, 2)}
                  </pre>
                </div>
              )}
              {selectedAction.error && (
                <div>
                  <div className="text-white/60 mb-1">Error</div>
                  <div className="text-red-300">{selectedAction.error}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

