// src/admin/pages/AdminProviderNetwork.jsx
// Provider Network management (God-Eye real operational power)

import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, serverTimestamp, Timestamp, writeBatch } from "firebase/firestore";
import { httpsCallable, getFunctions } from "firebase/functions";
import app from "@/firebase";
import { db } from "@/firebase";
import { useAdmin } from "@/auth/useAdmin";

const CATEGORIES = ["housing", "treatment", "detox", "funding", "food", "circles"];
const SUBTYPES = {
  housing: ["sober_living", "transitional_housing", "recovery_residence"],
  treatment: ["php", "iop", "residential"],
  detox: ["detox", "medical_detox"],
};

export function AdminProviderNetwork() {
  const { isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState("providers");
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importText, setImportText] = useState("");
  const [previewData, setPreviewData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("housing");
  const [seeding, setSeeding] = useState(false);
  const [seedConfirmCode, setSeedConfirmCode] = useState("");

  useEffect(() => {
    if (isAdmin) {
      loadProviders();
    }
  }, [isAdmin]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const colRef = collection(db, "realHelpProviders");
      const q = query(colRef, orderBy("updatedAt", "desc"));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));
      setProviders(docs);
    } catch (err) {
      console.error("Failed to load providers:", err);
    } finally {
      setLoading(false);
    }
  };

  const parseImportText = () => {
    const lines = importText.split("\n").filter(l => l.trim());
    const parsed = lines.map((line, idx) => {
      // Simple parsing: name, phone, email, address
      const parts = line.split(/\t|,|\|/).map(p => p.trim());
      return {
        id: `preview-${idx}`,
        name: parts[0] || "",
        phone: parts[1] || "",
        email: parts[2] || "",
        address: parts.slice(3).join(", ") || "",
        category: selectedCategory,
        verification: {
          status: "verified",
          source: "staff",
        },
      };
    });
    setPreviewData(parsed);
  };

  const saveProviders = async () => {
    try {
      // Firestore batch write (max 500 operations)
      const batch = writeBatch(db);
      const colRef = collection(db, "realHelpProviders");
      
      previewData.forEach((item) => {
        const docRef = doc(colRef);
        batch.set(docRef, {
          name: item.name,
          phone: item.phone || "",
          email: item.email || "",
          address: item.address || "",
          city: "",
          state: "",
          zip: "",
          website: "",
          category: item.category,
          subtype: null,
          tags: [],
          regionKey: "",
          verification: {
            status: "verified",
            source: "staff",
            verifiedAt: serverTimestamp(),
          },
          publicNotes: "",
          internalNotes: "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();
      setImportText("");
      setPreviewData([]);
      await loadProviders();
      alert(`Imported ${previewData.length} providers`);
    } catch (err) {
      console.error("Failed to save providers:", err);
      alert("Failed to save providers");
    }
  };

  const toggleVisibility = async (providerId, currentStatus) => {
    try {
      const docRef = doc(db, "realHelpProviders", providerId);
      await updateDoc(docRef, {
        verification: {
          status: currentStatus === "verified" ? "probation" : "verified",
        },
        updatedAt: serverTimestamp(),
      });
      await loadProviders();
    } catch (err) {
      console.error("Failed to update provider:", err);
    }
  };

  const getAgingDays = (verifiedAt) => {
    if (!verifiedAt) return null;
    const verified = verifiedAt.toDate ? verifiedAt.toDate() : new Date(verifiedAt);
    const days = Math.floor((Date.now() - verified.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleSeedVerifiedData = async () => {
    try {
      setSeeding(true);
      const functions = getFunctions(app);
      const seedFunction = httpsCallable(functions, "seedVerifiedProviders");
      
      // In production, require confirmation code
      const isProduction = window.location.hostname !== "localhost" && 
                          !window.location.hostname.includes("dev");
      
      const result = await seedFunction({
        confirmCode: isProduction ? seedConfirmCode : null,
      });
      
      if (result.data.success) {
        alert(`Seeded ${result.data.added} providers (${result.data.skipped} skipped)`);
        await loadProviders();
      } else {
        alert("Seed failed: " + (result.data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Seed error:", err);
      alert("Seed failed: " + (err.message || "Unknown error"));
    } finally {
      setSeeding(false);
      setSeedConfirmCode("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">Provider Network</h2>
          <p className="text-sm text-white/60">Manage verified recovery resources</p>
        </div>
        {/* Seed Verified Data Button (Admin-only) */}
        <div className="flex items-center gap-2">
          {(window.location.hostname !== "localhost" && !window.location.hostname.includes("dev")) && (
            <input
              type="text"
              placeholder="Confirmation code"
              value={seedConfirmCode}
              onChange={(e) => setSeedConfirmCode(e.target.value)}
              className="px-3 py-1.5 text-xs rounded border border-white/20 bg-white/5 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
            />
          )}
          <button
            type="button"
            onClick={handleSeedVerifiedData}
            disabled={seeding}
            className="px-4 py-2 text-xs font-medium rounded border border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {seeding ? "Seeding..." : "Seed Verified Data"}
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("providers")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "providers"
              ? "text-amber-200 border-b-2 border-amber-400"
              : "text-white/60 hover:text-white"
          }`}
        >
          Providers
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("import")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "import"
              ? "text-amber-200 border-b-2 border-amber-400"
              : "text-white/60 hover:text-white"
          }`}
        >
          Import
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("verification")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "verification"
              ? "text-amber-200 border-b-2 border-amber-400"
              : "text-white/60 hover:text-white"
          }`}
        >
          Verification
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("health")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "health"
              ? "text-amber-200 border-b-2 border-amber-400"
              : "text-white/60 hover:text-white"
          }`}
        >
          Health
        </button>
      </div>

      {activeTab === "providers" && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-sm text-white/60">Loading providers...</div>
          ) : providers.length === 0 ? (
            <div className="text-sm text-white/60">No providers found. Use Import tab to add providers.</div>
          ) : (
            <div className="space-y-2">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="rounded-lg border border-white/10 bg-white/5 p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{provider.name}</div>
                    <div className="text-xs text-white/60 mt-1">
                      {provider.category} • {provider.city}, {provider.state}
                    </div>
                    <div className="text-xs text-white/50 mt-1">
                      Status: {provider.verification?.status || "unverified"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleVisibility(provider.id, provider.verification?.status)}
                    className="px-3 py-1 text-xs rounded border border-white/20 bg-white/5 text-white hover:bg-white/10 transition"
                  >
                    {provider.verification?.status === "verified" ? "Mark Probation" : "Mark Verified"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "import" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-2">Paste provider list (tab/comma/pipe separated)</label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              onBlur={parseImportText}
              rows={10}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white font-mono text-xs"
              placeholder="Name, Phone, Email, Address"
            />
          </div>
          {previewData.length > 0 && (
            <div className="space-y-4">
              <div className="text-sm text-white/60">Preview ({previewData.length} providers)</div>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {previewData.map((item) => (
                  <div key={item.id} className="text-xs text-white/80 p-2 bg-white/5 rounded border border-white/10">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-white/60">{item.phone} • {item.email}</div>
                    <div className="text-white/50">{item.address}</div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={saveProviders}
                className="px-4 py-2 rounded-lg border border-amber-400/30 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20 transition"
              >
                Import {previewData.length} Providers
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "verification" && (
        <div className="space-y-4">
          <div className="text-sm text-white/60">
            Providers requiring verification review
          </div>
          {providers
            .filter(p => getAgingDays(p.verification?.verifiedAt) > 90)
            .map((provider) => (
              <div
                key={provider.id}
                className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-4"
              >
                <div className="text-sm font-medium text-white">{provider.name}</div>
                <div className="text-xs text-amber-200 mt-1">
                  Last verified: {getAgingDays(provider.verification?.verifiedAt)} days ago
                </div>
              </div>
            ))}
        </div>
      )}

      {activeTab === "health" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/60 mb-1">Total Providers</div>
              <div className="text-2xl font-semibold text-white">{providers.length}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/60 mb-1">Verified</div>
              <div className="text-2xl font-semibold text-green-300">
                {providers.filter(p => p.verification?.status === "verified").length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

