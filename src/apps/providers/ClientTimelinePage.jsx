// src/apps/providers/ClientTimelinePage.jsx
// Client timeline view with emotional timeline and provider notes

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { getClient } from "@/services/clientRegistry";
import { getClientTimeline, getTimelineSummary, getRecentRiskSnapshots, listRecentRiskEvents } from "@/services/providerTimeline";
import { getSuggestedActionsForClient } from "@/services/providerSuggestions";
import { listClientNotes, createClientNote } from "@/services/providerNotes";
import EmotionalTimelinePanel from "@/components/analysis/EmotionalTimelinePanel";
import { ArrowLeft, Calendar, TrendingUp, AlertCircle, FileText, Plus, Loader2, MessageSquare, Wrench, Folder } from "lucide-react";

const ClientTimelinePage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { userId, isProvider, isAdmin, isLoading: identityLoading } = useSessionIdentity();
  
  const [client, setClient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [summary, setSummary] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [newNote, setNewNote] = useState({ content: "", noteType: "session_note", tags: [] });
  const [signals, setSignals] = useState([]);
  const [emotionalEvents, setEmotionalEvents] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  useEffect(() => {
    if (!identityLoading && !isProvider && !isAdmin) {
      navigate("/provider");
      return;
    }

    if (userId && clientId) {
      loadClientData();
    }

    // Load signals
    let mounted = true;
    async function loadSignals() {
      if (clientId) {
        const data = await getRecentRiskSnapshots({ clientId, limit: 20 });
        if (mounted) setSignals(data);
      }
    }
    loadSignals();
    return () => { mounted = false; };
  }, [userId, clientId, isProvider, isAdmin, identityLoading, navigate]);

  // Load emotional timeline events
  useEffect(() => {
    let isMounted = true;

    async function loadTimeline() {
      if (!clientId) return;
      try {
        setLoadingTimeline(true);
        const events = await listRecentRiskEvents(clientId);
        if (isMounted) {
          setEmotionalEvents(events);
        }
      } catch {
        if (isMounted) {
          setEmotionalEvents([]);
        }
      } finally {
        if (isMounted) {
          setLoadingTimeline(false);
        }
      }
    }

    loadTimeline();
    // For now we only depend on clientId to avoid noisy re-renders.
    return () => { isMounted = false; };
  }, [clientId]);

  const loadClientData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load client
      const clientData = await getClient(clientId);
      if (clientData) {
        setClient(clientData);
      }

      // Load timeline
      const timelineResult = await getClientTimeline(clientId, { days: 30, limit: 100 });
      if (timelineResult.ok) {
        setTimeline(timelineResult.events || []);
      }

      // Load timeline summary
      const summaryResult = await getTimelineSummary(clientId, { days: 30 });
      if (summaryResult.ok) {
        setSummary(summaryResult.summary);
      }

      // Load suggestions
      const suggestionsResult = await getSuggestedActionsForClient(clientId, { days: 7 });
      if (suggestionsResult.ok) {
        setSuggestions(suggestionsResult.suggestions || []);
      }

      // Load notes
      const notesResult = await listClientNotes(userId, clientId);
      if (notesResult.ok) {
        setNotes(notesResult.notes || []);
      }
    } catch (err) {
      console.error("Error loading client data:", err);
      setError("Failed to load client data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async () => {
    if (!newNote.content.trim()) return;

    try {
      const result = await createClientNote(userId, clientId, newNote);
      if (result.ok) {
        setShowNoteEditor(false);
        setNewNote({ content: "", noteType: "session_note", tags: [] });
        // Reload notes
        const notesResult = await listClientNotes(userId, clientId);
        if (notesResult.ok) {
          setNotes(notesResult.notes || []);
        }
      } else {
        setError(result.error || "Failed to create note");
      }
    } catch (err) {
      console.error("Error creating note:", err);
      setError("Failed to create note. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateString;
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "chat":
        return MessageSquare;
      case "tool":
        return Wrench;
      case "directory":
        return Folder;
      case "session":
        return Calendar;
      default:
        return Calendar;
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case "chat":
        return "text-blue-400";
      case "tool":
        return "text-wcGold";
      case "directory":
        return "text-purple-400";
      case "session":
        return "text-green-400";
      default:
        return "text-white/60";
    }
  };

  const getRiskColor = (riskScore) => {
    if (!riskScore) return "text-white/40";
    if (riskScore >= 75) return "text-red-400";
    if (riskScore >= 50) return "text-amber-400";
    return "text-green-400";
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  if (identityLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="h-6 w-6 animate-spin text-wcGold" />
      </div>
    );
  }

  if (!isProvider && !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <p className="text-base text-white/60">You don't have access to this area.</p>
          <button
            type="button"
            onClick={() => navigate("/provider")}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Group timeline events by date
  const eventsByDate = {};
  timeline.forEach((event) => {
    const date = new Date(event.timestamp).toLocaleDateString();
    if (!eventsByDate[date]) {
      eventsByDate[date] = [];
    }
    eventsByDate[date].push(event);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate("/provider")}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-light tracking-wide mb-2">
            {client?.displayName || `Client ${clientId?.slice(0, 8)}`}
          </h1>
          <p className="text-base text-white/60">
            Emotional timeline and provider notes
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Main Timeline */}
          <div className="space-y-6">
            {/* Emotional Timeline Panel */}
            <section className="mb-4">
              {loadingTimeline ? (
                <div className="w-full animate-pulse rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-xs text-white/50">
                  Loading emotional timeline…
                </div>
              ) : (
                <EmotionalTimelinePanel events={emotionalEvents} />
              )}
            </section>

            {/* Timeline Summary */}
            {summary && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <h3 className="text-sm font-medium text-white mb-3">Timeline Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/50 mb-1">Total Events</p>
                    <p className="text-lg font-medium text-white">{summary.totalEvents}</p>
                  </div>
                  {summary.avgRiskScore !== null && (
                    <div>
                      <p className="text-xs text-white/50 mb-1">Avg Risk Score</p>
                      <p className={`text-lg font-medium ${getRiskColor(summary.avgRiskScore)}`}>
                        {Math.round(summary.avgRiskScore)}
                      </p>
                    </div>
                  )}
                  {summary.maxRiskScore !== null && (
                    <div>
                      <p className="text-xs text-white/50 mb-1">Max Risk Score</p>
                      <p className={`text-lg font-medium ${getRiskColor(summary.maxRiskScore)}`}>
                        {Math.round(summary.maxRiskScore)}
                      </p>
                    </div>
                  )}
                  {summary.avgEmotionScore !== null && (
                    <div>
                      <p className="text-xs text-white/50 mb-1">Avg Emotion</p>
                      <p className={`text-lg font-medium ${
                        summary.avgEmotionScore > 0 ? "text-green-400" : summary.avgEmotionScore < 0 ? "text-red-400" : "text-white/60"
                      }`}>
                        {summary.avgEmotionScore > 0 ? "+" : ""}{summary.avgEmotionScore.toFixed(1)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline Events */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white">Timeline</h3>
              {timeline.length === 0 ? (
                <div className="rounded-lg border border-white/10 bg-white/5 p-8 text-center">
                  <Calendar className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-base text-white/60">No timeline events yet</p>
                </div>
              ) : (
                Object.entries(eventsByDate).map(([date, events]) => (
                  <div key={date} className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-xs font-medium text-white/50 uppercase tracking-wide">{date}</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    {events.map((event) => {
                      const Icon = getEventIcon(event.type);
                      return (
                        <div
                          key={event.id}
                          className="flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition"
                        >
                          <div className={`flex-shrink-0 ${getEventColor(event.type)}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-white">{event.label}</p>
                              {event.riskScore !== null && (
                                <span className={`text-xs ${getRiskColor(event.riskScore)}`}>
                                  Risk: {Math.round(event.riskScore)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/50">{formatDate(event.timestamp)}</p>
                            {event.notes && (
                              <p className="text-xs text-white/70 mt-2">{event.notes}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar: Suggestions & Notes */}
          <div className="space-y-6">
            {/* Suggested Actions */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white">Suggested Actions</h3>
                <TrendingUp className="h-4 w-4 text-white/40" />
              </div>
              {suggestions.length === 0 ? (
                <p className="text-xs text-white/50">No suggestions at this time.</p>
              ) : (
                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={`rounded-lg border p-3 ${getPriorityColor(suggestion.priority)}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-[10px] font-medium uppercase tracking-wide">
                          {suggestion.category}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${getPriorityColor(suggestion.priority)}`}>
                          {suggestion.priority}
                        </span>
                      </div>
                      <h4 className="text-sm font-medium text-white mb-1">{suggestion.title}</h4>
                      <p className="text-xs text-white/70">{suggestion.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Provider Notes */}
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white">Provider Notes</h3>
                <button
                  type="button"
                  onClick={() => setShowNoteEditor(!showNoteEditor)}
                  className="rounded-lg p-1.5 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {showNoteEditor && (
                <div className="mb-4 space-y-3 rounded-lg border border-white/10 bg-white/5 p-3">
                  <select
                    value={newNote.noteType}
                    onChange={(e) => setNewNote({ ...newNote, noteType: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-white/20 focus:outline-none"
                  >
                    <option value="session_note">Session Note</option>
                    <option value="checkin">Check-in</option>
                    <option value="observation">Observation</option>
                  </select>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                    placeholder="Add a note..."
                    rows={4}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCreateNote}
                      disabled={!newNote.content.trim()}
                      className="flex-1 rounded-lg bg-wcGold px-3 py-1.5 text-xs font-medium text-slate-950 transition hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save Note
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNoteEditor(false);
                        setNewNote({ content: "", noteType: "session_note", tags: [] });
                      }}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {notes.length === 0 ? (
                <p className="text-xs text-white/50">No notes yet.</p>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-white/50 uppercase tracking-wide">
                          {note.noteType.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-white/40">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-white/80 whitespace-pre-wrap">{note.content}</p>
                      {note.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 flex-wrap">
                          {note.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] text-white/60 bg-white/5"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Signals Section */}
            <div className="mt-6">
              <div className="text-sm font-semibold text-white/80 mb-2">Signals</div>

              {signals.length === 0 && (
                <div className="text-xs text-white/40">No recorded risk signals.</div>
              )}

              {signals.length > 0 && (
                <div className="space-y-2">
                  {signals.map(sig => (
                    <div key={sig.id} className="p-2 rounded-lg bg-black/30 border border-white/5">
                      <div className="flex justify-between text-xs text-white/60">
                        <span>{sig.riskLevel}</span>
                        <span>{sig.createdAt?.toDate?.()?.toLocaleString?.() || ""}</span>
                      </div>
                      {sig.reasons?.[0] && (
                        <div className="text-xs text-white/80 mt-1">{sig.reasons[0]}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientTimelinePage;

