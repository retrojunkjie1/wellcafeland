// src/admin/pages/AdminUsersOmniscience.jsx
// Enhanced Users page with omniscience features

import React, { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { callFunction } from "@/lib/functionsClient";

export function AdminUsersOmniscience() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try Cloud Function first, then fallback to Firestore users collection
      let usersList = [];
      try {
        const result = await callFunction("adminListUsers");
        usersList = result?.users || [];
      } catch (funcErr) {
        console.warn("[AdminUsersOmniscience] Function failed, trying Firestore:", funcErr);
        // Fallback: Read from Firestore users collection
        const usersRef = collection(db, "users");
        const usersSnapshot = await getDocs(
          query(usersRef, orderBy("lastSeen", "desc"), limit(200))
        );
        usersList = usersSnapshot.docs.map(doc => ({
          uid: doc.id,
          email: doc.data().email,
          disabled: doc.data().disabled || false,
          admin: doc.data().isAdmin || doc.data().admin || false,
          lastSignInTime: doc.data().lastSeen?.toDate?.()?.toISOString() || doc.data().updatedAt?.toDate?.()?.toISOString(),
          creationTime: doc.data().createdAt?.toDate?.()?.toISOString(),
        }));
      }
      
      if (usersList.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }
      
      // Enrich with live data from telemetry
      const enrichedUsers = await Promise.all(
        usersList.map(async (user) => {
          try {
            // Get latest telemetry for user activity
            const telemetryRef = collection(db, "telemetry_events");
            const recentEvents = await getDocs(
              query(
                telemetryRef,
                where("uid", "==", user.uid),
                orderBy("createdAt", "desc"),
                limit(1)
              )
            );
            
            const latestEvent = recentEvents.docs[0]?.data();
            const lastActive = latestEvent?.createdAt?.toDate?.() || user.lastSignInTime ? new Date(user.lastSignInTime) : null;
            
            // Get runtime data
            const runtimeDoc = await getDoc(doc(db, "user_runtime", user.uid));
            const runtime = runtimeDoc.exists() ? runtimeDoc.data() : {};
            
            // Get risk score if available
            const riskDoc = await getDoc(doc(db, "risk_forecast", user.uid));
            const riskScore = riskDoc.exists() ? riskDoc.data().riskScore : null;
            
            return {
              ...user,
              lastActive: lastActive || runtime.lastActiveAt?.toDate?.() || null,
              riskScore,
              currentRoute: runtime.route || latestEvent?.metadata?.url || null,
              online: runtime.online || false,
            };
          } catch (enrichErr) {
            console.warn(`[AdminUsersOmniscience] Failed to enrich user ${user.uid}:`, enrichErr);
            return user;
          }
        })
      );
      
      setUsers(enrichedUsers);
    } catch (err) {
      const errorMsg = err?.message || err?.code || "Failed to load users";
      console.error("[AdminUsersOmniscience] Failed to load users:", {
        error: err,
        message: errorMsg,
        code: err?.code,
      });
      setError(errorMsg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (uid) => {
    setLoadingDetails(true);
    try {
      // Get telemetry events
      const telemetryRef = collection(db, "telemetry_events");
      const eventsQuery = query(
        telemetryRef,
        where("uid", "==", uid),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Get risk forecast
      const riskDoc = await getDoc(doc(db, "risk_forecast", uid));
      const riskData = riskDoc.exists() ? riskDoc.data() : null;

      setUserDetails({
        events,
        risk: riskData,
      });
    } catch (err) {
      console.error("Failed to load user details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    loadUserDetails(user.uid);
  };

  const toggleAdmin = async (uid, currentAdmin) => {
    if (!confirm(`${currentAdmin ? "Revoke" : "Grant"} admin access for this user?`)) return;
    
    try {
      await callFunction("setUserRole", { uid, admin: !currentAdmin });
      await loadUsers();
    } catch (err) {
      const errorMsg = err?.message || err?.code || "Failed to toggle admin";
      console.error("[AdminUsersOmniscience] Failed to toggle admin:", {
        error: err,
        message: errorMsg,
      });
      alert(`Failed: ${errorMsg}`);
    }
  };

  const forceSignOut = async (uid) => {
    if (!confirm("Force sign out this user? They will need to sign in again.")) return;
    
    try {
      await callFunction("revokeUserSessions", { uid });
      alert("User sessions revoked");
    } catch (err) {
      const errorMsg = err?.message || err?.code || "Failed to revoke sessions";
      console.error("[AdminUsersOmniscience] Failed to revoke sessions:", {
        error: err,
        message: errorMsg,
      });
      alert(`Failed: ${errorMsg}`);
    }
  };

  const toggleDisabled = async (uid, currentDisabled) => {
    if (!confirm(`${currentDisabled ? "Enable" : "Disable"} access for this user?`)) return;
    
    try {
      await callFunction("disableUser", { uid, disabled: !currentDisabled });
      await loadUsers();
    } catch (err) {
      const errorMsg = err?.message || err?.code || "Failed to toggle disabled";
      console.error("[AdminUsersOmniscience] Failed to toggle disabled:", {
        error: err,
        message: errorMsg,
      });
      alert(`Failed: ${errorMsg}`);
    }
  };

  const resetUserRuntime = async (uid) => {
    if (!confirm("Reset user runtime state? This will clear their current session data.")) return;
    
    try {
      await callFunction("resetUserState", { uid });
      alert("User runtime reset");
    } catch (err) {
      const errorMsg = err?.message || err?.code || "Failed to reset runtime";
      console.error("[AdminUsersOmniscience] Failed to reset runtime:", {
        error: err,
        message: errorMsg,
      });
      alert(`Failed: ${errorMsg}`);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(searchEmail.toLowerCase())
  );

  // Sort by risk score (highest first)
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const riskA = a.riskScore || 0;
    const riskB = b.riskScore || 0;
    return riskB - riskA;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Users Omniscience</h2>

      <input
        type="text"
        placeholder="Search by email..."
        value={searchEmail}
        onChange={(e) => setSearchEmail(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/50"
      />

      {loading ? (
        <div className="text-sm text-white/60">Loading users...</div>
      ) : error ? (
        <div className="glass-panel p-4 border border-red-400/30 bg-red-400/10">
          <div className="text-sm font-medium text-red-200 mb-1">Error Loading Users</div>
          <div className="text-xs text-red-300/80">{error}</div>
        </div>
      ) : sortedUsers.length === 0 ? (
        <div className="glass-panel p-4 text-center text-xs text-white/60">
          No users found. Users will appear here after they sign in and their profile is created in Firestore. Check Firebase Auth setup and ensure users collection is being populated.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-white/60">Email</th>
                <th className="text-left py-2 text-white/60">Last Active</th>
                <th className="text-left py-2 text-white/60">Current Route</th>
                <th className="text-left py-2 text-white/60">Risk Score</th>
                <th className="text-left py-2 text-white/60">Admin</th>
                <th className="text-left py-2 text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedUsers.map((user) => (
                <tr 
                  key={user.uid} 
                  className={`border-b border-white/5 cursor-pointer hover:bg-white/5 ${
                    user.riskScore && user.riskScore > 50 ? "bg-red-900/10" : ""
                  }`}
                  onClick={() => handleUserClick(user)}
                >
                  <td className="py-2 text-white">{user.email || "N/A"}</td>
                  <td className="py-2 text-white/60">
                    {user.lastActive ? new Date(user.lastActive).toLocaleString() : "Never"}
                  </td>
                  <td className="py-2 text-white/60 font-mono text-[10px]">
                    {user.currentRoute || "N/A"}
                  </td>
                  <td className="py-2">
                    {user.riskScore !== null ? (
                      <span className={`px-2 py-1 rounded text-[10px] ${
                        user.riskScore > 70 ? "bg-red-500/20 text-red-300" :
                        user.riskScore > 40 ? "bg-yellow-500/20 text-yellow-300" :
                        "bg-green-500/20 text-green-300"
                      }`}>
                        {user.riskScore}
                      </span>
                    ) : (
                      <span className="text-white/40">—</span>
                    )}
                  </td>
                  <td className="py-2 text-white/60">
                    {user.admin ? "Yes" : "No"}
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAdmin(user.uid, user.admin);
                      }}
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

      {/* User Detail Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedUser.email}</h3>
                  <p className="text-xs text-white/60 mt-1">UID: {selectedUser.uid}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setUserDetails(null);
                  }}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {loadingDetails ? (
                <div className="text-sm text-white/60">Loading details...</div>
              ) : (
                <>
                  {userDetails?.risk && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                      <h4 className="text-sm font-medium text-white mb-2">Risk Forecast</h4>
                      <div className="text-2xl font-bold text-white mb-2">
                        {userDetails.risk.riskScore}
                      </div>
                      {userDetails.risk.reasons?.length > 0 && (
                        <ul className="text-xs text-white/70 space-y-1">
                          {userDetails.risk.reasons.map((reason, i) => (
                            <li key={i}>• {reason}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <h4 className="text-sm font-medium text-white mb-2">Recent Telemetry Events</h4>
                    {userDetails?.events?.length === 0 ? (
                          <div className="text-xs text-white/60">No telemetry events yet for this user.</div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {userDetails?.events?.slice(0, 20).map((event) => (
                          <div key={event.id} className="text-xs text-white/70 bg-white/5 p-2 rounded">
                            <div className="font-medium">{event.type} • {event.level}</div>
                            <div className="text-white/50 mt-1">
                              {event.createdAt?.toDate?.()?.toLocaleString() || "Unknown time"}
                            </div>
                            {event.metadata?.url && (
                              <div className="text-white/40 mt-1 font-mono text-[10px]">{event.metadata.url}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

