// src/admin/pages/AdminUsers.jsx
import React, { useState, useEffect } from "react";
import { httpsCallable, getFunctions } from "firebase/functions";
import app from "@/firebase";
import { AdminUsersOmniscience } from "./AdminUsersOmniscience";

export function AdminUsers() {
  // Use enhanced omniscience view
  return <AdminUsersOmniscience />;
}

// Legacy export for backwards compatibility
export function AdminUsersLegacy() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const functions = getFunctions(app);
      const adminListUsers = httpsCallable(functions, "adminListUsers");
      const result = await adminListUsers();
      setUsers(result.data?.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (uid, currentAdmin) => {
    try {
      const functions = getFunctions(app);
      const adminSetClaims = httpsCallable(functions, "adminSetClaims");
      await adminSetClaims({
        uid,
        claimsPatch: { admin: !currentAdmin },
      });
      await loadUsers();
    } catch (err) {
      console.error("Failed to toggle admin:", err);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return <AdminUsersOmniscience />;
}

function AdminUsersLegacyComponent() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const functions = getFunctions(app);
      const adminListUsers = httpsCallable(functions, "adminListUsers");
      const result = await adminListUsers();
      setUsers(result.data?.users || []);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (uid, currentAdmin) => {
    try {
      const functions = getFunctions(app);
      const adminSetClaims = httpsCallable(functions, "adminSetClaims");
      await adminSetClaims({
        uid,
        claimsPatch: { admin: !currentAdmin },
      });
      await loadUsers();
    } catch (err) {
      console.error("Failed to toggle admin:", err);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Users</h2>

      <input
        type="text"
        placeholder="Search by email..."
        value={searchEmail}
        onChange={(e) => setSearchEmail(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50"
      />

      {loading ? (
        <div className="text-sm text-white/60">Loading...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-sm text-white/60">No users found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-white/60">Email</th>
                <th className="text-left py-2 text-white/60">UID</th>
                <th className="text-left py-2 text-white/60">Last Sign In</th>
                <th className="text-left py-2 text-white/60">Admin</th>
                <th className="text-left py-2 text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="border-b border-white/5">
                  <td className="py-2 text-white">{user.email || "N/A"}</td>
                  <td className="py-2 text-white/60 font-mono text-[10px]">
                    {user.uid?.slice(0, 12)}...
                  </td>
                  <td className="py-2 text-white/60">
                    {user.lastSignIn
                      ? new Date(user.lastSignIn).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="py-2 text-white/60">
                    {user.admin ? "Yes" : "No"}
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => toggleAdmin(user.uid, user.admin)}
                      className="rounded border border-white/15 bg-white/5 px-2 py-1 text-white/80 hover:bg-white/10 transition"
                    >
                      {user.admin ? "Revoke Admin" : "Grant Admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

