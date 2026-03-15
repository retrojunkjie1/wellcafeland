// src/admin/components/DocEditor.jsx
import React, { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

export function DocEditor({ collectionName, docId, initialData, onSave, onCancel }) {
  const [jsonText, setJsonText] = useState(() => {
    try {
      return JSON.stringify(initialData || {}, null, 2);
    } catch {
      return "{}";
    }
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(false);
      const parsed = JSON.parse(jsonText);
      
      setSaving(true);
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, parsed, { merge: true });
      
      setSuccess(true);
      if (onSave) onSave(parsed);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON: " + err.message);
      } else {
        setError("Save failed: " + err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">
          Edit: {collectionName}/{docId}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-white/60 hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>

      <textarea
        value={jsonText}
        onChange={(e) => {
          setJsonText(e.target.value);
          setError(null);
          setSuccess(false);
        }}
        className="w-full rounded-lg border border-white/10 bg-black/20 p-3 font-mono text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50"
        rows={15}
        spellCheck={false}
      />

      {error && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/5 p-2 text-xs text-emerald-200">
          ✓ Saved successfully
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-medium text-amber-200 hover:bg-amber-400/20 disabled:opacity-50 transition"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

