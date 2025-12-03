// src/apps/admin/ContentStudioPage.jsx
// Phase 35A — AI Content Studio (Admin Interface)
// Generate AI-assisted tools, recovery modules, and education content

import React, { useState } from "react";
import { generateAndStoreContentModule } from "@/core/content/aiContentEngine";

const SECTIONS = [
  { value: "tools", label: "Tools" },
  { value: "recovery", label: "Recovery" },
  { value: "education", label: "Education" },
  { value: "assistance", label: "Assistance / Real Help" },
];

const SUBTYPES = [
  "breathing",
  "grounding",
  "urge-surfing",
  "body-scan",
  "journaling",
  "cravings",
  "shame",
  "anxiety",
  "grief",
];

const AUDIENCES = [
  { value: "general", label: "General" },
  { value: "early_recovery", label: "Early Recovery" },
  { value: "high_distress", label: "High Distress" },
];

const INTENSITIES = [
  { value: "low", label: "Low (Intro / Gentle)" },
  { value: "medium", label: "Medium (Deeper Work)" },
  { value: "high", label: "High (Heavy Material)" },
];

const TONES = [
  { value: "calm", label: "Calm & Grounded" },
  { value: "clinical", label: "Clinical & Precise" },
  { value: "compassionate", label: "Compassionate & Soft" },
  { value: "firm", label: "Firm & Direct" },
];

const ContentStudioPage = () => {
  const [section, setSection] = useState("tools");
  const [subtype, setSubtype] = useState("breathing");
  const [audience, setAudience] = useState("general");
  const [intensity, setIntensity] = useState("low");
  const [tone, setTone] = useState("calm");
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Please describe what you want to create.");
      return;
    }
    setError("");
    setIsGenerating(true);
    setLastResult(null);

    try {
      const result = await generateAndStoreContentModule({
        section,
        subtype,
        topic: topic.trim(),
        audience,
        intensity,
        tone,
      });
      setLastResult(result);
    } catch (err) {
      console.error("AI content generation failed:", err);
      setError(
        err?.message ||
          "Something went wrong while generating content. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-light mb-2">
            WellnessCafe Content Studio
          </h1>
          <p className="text-sm text-white/60">
            Generate AI-assisted tools, recovery modules, and education content
            with built-in emotional and risk tagging.
          </p>
        </header>

        <form
          onSubmit={handleGenerate}
          className="space-y-6 bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Section
              </label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full rounded-lg bg-slate-900/70 border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-amber-400/80"
              >
                {SECTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Subtype
              </label>
              <select
                value={subtype}
                onChange={(e) => setSubtype(e.target.value)}
                className="w-full rounded-lg bg-slate-900/70 border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-amber-400/80"
              >
                {SUBTYPES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Audience
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full rounded-lg bg-slate-900/70 border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-amber-400/80"
              >
                {AUDIENCES.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Intensity
              </label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="w-full rounded-lg bg-slate-900/70 border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-amber-400/80"
              >
                {INTENSITIES.map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/70 mb-1">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-lg bg-slate-900/70 border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-amber-400/80"
              >
                {TONES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">
              What do you want to create?
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              placeholder="e.g., 5-minute grounding script for someone in early recovery who feels ashamed after a relapse scare."
              className="w-full rounded-lg bg-slate-900/70 border border-white/20 px-3 py-2 text-sm focus:outline-none focus:border-amber-400/80 resize-none"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isGenerating}
            className="inline-flex items-center justify-center rounded-lg bg-amber-400 text-slate-950 px-4 py-2 text-sm font-medium hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? "Generating…" : "Generate & Save Module"}
          </button>
        </form>

        {lastResult && (
          <div className="mt-8 bg-white/5 border border-amber-400/30 rounded-2xl p-4 sm:p-6">
            <h2 className="text-sm font-medium text-amber-200 mb-2">
              Last Generated Module
            </h2>
            <p className="text-base mb-1">{lastResult.title}</p>
            <p className="text-xs text-white/60 mb-2">
              Section: <span className="text-white/80">{lastResult.section}</span>{" "}
              • Subtype:{" "}
              <span className="text-white/80">{lastResult.subtype}</span> •
              Audience:{" "}
              <span className="text-white/80">{lastResult.audience}</span>
            </p>
            <p className="text-xs text-white/60 mb-2">
              Risk:{" "}
              <span className="uppercase text-amber-300">
                {lastResult.riskLevel}
              </span>{" "}
              • Themes:{" "}
              <span className="text-white/80">
                {(lastResult.emotionalThemes || []).join(", ") || "—"}
              </span>
            </p>
            <p className="text-xs text-white/40">
              Saved as <span className="text-white/70">{lastResult.id}</span>{" "}
              in <code>contentModules</code>. You can later surface this in
              Tools / Recovery / Assistance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentStudioPage;

