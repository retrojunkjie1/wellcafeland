// src/admin/panels/FeatureFlagsPanel.jsx
import React, { useState, useEffect } from "react";
import { collection, doc, getDocs, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export function FeatureFlagsPanel() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const colRef = collection(db, "feature_flags");
        const snapshot = await getDocs(colRef);
        const flagsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFlags(flagsList);
        setError(null);
      } catch (err) {
        console.error("Error loading feature_flags:", err);
        // Check if collection doesn't exist (permission denied)
        if (err.code === "permission-denied" || err.message.includes("Missing or insufficient permissions")) {
          setError("permission-denied");
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleFlag = async (flagId, currentValue) => {
    try {
      const docRef = doc(db, "feature_flags", flagId);
      await setDoc(docRef, { enabled: !currentValue }, { merge: true });
      setFlags((prev) =>
        prev.map((f) => (f.id === flagId ? { ...f, enabled: !currentValue } : f))
      );
    } catch (err) {
      console.error("Error toggling flag:", err);
      alert("Failed to toggle flag: " + err.message);
    }
  };

  if (loading) {
    return <div className="text-sm text-white/60 p-4">Loading flags…</div>;
  }

  if (error === "permission-denied") {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 p-4">
          <h3 className="text-sm font-semibold text-amber-200 mb-2">
            Feature flags are file-based
          </h3>
          <p className="text-xs text-white/70">
            Feature flags are currently managed in <code className="text-amber-300">src/config/featureFlags.js</code>.
            To enable Firestore-based flags, create a <code className="text-amber-300">feature_flags</code> collection
            in Firestore with appropriate security rules.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">
        Error: {error}
      </div>
    );
  }

  if (flags.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/70">
            No feature flags found. Create documents in the <code className="text-amber-300">feature_flags</code> collection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white mb-2">Feature Flags</h2>
        <p className="text-xs text-white/60 mb-4">
          Toggle feature flags. Changes are saved immediately.
        </p>
      </div>
      <div className="space-y-2">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
          >
            <div>
              <div className="text-sm font-medium text-white">{flag.id}</div>
              {flag.description && (
                <div className="mt-1 text-xs text-white/60">{flag.description}</div>
              )}
            </div>
            <button
              type="button"
              onClick={() => toggleFlag(flag.id, flag.enabled)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                flag.enabled
                  ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20"
                  : "border border-white/20 bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {flag.enabled ? "Enabled" : "Disabled"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

