// src/admin/components/WhatChangedView.jsx
// Shows last 10 executed admin actions with rollback buttons

import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { httpsCallable, getFunctions } from "firebase/functions";
import { db } from "@/firebase";
import { getAuth } from "firebase/auth";
import app from "@/firebase";

export function WhatChangedView() {
  const auth = getAuth();
  const user = auth.currentUser;
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentActions();
  }, []);

  const loadRecentActions = async () => {
    try {
      setLoading(true);
      const actionsRef = collection(db, "admin_actions");
      const q = query(
        actionsRef,
        where("status", "==", "executed"),
        orderBy("executedAt", "desc"),
        limit(10)
      );
      const snapshot = await getDocs(q);
      setActions(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Failed to load recent actions:", err);
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRollback = async (action) => {
    if (!action.rollbackPayload || !confirm(`Rollback action: ${action.actionType || action.type}?`)) return;

    try {
      const functions = getFunctions(app);
      const adminExecuteAction = httpsCallable(functions, "adminExecuteAction");
      
      // Create rollback action
      const { addDoc, serverTimestamp } = await import("firebase/firestore");
      const rollbackActionRef = await addDoc(collection(db, "admin_actions"), {
        createdAt: serverTimestamp(),
        createdByUid: user.uid,
        createdByEmail: user.email,
        actionType: `rollback_${action.actionType || action.type}`,
        type: `rollback_${action.type}`,
        payload: action.rollbackPayload,
        rollbackPayload: action.payload,
        status: "pending",
      });

      await adminExecuteAction({ actionId: rollbackActionRef.id });
      await loadRecentActions();
    } catch (err) {
      console.error("Failed to rollback:", err);
      alert(`Failed: ${err.message}`);
    }
  };

  if (loading) {
    return <div className="text-xs text-white/60">Loading...</div>;
  }

  if (actions.length === 0) {
    return (
      <div className="text-xs text-white/60">
        No recent actions. View full audit log in Audit tab.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {actions.map((action) => (
        <div
          key={action.id}
          className="flex justify-between items-center p-2 rounded bg-white/5 text-xs"
        >
          <div className="flex-1">
            <div className="text-white">{action.actionType || action.type}</div>
            <div className="text-white/50">
              {action.createdByEmail || action.createdByUid} •{" "}
              {action.executedAt?.toDate?.()?.toLocaleString() || "Unknown"}
            </div>
          </div>
          {action.rollbackPayload && Object.keys(action.rollbackPayload).length > 0 && (
            <button
              type="button"
              onClick={() => handleRollback(action)}
              className="text-amber-300 hover:text-amber-200 text-xs"
            >
              Rollback
            </button>
          )}
        </div>
      ))}
      <div className="text-xs text-white/60 mt-2">
        <a href="/admin/audit" className="text-amber-300 hover:text-amber-200">
          View full audit log →
        </a>
      </div>
    </div>
  );
}

