// src/apps/provider/ClientDetailPage.jsx
// Client detail page for providers

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { getClient } from "@/services/clientRegistry";
import { sendNudge } from "@/services/providerNudgeService";
// import { addClientRecommendation } from "@/services/providerService"; // TODO: Implement if needed
import { getClientConsentSettings } from "@/services/consentService";
import { listNotesForClient } from "@/services/clinicalNotesService";
import { listCarePlansForClient } from "@/services/carePlanService";
import { listAppointmentsForClient } from "@/services/appointmentService";
import RiskRadar from "./components/RiskRadar";
import ClientTimeline from "./components/ClientTimeline";
import PageHeader from "@/components/navigation/PageHeader";
import { Send, Heart, Activity, BookOpen, MessageSquare, Home, DollarSign, Briefcase, Users, FileText, Calendar, ClipboardList, Lock } from "lucide-react";

const ClientDetailPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { isProvider, isAdmin, providerId, userId } = useSessionIdentity();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingNudge, setSendingNudge] = useState(null);
  const [consent, setConsent] = useState(null);
  const [notes, setNotes] = useState([]);
  const [carePlans, setCarePlans] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const loadClient = useCallback(async () => {
    try {
      if (!clientId) {
        setLoading(false);
        return;
      }

      const providerIdToUse = providerId || userId;
      const [clientData, consentData, notesData, plansData, appointmentsData] = await Promise.all([
        getClient(clientId),
        providerIdToUse ? getClientConsentSettings(clientId, providerIdToUse) : Promise.resolve(null),
        providerIdToUse ? listNotesForClient(clientId, providerIdToUse) : Promise.resolve([]),
        providerIdToUse ? listCarePlansForClient(clientId, providerIdToUse) : Promise.resolve([]),
        listAppointmentsForClient(clientId, { from: new Date() }),
      ]);

      setClient(clientData);
      setConsent(consentData);
      setNotes(notesData);
      setCarePlans(plansData);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error("Failed to load client:", err);
    } finally {
      setLoading(false);
    }
  }, [clientId, providerId, userId]);

  useEffect(() => {
    if (!isProvider && !isAdmin) {
      navigate("/");
      return;
    }
    loadClient();
  }, [isProvider, isAdmin, navigate, loadClient]);

  const handleSendNudge = async (type) => {
    if (!clientId || !providerId || !userId) return;

    setSendingNudge(type);
    try {
      const result = await sendNudge(clientId, type, providerId || userId);
      if (result.ok) {
        // Show success message (could use a toast here)
        console.log("Nudge sent successfully");
      }
    } catch (err) {
      console.error("Failed to send nudge:", err);
    } finally {
      setSendingNudge(null);
    }
  };

  if (!isProvider && !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <PageHeader title="Client Details" />
        <div className="flex items-center justify-center p-12">
          <div className="text-white/50">Loading client...</div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <PageHeader title="Client Details" />
        <div className="flex items-center justify-center p-12">
          <div className="text-white/50">Client not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageHeader
        title={client.alias}
        subtitle={`Risk Level: ${client.riskLevel}`}
      />
      <div className="lux-shell py-10 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Radar */}
          <div className="lg:col-span-1">
            <div className="lux-card p-6 border border-white/10 bg-white/5">
              <RiskRadar clientId={clientId} />
            </div>
          </div>

          {/* Client Timeline */}
          <div className="lg:col-span-2">
            <div className="lux-card p-6 border border-white/10 bg-white/5">
              {consent && !consent.canViewTimeline ? (
                <div className="flex items-center gap-2 text-white/50">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">Client has not granted access to view timeline.</span>
                </div>
              ) : (
                <ClientTimeline clientId={clientId} />
              )}
            </div>
          </div>
        </div>

        {/* Consent Badges */}
        {consent && (
          <div className="lux-card p-4 border border-white/10 bg-white/5">
            <div className="flex items-center gap-4 text-xs">
              <span className={`px-2 py-1 rounded ${consent.canViewTimeline ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                Timeline
              </span>
              <span className={`px-2 py-1 rounded ${consent.canViewSummaries ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                Summaries
              </span>
              <span className={`px-2 py-1 rounded ${consent.canViewToolsUsage ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                Tools
              </span>
              <span className={`px-2 py-1 rounded ${consent.canSeeCircleActivity ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                Circles
              </span>
            </div>
          </div>
        )}

        {/* Clinical Notes */}
        <div className="lux-card p-6 border border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Clinical Notes
            </h3>
            <button
              onClick={() => navigate(`/provider/clients/${clientId}/notes/new`)}
              className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-sm"
            >
              Add Note
            </button>
          </div>
          {notes.length === 0 ? (
            <div className="text-sm text-white/50">No notes yet</div>
          ) : (
            <div className="space-y-2">
              {notes.slice(0, 5).map((note) => (
                <button
                  key={note.id}
                  onClick={() => navigate(`/provider/clients/${clientId}/notes/${note.id}`)}
                  className="w-full text-left p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="font-medium text-white text-sm">{note.title}</div>
                  <div className="text-xs text-white/50 mt-1">
                    {note.createdAt ? new Date(note.createdAt).toLocaleDateString() : "Recently"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Care Plans */}
        <div className="lux-card p-6 border border-white/10 bg-white/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Care Plans
            </h3>
            <button
              onClick={() => navigate(`/provider/clients/${clientId}/care-plan/new`)}
              className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-sm"
            >
              {carePlans.length === 0 ? "Create Plan" : "Edit Plan"}
            </button>
          </div>
          {carePlans.length === 0 ? (
            <div className="text-sm text-white/50">No care plan yet</div>
          ) : (
            <div className="space-y-3">
              {carePlans.filter((p) => p.status === "active").map((plan) => (
                <div key={plan.id} className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <div className="font-medium text-white mb-2">{plan.title}</div>
                  <div className="space-y-1">
                    {plan.items.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="text-sm text-white/70">
                        • {item.label}
                      </div>
                    ))}
                    {plan.items.length > 3 && (
                      <div className="text-xs text-white/50">+{plan.items.length - 3} more items</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        {appointments.length > 0 && (
          <div className="lux-card p-6 border border-white/10 bg-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Appointments
              </h3>
              <button
                onClick={() => navigate("/provider/schedule")}
                className="text-sm text-white/70 hover:text-white transition"
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {appointments.slice(0, 3).map((apt) => (
                <div key={apt.id} className="p-3 rounded-lg border border-white/10 bg-white/5">
                  <div className="text-sm font-medium text-white">
                    {apt.startAt ? new Date(apt.startAt).toLocaleString() : "Scheduled"}
                  </div>
                  {apt.note && (
                    <div className="text-xs text-white/50 mt-1">{apt.note}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messaging */}
        <div className="lux-card p-6 border border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </h3>
            <button
              onClick={() => navigate(`/provider/messages?clientId=${clientId}`)}
              className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-sm"
            >
              Open Messages
            </button>
          </div>
        </div>

        {/* Nudge Panel */}
        <div className="lux-card p-6 border border-white/10 bg-white/5">
          <h3 className="text-lg font-medium text-white mb-4">Send Nudge</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => handleSendNudge("check-in")}
              disabled={sendingNudge === "check-in"}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition disabled:opacity-50"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">Check-in</span>
            </button>
            <button
              onClick={() => handleSendNudge("grounding")}
              disabled={sendingNudge === "grounding"}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition disabled:opacity-50"
            >
              <Heart className="h-4 w-4" />
              <span className="text-sm">Grounding</span>
            </button>
            <button
              onClick={() => handleSendNudge("urge-surf")}
              disabled={sendingNudge === "urge-surf"}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition disabled:opacity-50"
            >
              <Activity className="h-4 w-4" />
              <span className="text-sm">Urge Surf</span>
            </button>
            <button
              onClick={() => handleSendNudge("journal-prompt")}
              disabled={sendingNudge === "journal-prompt"}
              className="flex items-center gap-2 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition disabled:opacity-50"
            >
              <BookOpen className="h-4 w-4" />
              <span className="text-sm">Journal</span>
            </button>
          </div>
        </div>

        {/* Phase 12: Provider Recommendations - TODO: Implement addClientRecommendation service */}
        {/* <div className="lux-card p-6 border border-white/10 bg-white/5">
          <h3 className="text-lg font-medium text-white mb-4">Recommend Resources</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-sm">
              <Home className="h-4 w-4" />
              <span>Housing</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-sm">
              <DollarSign className="h-4 w-4" />
              <span>Funding</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-sm">
              <Briefcase className="h-4 w-4" />
              <span>Program</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition text-sm">
              <Users className="h-4 w-4" />
              <span>Circle</span>
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ClientDetailPage;

