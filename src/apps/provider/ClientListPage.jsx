// src/apps/provider/ClientListPage.jsx
// Client list page for providers

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { listClientsForProvider } from "@/services/providerRegistry";
import PageHeader from "@/components/navigation/PageHeader";

const ClientListPage = () => {
  const navigate = useNavigate();
  const { isProvider, isAdmin, providerId, userId } = useSessionIdentity();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isProvider && !isAdmin) {
      navigate("/");
      return;
    }

    const loadClients = async () => {
      try {
        const providerIdToUse = providerId || userId;
        if (!providerIdToUse) {
          setLoading(false);
          return;
        }

        const clientsData = await listClientsForProvider(providerIdToUse);
        setClients(clientsData);
      } catch (err) {
        console.error("Failed to load clients:", err);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, [isProvider, isAdmin, providerId, userId, navigate]);

  const getRiskBadgeColor = (riskLevel) => {
    switch (riskLevel) {
      case "critical":
        return "bg-red-400/20 text-red-400 border-red-400/30";
      case "at-risk":
        return "bg-orange-400/20 text-orange-400 border-orange-400/30";
      case "strained":
        return "bg-yellow-400/20 text-yellow-400 border-yellow-400/30";
      case "safe":
      default:
        return "bg-green-400/20 text-green-400 border-green-400/30";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Never";
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays < 1) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return d.toLocaleDateString();
  };

  if (!isProvider && !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageHeader
        title="My Clients"
        subtitle="All assigned clients"
      />
      <div className="lux-shell py-10">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-white/50">Loading clients...</div>
          </div>
        ) : clients.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-white/50">No clients assigned yet</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-white/70">Alias</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-white/70">Risk Level</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-white/70">Last Contact</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-white/70">Status</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-white/5 hover:bg-white/5 transition cursor-pointer"
                    onClick={() => navigate(`/provider/client/${client.id}`)}
                  >
                    <td className="py-3 px-4 text-white font-medium">{client.alias}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border capitalize ${getRiskBadgeColor(client.riskLevel)}`}
                      >
                        {client.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/70 text-sm">
                      {formatDate(client.lastContactAt)}
                    </td>
                    <td className="py-3 px-4 text-white/50 text-sm">
                      Active
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientListPage;

