// src/apps/social/ConnectionsPage.jsx
// Connections page for friends, trusted partners, and blocked users

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Users, UserCheck, AlertTriangle, UserPlus, X } from "lucide-react";
import { getConnections, addTrustedPartner, blockUser, removeFriend } from "@/services/connectionsService";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import PageHeader from "@/components/navigation/PageHeader";

const ConnectionsPage = ({ type: propType }) => {
  const { type: paramType } = useParams();
  const type = propType || paramType || "friends";
  const { userId } = useSessionIdentity();
  const [connections, setConnections] = useState({ friends: [], trusted: [], blocked: [] });
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  useEffect(() => {
    loadConnections();
  }, [userId]);

  const loadConnections = async () => {
    try {
      const conns = await getConnections(userId);
      setConnections(conns);
    } catch (err) {
      console.error("Failed to load connections:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleAddTrusted = async (targetId) => {
    setActioning(targetId);
    try {
      const result = await addTrustedPartner(userId, targetId);
      if (result.ok) {
        await loadConnections();
      }
    } catch (err) {
      console.error("Failed to add trusted partner:", err);
    } finally {
      setActioning(null);
    }
  };

  const handleBlock = async (targetId) => {
    setActioning(targetId);
    try {
      const result = await blockUser(userId, targetId);
      if (result.ok) {
        await loadConnections();
      }
    } catch (err) {
      console.error("Failed to block user:", err);
    } finally {
      setActioning(null);
    }
  };

  const handleRemove = async (targetId) => {
    setActioning(targetId);
    try {
      const result = await removeFriend(userId, targetId);
      if (result.ok) {
        await loadConnections();
      }
    } catch (err) {
      console.error("Failed to remove connection:", err);
    } finally {
      setActioning(null);
    }
  };

  const getTitle = () => {
    switch (type) {
      case "friends":
        return "Friends";
      case "trusted":
        return "Trusted Partners";
      case "blocked":
        return "Blocked Users";
      default:
        return "Connections";
    }
  };

  const getSubtitle = () => {
    switch (type) {
      case "friends":
        return "Your recovery community";
      case "trusted":
        return "Accountability partners and close support";
      case "blocked":
        return "Users you've blocked";
      default:
        return "";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "friends":
        return <Users className="h-5 w-5" />;
      case "trusted":
        return <UserCheck className="h-5 w-5" />;
      case "blocked":
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getList = () => {
    switch (type) {
      case "friends":
        return connections.friends;
      case "trusted":
        return connections.trusted;
      case "blocked":
        return connections.blocked;
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <PageHeader title={getTitle()} />
        <div className="flex items-center justify-center p-12">
          <div className="text-white/50">Loading connections...</div>
        </div>
      </div>
    );
  }

  const list = getList();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageHeader
        title={getTitle()}
        subtitle={getSubtitle()}
      />
      <div className="lux-shell py-10">
        {list.length === 0 ? (
          <div className="lux-card p-12 border border-white/10 bg-white/5 text-center">
            {getIcon()}
            <p className="text-white/50 mt-4">No {type} yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((userId) => (
              <div
                key={userId}
                className="lux-card p-4 border border-white/10 bg-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-wcGold/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-wcGold" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      User {userId.slice(0, 8)}
                    </div>
                    <div className="text-xs text-white/50">{userId}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {type === "friends" && (
                    <>
                      <button
                        onClick={() => handleAddTrusted(userId)}
                        disabled={actioning === userId}
                        className="px-3 py-1.5 rounded border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-xs disabled:opacity-50"
                        title="Add as trusted partner"
                      >
                        <UserCheck className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleBlock(userId)}
                        disabled={actioning === userId}
                        className="px-3 py-1.5 rounded border border-red-400/30 bg-red-400/10 text-red-400 hover:bg-red-400/20 transition text-xs disabled:opacity-50"
                        title="Block user"
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  {type === "trusted" && (
                    <button
                      onClick={() => handleBlock(userId)}
                      disabled={actioning === userId}
                      className="px-3 py-1.5 rounded border border-red-400/30 bg-red-400/10 text-red-400 hover:bg-red-400/20 transition text-xs disabled:opacity-50"
                      title="Block user"
                    >
                      <AlertTriangle className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(userId)}
                    disabled={actioning === userId}
                    className="px-3 py-1.5 rounded border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-xs disabled:opacity-50"
                    title="Remove"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionsPage;

