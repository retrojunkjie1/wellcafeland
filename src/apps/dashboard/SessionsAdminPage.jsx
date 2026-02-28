// src/apps/dashboard/SessionsAdminPage.jsx

import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { trackPageView, trackAction } from "../../services/telemetry"
import { callAiSession } from "@/services/aiSessionClient"
import PageHeader from "@/os/PageHeader"

const SessionsAdminPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
      document.title = "Admin · Sessions - WellnessCafe";
      trackPageView("admin_sessions");
      loadTemplates();
    
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await callAiSession({ mode: "templates" });
      const list =
        data.templates ||
        data.sessions ||
        data.items ||
        [];

      setTemplates(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Admin templates load error:", err);
      setError(err.code === "AUTH_REQUIRED" ? "Please sign in to continue." : "Could not load sessions. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tpl) => {
    trackAction("admin_session_edit_click", {
      id: tpl.id || tpl.slug || tpl.title,
    });

    navigate(
      `/sessions/view/${encodeURIComponent(
        tpl.id || tpl.slug || tpl.title
      )}`,
      { state: { template: tpl, fromAdmin: true } }
    );
  };

  const handleDelete = (tpl) => {
    const id = tpl.id || tpl.slug || tpl.title;
    trackAction("admin_session_delete_click", { id });

    // For now we just show a notice so nothing breaks.
    alert(
      "Delete is not wired to the backend yet. Once the API is ready, this button will actually remove the template."
    );
  };

  const handleDuplicate = (tpl) => {
    trackAction("admin_session_duplicate_click", {
      id: tpl.id || tpl.slug || tpl.title,
    });

    alert(
      "Duplicate will be wired later. For now, you can open the session, copy the script, and paste it into a new template."
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <PageHeader title="Admin · Sessions" subtitle="Manage session templates" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <header className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Admin · Sessions
          </p>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            Manage AI sessions
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            From here you can review all generated templates, open them,
            copy text, and (later) edit, pin, or remove them. This is your
            control room for what the OS shows to clients.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
          <button
            onClick={loadTemplates}
            className="rounded-full border border-foreground px-4 py-1.5 font-medium hover:bg-foreground hover:text-background transition-colors"
          >
            Refresh list
          </button>
          <button
            onClick={() => navigate("/sessions/templates")}
            className="rounded-full border border-border px-4 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            View as client
          </button>
        </div>

        {loading && (
          <div className="py-10 text-sm text-muted-foreground">
            Loading sessions…
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && templates.length === 0 && (
          <div className="py-10 text-sm text-muted-foreground">
            No templates found yet. Generate some from the Sessions page and
            they will appear here.
          </div>
        )}

        {!loading && templates.length > 0 && (
          <div className="overflow-x-auto border border-border rounded-lg">
            <table className="min-w-full text-xs">
              <thead className="bg-muted/60">
                <tr className="text-left">
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Duration</th>
                  <th className="px-3 py-2 font-medium">Last used</th>
                  <th className="px-3 py-2 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {templates.map((tpl, idx) => {
                  const id = tpl.id || tpl.slug || tpl.title || `row-${idx}`;
                  const duration =
                    tpl.durationMinutes ||
                    tpl.estimatedMinutes ||
                    tpl.totalMinutes ||
                    10;
                  const category =
                    tpl.category ||
                    tpl.intentLabel ||
                    (tpl.intent
                      ? tpl.intent.replace(/_/g, " ")
                      : "General");

                  return (
                    <tr
                      key={id}
                      className="border-t border-border/60 hover:bg-muted/40"
                    >
                      <td className="px-3 py-2">
                        <div className="font-medium text-foreground">
                          {tpl.title || "Untitled session"}
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-xs">
                          {tpl.summary ||
                            tpl.aiSummary ||
                            "No summary available."}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-[11px] text-muted-foreground">
                        {category}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-muted-foreground">
                        ~{duration} min
                      </td>
                      <td className="px-3 py-2 text-[11px] text-muted-foreground">
                        {tpl.lastUsed || "—"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(tpl)}
                            className="rounded-full border border-border px-3 py-1 text-[11px] hover:bg-muted hover:text-foreground"
                          >
                            Open / edit
                          </button>
                          <button
                            onClick={() => handleDuplicate(tpl)}
                            className="rounded-full border border-border px-3 py-1 text-[11px] hover:bg-muted hover:text-foreground"
                          >
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleDelete(tpl)}
                            className="rounded-full border border-destructive/60 px-3 py-1 text-[11px] text-destructive hover:bg-destructive/10"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionsAdminPage;

