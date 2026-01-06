// src/admin/pages/AdminDeploy.jsx
import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { APP_VERSION } from "@/config/version";
import { firebaseConfig } from "@/config/firebaseConfig";

export function AdminDeploy() {
  const [deployInfo, setDeployInfo] = useState(null);
  const [loading, setLoading] = useState(true);

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
    </div>
  );
}

