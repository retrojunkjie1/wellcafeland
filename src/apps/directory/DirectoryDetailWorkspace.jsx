// src/apps/directory/DirectoryDetailWorkspace.jsx
// Directory item detail view

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Phone, Mail, ExternalLink, Heart, FileText, ArrowLeft } from "lucide-react";
import { getDirectoryItem, saveFavoriteResource, saveResourcePlan } from "@/services/directoryService";

const DirectoryDetailWorkspace = () => {
  const { domain: routeDomain, id } = useParams();
  const navigate = useNavigate();
  
  // Map route domain to backend domain format
  const domainMap = {
    housing: "housing",
    assistance: "government_assistance",
    grants: "grants",
    programs: "programs",
    providers: "providers",
    hotlines: "hotlines",
    circles: "circles",
  };
  
  const domain = domainMap[routeDomain] || routeDomain || "housing";
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPlanEditor, setShowPlanEditor] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [savingPlan, setSavingPlan] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [planNotes, setPlanNotes] = useState({
    status: "interested",
    notes: "",
    nextStep: "",
    followUpDate: "",
  });

  const loadItem = async () => {
    try {
      const itemData = await getDirectoryItem(domain, id);
      setItem(itemData);
    } catch (err) {
      console.error("Failed to load item:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain, id]);

  const handleSaveFavorite = async () => {
    if (!item) return;

    setSavingFavorite(true);
    setSaveMessage(null);
    
    try {
      const result = await saveFavoriteResource(domain, item);
      if (result.ok) {
        setSaveMessage("Saved to your favorites.");
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage(result.error || "Failed to save favorite.");
      }
    } catch (err) {
      console.error("Failed to save favorite:", err);
      setSaveMessage("Failed to save favorite. Please try again.");
    } finally {
      setSavingFavorite(false);
    }
  };

  const handleSavePlan = async () => {
    if (!item) return;

    setSavingPlan(true);
    setSaveMessage(null);

    try {
      const result = await saveResourcePlan(domain, item, planNotes);
      if (result.ok) {
        setSaveMessage("Added to your plan.");
        setShowPlanEditor(false);
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage(result.error || "Failed to save plan.");
      }
    } catch (err) {
      console.error("Failed to save plan:", err);
      setSaveMessage("Failed to save plan. Please try again.");
    } finally {
      setSavingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <p className="text-sm text-white/60">Loading...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <p className="text-sm text-white/60 mb-4">Resource not found</p>
          <button
            type="button"
            onClick={() => navigate(`/directory/${domain}`)}
            className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 transition"
          >
            Back to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-950 px-6 py-4">
          <button
            type="button"
            onClick={() => navigate(`/directory/${routeDomain}`)}
            className="flex items-center gap-2 text-sm text-white/70 hover:text-white mb-3 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </button>
        <h1 className="text-xl font-medium text-white">{item.title || "Resource"}</h1>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {item.source && (
            <span className="text-xs text-white/50">Source: {item.source}</span>
          )}
          {item.category && (
            <span className="text-xs text-white/50">• {item.category}</span>
          )}
          {item.type && (
            <span className="text-xs text-white/50">• {item.type}</span>
          )}
          {item.region && (
            <div className="flex items-center gap-1 text-xs text-white/50">
              <MapPin className="h-3 w-3" />
              {item.region}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Description */}
          {(item.description || item.snippet) && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/90 leading-relaxed">{item.description || item.snippet}</p>
            </div>
          )}

          {/* Contact Information */}
          {(item.phone || item.email || item.address) && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-3">
              <h3 className="text-sm font-medium text-white mb-3">Contact Information</h3>
              {item.phone && (
                <a
                  href={`tel:${item.phone}`}
                  className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
                >
                  <Phone className="h-4 w-4" />
                  {item.phone}
                </a>
              )}
              {item.email && (
                <a
                  href={`mailto:${item.email}`}
                  className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition"
                >
                  <Mail className="h-4 w-4" />
                  {item.email}
                </a>
              )}
              {item.address && (
                <div className="flex items-start gap-2 text-sm text-white/80">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{item.address}</span>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs bg-white/5 text-white/70 border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Save Message */}
          {saveMessage && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${
              saveMessage.includes("Failed") 
                ? "border-red-500/20 bg-red-500/10 text-red-300"
                : "border-wcGold/20 bg-wcGold/10 text-wcGold"
            }`}>
              {saveMessage}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/20"
              >
                <ExternalLink className="h-4 w-4" />
                Open Website
              </a>
            )}
            <button
              type="button"
              onClick={handleSaveFavorite}
              disabled={savingFavorite}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Heart className="h-4 w-4" />
              {savingFavorite ? "Saving..." : "Save to Favorites"}
            </button>
            <button
              type="button"
              onClick={() => setShowPlanEditor(true)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              <FileText className="h-4 w-4" />
              Add to Plan
            </button>
          </div>

          {/* Plan Editor */}
          {showPlanEditor && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
              <h3 className="text-sm font-medium text-white">Add to My Plan</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-white/70 mb-1">
                    Status
                  </label>
                  <select
                    value={planNotes.status}
                    onChange={(e) =>
                      setPlanNotes({ ...planNotes, status: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
                  >
                    <option value="interested">Interested</option>
                    <option value="applied">Applied</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Denied</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={planNotes.notes}
                    onChange={(e) =>
                      setPlanNotes({ ...planNotes, notes: e.target.value })
                    }
                    rows={4}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none resize-none"
                    placeholder="Add your notes about this resource..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">
                    Next Step
                  </label>
                  <textarea
                    value={planNotes.nextStep}
                    onChange={(e) =>
                      setPlanNotes({ ...planNotes, nextStep: e.target.value })
                    }
                    rows={2}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none resize-none"
                    placeholder="What's your next step?"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">
                    Follow-up Date (optional)
                  </label>
                  <input
                    type="date"
                    value={planNotes.followUpDate}
                    onChange={(e) =>
                      setPlanNotes({ ...planNotes, followUpDate: e.target.value })
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSavePlan}
                  disabled={savingPlan}
                  className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingPlan ? "Saving..." : "Save Plan"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPlanEditor(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectoryDetailWorkspace;

