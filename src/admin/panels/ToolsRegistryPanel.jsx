// src/admin/panels/ToolsRegistryPanel.jsx
import React, { useState, useEffect } from "react";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

export function ToolsRegistryPanel() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const colRef = collection(db, "tools_registry");
        const snapshot = await getDocs(colRef);
        const toolsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTools(toolsList);
        setError(null);
      } catch (err) {
        console.error("Error loading tools_registry:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleEnabled = async (toolId, currentEnabled) => {
    try {
      const docRef = doc(db, "tools_registry", toolId);
      await setDoc(docRef, { enabled: !currentEnabled }, { merge: true });
      setTools((prev) =>
        prev.map((t) => (t.id === toolId ? { ...t, enabled: !currentEnabled } : t))
      );
    } catch (err) {
      console.error("Error toggling tool:", err);
      alert("Failed to toggle tool: " + err.message);
    }
  };

  const updateCategory = async (toolId, newCategory) => {
    try {
      const docRef = doc(db, "tools_registry", toolId);
      await setDoc(docRef, { category: newCategory }, { merge: true });
      setTools((prev) =>
        prev.map((t) => (t.id === toolId ? { ...t, category: newCategory } : t))
      );
    } catch (err) {
      console.error("Error updating category:", err);
      alert("Failed to update category: " + err.message);
    }
  };

  if (loading) {
    return <div className="text-sm text-white/60 p-4">Loading tools…</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">
        Error: {error}
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="text-sm text-white/60 p-4">
        No tools found. Create documents in the tools_registry collection.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white mb-2">Tools Registry</h2>
        <p className="text-xs text-white/60 mb-4">
          Manage tool availability and categories.
        </p>
      </div>
      <div className="space-y-3">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{tool.title || tool.id}</div>
                {tool.description && (
                  <div className="mt-1 text-xs text-white/60">{tool.description}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => toggleEnabled(tool.id, tool.enabled)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  tool.enabled
                    ? "border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20"
                    : "border border-white/20 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {tool.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/60">Category:</label>
              <input
                type="text"
                value={tool.category || ""}
                onChange={(e) => updateCategory(tool.id, e.target.value)}
                placeholder="category"
                className="rounded border border-white/10 bg-black/20 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400/50"
              />
            </div>
            {tool.updatedAt && (
              <div className="text-xs text-white/40">
                Updated: {tool.updatedAt.toDate ? tool.updatedAt.toDate().toLocaleString() : "unknown"}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

