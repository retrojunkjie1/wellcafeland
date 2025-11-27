// src/apps/providers/ClientDetailPage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { trackPageView } from "../../services/telemetry";
import ClientEmotionalTimeline from "./components/ClientEmotionalTimeline";
import PredictiveRecoverySnapshot from "./components/PredictiveRecoverySnapshot";
import { Users, ArrowLeft } from "lucide-react";

const ClientDetailPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Client Details - WellnessCafe";
    trackPageView("provider_client_detail");
    
    if (clientId && db) {
      loadClient();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const loadClient = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", clientId));
      if (userDoc.exists()) {
        setClient({ id: userDoc.id, ...userDoc.data() });
      } else {
        setError("Client not found");
      }
    } catch (err) {
      console.error("Failed to load client:", err);
      setError("Failed to load client information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="lux-shell py-10">
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">Loading client...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="lux-shell py-10">
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground mb-4">
              {error || "Client not found"}
            </p>
            <button
              type="button"
              onClick={() => navigate("/providers/dashboard")}
              className="inline-flex items-center rounded-full border border-foreground px-4 py-2 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="lux-shell py-10 space-y-8">
        {/* Header */}
        <header className="space-y-2">
          <button
            type="button"
            onClick={() => navigate("/providers/dashboard")}
            className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-muted-foreground" />
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Client Profile
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                {client.displayName || client.email || `Client ${clientId.slice(0, 8)}`}
              </h1>
            </div>
          </div>
        </header>

        {/* Client Info */}
        <div className="lux-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Email</p>
            <p className="text-xs text-foreground">{client.email || "—"}</p>
          </div>
          {client.role && (
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Role</p>
              <p className="text-xs text-foreground capitalize">{client.role}</p>
            </div>
          )}
        </div>

        {/* Predictive Recovery Snapshot */}
        <section className="lux-section space-y-4">
          <PredictiveRecoverySnapshot clientId={clientId} onDemand={false} />
        </section>

        {/* Emotional Timeline */}
        <section className="lux-section space-y-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Emotional Timeline
            </p>
            <p className="text-xs text-muted-foreground">
              Recent tool usage, risk signals, and emotional patterns (last 30 days).
            </p>
          </div>
          <ClientEmotionalTimeline clientId={clientId} />
        </section>
      </div>
    </div>
  );
};

export default ClientDetailPage;

