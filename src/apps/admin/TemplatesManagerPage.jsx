// src/apps/admin/TemplatesManagerPage.jsx

import React, { useMemo } from "react";
import { useSessionTemplatesStore } from "../../stores/useSessionTemplatesStore";

const fieldClasses =
  "w-full rounded-md border border-slate-700 bg-slate-900/40 px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400";

const labelClasses = "text-xs font-medium uppercase tracking-wide text-slate-400";

const sectionTitleClasses =
  "text-xs font-semibold uppercase tracking-[0.25em] text-slate-400";

export default function TemplatesManagerPage() {
  const {
    templates,
    selectedId,
    selectTemplate,
    addTemplate,
    removeTemplate,
    updateTemplate,
    reorderStep,
    saveAll,
    isSaving,
    error
  } = useSessionTemplatesStore();

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? null,
    [templates, selectedId]
  );

  const handleBasicChange = (field, value) => {
    if (!selected) return;
    updateTemplate(selected.id, { [field]: value });
  };

  const handleTagChange = (value) => {
    if (!selected) return;
    const tags = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    updateTemplate(selected.id, { tags });
  };

  const handleStepChange = (index, value) => {
    if (!selected) return;
    const steps = [...selected.steps];
    steps[index] = value;
    updateTemplate(selected.id, { steps });
  };

  const handleAddStep = () => {
    if (!selected) return;
    const steps = [...selected.steps, "New step..."];
    updateTemplate(selected.id, { steps });
  };

  const handleRemoveStep = (index) => {
    if (!selected) return;
    const steps = selected.steps.filter((_, i) => i !== index);
    updateTemplate(selected.id, { steps });
  };

  const moveStep = (index, direction) => {
    if (!selected) return;
    const toIndex = index + direction;
    if (toIndex < 0 || toIndex >= selected.steps.length) return;
    reorderStep(selected.id, index, toIndex);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6 md:px-8 lg:px-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className={sectionTitleClasses}>Admin · Sessions</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Session Templates Manager
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Create, edit, and organize every session that lives inside the OS.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={addTemplate}
            className="rounded-full border border-amber-400 bg-amber-400/10 px-4 py-2 text-xs font-medium uppercase tracking-wide text-amber-100 hover:bg-amber-400 hover:text-slate-950 transition"
          >
            + New session
          </button>
          <button
            onClick={saveAll}
            disabled={isSaving}
            className="rounded-full border border-slate-600 bg-slate-900/70 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-200 hover:bg-slate-800 disabled:opacity-50 transition"
          >
            {isSaving ? "Saving..." : "Save all"}
          </button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,0.9fr)]">
        {/* LEFT: list of templates */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Library
            </p>
            <span className="text-xs text-slate-500">
              {templates.length} sessions
            </span>
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => selectTemplate(t.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  t.id === selectedId
                    ? "border-amber-400 bg-amber-400/10 text-amber-100"
                    : "border-slate-800 bg-slate-950/40 text-slate-200 hover:border-slate-600 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{t.title}</span>
                  <span className="text-[10px] uppercase text-slate-400">
                    {t.category}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                  {t.summary}
                </p>
              </button>
            ))}
            {templates.length === 0 && (
              <p className="text-xs text-slate-500">
                No sessions yet. Click "New session" to start.
              </p>
            )}
          </div>
        </div>

        {/* CENTER: editor */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5">
          <p className={sectionTitleClasses}>Editor</p>
          {!selected ? (
            <p className="mt-4 text-sm text-slate-400">
              Select a session on the left to start editing.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {/* Title */}
              <div>
                <label className={labelClasses}>Title</label>
                <input
                  type="text"
                  className={fieldClasses}
                  value={selected.title}
                  onChange={(e) => handleBasicChange("title", e.target.value)}
                />
              </div>

              {/* Summary */}
              <div>
                <label className={labelClasses}>Short description</label>
                <textarea
                  className={`${fieldClasses} min-h-[70px]`}
                  value={selected.summary}
                  onChange={(e) => handleBasicChange("summary", e.target.value)}
                />
              </div>

              {/* Category + Duration */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClasses}>Category</label>
                  <input
                    type="text"
                    className={fieldClasses}
                    value={selected.category}
                    onChange={(e) =>
                      handleBasicChange("category", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className={labelClasses}>Duration (minutes)</label>
                  <input
                    type="number"
                    min={1}
                    className={fieldClasses}
                    value={selected.durationMinutes}
                    onChange={(e) =>
                      handleBasicChange(
                        "durationMinutes",
                        Number(e.target.value || 0)
                      )
                    }
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={labelClasses}>Tags (comma separated)</label>
                <input
                  type="text"
                  className={fieldClasses}
                  value={selected.tags.join(", ")}
                  onChange={(e) => handleTagChange(e.target.value)}
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  Example: grounding, cravings, sleep, grief
                </p>
              </div>

              {/* Steps */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className={labelClasses}>Steps</label>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="rounded-full border border-slate-600 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-200 hover:bg-slate-800 transition"
                  >
                    + Add step
                  </button>
                </div>
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {selected.steps.map((step, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          Step {index + 1}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => moveStep(index, -1)}
                            className="rounded-full border border-slate-700 px-2 text-[10px] text-slate-300 hover:bg-slate-800"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveStep(index, 1)}
                            className="rounded-full border border-slate-700 px-2 text-[10px] text-slate-300 hover:bg-slate-800"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveStep(index)}
                            className="rounded-full border border-rose-500/60 px-2 text-[10px] text-rose-300 hover:bg-rose-500/10"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <textarea
                        className={`${fieldClasses} min-h-[60px]`}
                        value={step}
                        onChange={(e) =>
                          handleStepChange(index, e.target.value)
                        }
                      />
                    </div>
                  ))}
                  {selected.steps.length === 0 && (
                    <p className="text-xs text-slate-500">
                      No steps yet. Add your first step to begin.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: console / helper panel */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <p className={sectionTitleClasses}>Console</p>
          <p className="mt-2 text-sm text-slate-300">
            This panel explains what&apos;s happening in simple language.
          </p>
          <div className="mt-4 space-y-3 text-xs text-slate-400">
            <p>
              • Select a session on the left, then edit its title, summary,
              tags, and steps.
            </p>
            <p>
              • Use the arrows to move steps up or down. Use ✕ to remove a
              step.
            </p>
            <p>
              • "Save all" will later push these templates to the cloud. For
              now, it just keeps them in this session.
            </p>
          </div>
          {selected && (
            <div className="mt-5 rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-xs text-slate-300">
              <p className="font-semibold text-slate-100">
                Current session focus
              </p>
              <p className="mt-1">
                <span className="text-slate-400">Title:</span> {selected.title}
              </p>
              <p className="mt-1">
                <span className="text-slate-400">Steps:</span>{" "}
                {selected.steps.length} total
              </p>
              <p className="mt-2 text-slate-400">
                Make sure each step is short, clear, and speaks like a human,
                not a robot.
              </p>
            </div>
          )}
          {error && (
            <p className="mt-4 rounded-md border border-rose-500/60 bg-rose-500/10 p-2 text-xs text-rose-200">
              {error}
            </p>
          )}
        </div>
      </div>
      {selected && (
        <div className="mt-6 flex items-center justify-between text-[11px] text-slate-500">
          <span>Editing ID: {selected.id}</span>
          <button
            type="button"
            onClick={() => removeTemplate(selected.id)}
            className="rounded-full border border-rose-500/60 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-rose-300 hover:bg-rose-500/10"
          >
            Delete session
          </button>
        </div>
      )}
    </div>
  );
}

