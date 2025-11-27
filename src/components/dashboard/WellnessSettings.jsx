// src/components/dashboard/WellnessSettings.jsx
// Wellness profile settings component

import React, { useState, useEffect } from "react";
import { Settings, Loader2, Check } from "lucide-react";
import { getCurrentProfile, saveProfile } from "@/services/profileService";

const WellnessSettings = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getCurrentProfile();
      setProfile(data);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    setSaved(false);
    try {
      const result = await saveProfile(profile);
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-wcGold" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-wcGold" />
        <h3 className="text-sm font-medium text-white">My Wellness Settings</h3>
      </div>

      {/* Preferred Mode */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/70">Preferred Mode</label>
        <div className="grid grid-cols-2 gap-2">
          {["text", "voice", "video", "mixed"].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => updateProfile("preferredMode", mode)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                profile.preferredMode === mode
                  ? "border-wcGold bg-wcGold/10 text-wcGold"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Tone */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/70">Preferred Tone</label>
        <div className="grid grid-cols-2 gap-2">
          {["direct", "gentle", "spiritual", "practical"].map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => updateProfile("preferredTone", tone)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                profile.preferredTone === tone
                  ? "border-wcGold bg-wcGold/10 text-wcGold"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
              }`}
            >
              {tone.charAt(0).toUpperCase() + tone.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Session Pace */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-white/70">Session Pace</label>
        <div className="grid grid-cols-3 gap-2">
          {["short", "standard", "deepDive"].map((pace) => (
            <button
              key={pace}
              type="button"
              onClick={() => updateProfile("sessionPace", pace)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                profile.sessionPace === pace
                  ? "border-wcGold bg-wcGold/10 text-wcGold"
                  : "border-white/10 bg-white/5 text-white/70 hover:border-white/20"
              }`}
            >
              {pace === "short" ? "Short" : pace === "standard" ? "Standard" : "Deep Dive"}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-lg bg-wcGold px-4 py-2 text-xs font-medium text-slate-950 hover:bg-amber-300 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : saved ? (
          <>
            <Check className="h-4 w-4" />
            Saved
          </>
        ) : (
          "Save Settings"
        )}
      </button>
    </div>
  );
};

export default WellnessSettings;

