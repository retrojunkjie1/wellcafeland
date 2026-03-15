// src/admin/components/CollectionList.jsx
import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

export function CollectionList({ collectionName, onSelectDoc, emptyMessage = "No documents found" }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const colRef = collection(db, collectionName);
        
        // Try orderBy updatedAt desc, fallback to __name__
        let q;
        try {
          q = query(colRef, orderBy("updatedAt", "desc"), limit(50));
        } catch {
          try {
            q = query(colRef, orderBy("__name__", "desc"), limit(50));
          } catch {
            q = query(colRef, limit(50));
          }
        }

        const snapshot = await getDocs(q);
        const docsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDocs(docsList);
        setError(null);
      } catch (err) {
        console.error(`Error loading ${collectionName}:`, err);
        setError(err.message);
        setDocs([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [collectionName]);

  if (loading) {
    return (
      <div className="text-sm text-white/60 p-4">Loading documents…</div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">
        Error: {error}
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="text-sm text-white/60 p-4">{emptyMessage}</div>
    );
  }

  return (
    <div className="space-y-2">
      {docs.map((doc) => (
        <button
          key={doc.id}
          type="button"
          onClick={() => onSelectDoc({ id: doc.id, ...doc })}
          className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10 transition"
        >
          <div className="text-sm font-medium text-white">{doc.id}</div>
          {doc.title && (
            <div className="mt-1 text-xs text-white/60">{doc.title}</div>
          )}
          {doc.email && (
            <div className="mt-1 text-xs text-white/60">{doc.email}</div>
          )}
        </button>
      ))}
    </div>
  );
}

