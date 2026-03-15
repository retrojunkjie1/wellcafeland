// src/admin/panels/UsersPanel.jsx
import React, { useState, useEffect } from "react";
import { collection, doc, getDocs, setDoc, limit, query, orderBy } from "firebase/firestore";
import { db } from "@/firebase";

export function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const colRef = collection(db, "users");
        let q;
        try {
          q = query(colRef, orderBy("createdAt", "desc"), limit(50));
        } catch {
          q = query(colRef, limit(50));
        }
        const snapshot = await getDocs(q);
        const usersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
        setError(null);
      } catch (err) {
        console.error("Error loading users:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const updateRole = async (userId, newRole) => {
    try {
      const docRef = doc(db, "users", userId);
      await setDoc(
        docRef,
        { role: newRole, isAdmin: newRole === "admin", updatedAt: new Date() },
        { merge: true }
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole, isAdmin: newRole === "admin" } : u))
      );
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to update role: " + err.message);
    }
  };

  if (loading) {
    return <div className="text-sm text-white/60 p-4">Loading users…</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">
        Error: {error}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-sm text-white/60 p-4">
        No users found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-white mb-2">Users</h2>
        <p className="text-xs text-white/60 mb-4">
          View and manage user roles. Changes affect Firestore only; custom claims require script.
        </p>
      </div>
      <div className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{user.email || user.id}</div>
                <div className="mt-1 text-xs text-white/60">
                  Role: {user.role || "client"} {user.isAdmin ? "• Admin" : ""}
                </div>
                {user.createdAt && (
                  <div className="mt-1 text-xs text-white/40">
                    Created: {user.createdAt.toDate ? user.createdAt.toDate().toLocaleDateString() : "unknown"}
                  </div>
                )}
              </div>
              <select
                value={user.role || "client"}
                onChange={(e) => updateRole(user.id, e.target.value)}
                className="rounded border border-white/10 bg-black/20 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-400/50"
              >
                <option value="client">Client</option>
                <option value="admin">Admin</option>
                <option value="provider">Provider</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

