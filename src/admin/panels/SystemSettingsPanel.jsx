// src/admin/panels/SystemSettingsPanel.jsx
import React, { useState } from "react";
import { CollectionList } from "../components/CollectionList";
import { DocEditor } from "../components/DocEditor";

export function SystemSettingsPanel() {
  const [selected, setSelected] = useState(null);

  if (selected) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="text-xs text-white/60 hover:text-white"
        >
          ← Back to list
        </button>
        <DocEditor
          collectionName="system_settings"
          docId={selected.id}
          initialData={selected}
          onSave={() => setSelected(null)}
          onCancel={() => setSelected(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white mb-2">System Settings</h2>
        <p className="text-xs text-white/60 mb-4">
          Edit system configuration documents. Click a document to edit.
        </p>
      </div>
      <CollectionList
        collectionName="system_settings"
        onSelectDoc={setSelected}
        emptyMessage="No system settings found. Create documents in Firestore."
      />
    </div>
  );
}

