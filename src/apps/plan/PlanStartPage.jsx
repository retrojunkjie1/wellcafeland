/**
 * PlanStart — Today's Priority + Body/Mind/Spirit tiles + first 3 micro-actions.
 * Safety Notice only when risk is yellow+.
 */

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Activity, Brain, Sparkles, ChevronRight } from "lucide-react";

const DOMAIN_ICONS = { body: Activity, mind: Brain, spirit: Sparkles };
const DOMAIN_LABELS = { body: "Body", mind: "Mind", spirit: "Spirit" };

const PlanStartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const plan = location.state?.plan || null;
  const summary = plan?.summary || {};
  const firstThree = summary.firstThree || [];
  const riskLevel = summary.riskLevel || "green";
  const escalationPhrase = summary.escalationPhrase || null;
  const showSafetyNotice = riskLevel === "yellow" || riskLevel === "orange" || riskLevel === "red";

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <h1 className="text-xl font-medium text-white mb-1">Your Plan</h1>
        <p className="text-sm text-white/60 mb-6">
          {summary.headline || "Building stability with small steps today."}
        </p>

        <div className="mb-8">
          <h2 className="text-sm font-medium text-white/80 mb-3">Today's Priority</h2>
          <p className="text-base text-wcGold">
            {summary.todayPriority || "One small win today."}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {["body", "mind", "spirit"].map((domain) => {
            const Icon = DOMAIN_ICONS[domain];
            return (
              <button
                key={domain}
                type="button"
                onClick={() => navigate("/tools")}
                className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-wcGold/30 hover:bg-white/[0.06] transition"
              >
                <Icon className="h-6 w-6 text-wcGold/80 mb-2" />
                <span className="text-xs font-medium text-white/80">{DOMAIN_LABELS[domain]}</span>
              </button>
            );
          })}
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-medium text-white/80 mb-3">Recommended Now</h2>
          <div className="space-y-2">
            {(firstThree.length > 0 ? firstThree : [
              { id: "1", domain: "body", title: "4-7-8 Breath", durationMinutes: 2 },
              { id: "2", domain: "mind", title: "5-4-3-2-1 Grounding", durationMinutes: 3 },
              { id: "3", domain: "spirit", title: "Self-Compassion Phrase", durationMinutes: 2 },
            ]).map((item) => {
              const Icon = DOMAIN_ICONS[item.domain] || Activity;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(`/tools/${item.domain === "body" ? "breathing" : item.domain === "mind" ? "grounding" : "journaling"}`)}
                  className="w-full flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-left hover:border-wcGold/30 transition"
                >
                  <Icon className="h-4 w-4 text-wcGold/70 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    <p className="text-xs text-white/50">{item.durationMinutes} min</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/40 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {showSafetyNotice && escalationPhrase && (
          <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 mb-8">
            <p className="text-sm text-amber-200/90 leading-relaxed">{escalationPhrase}</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full py-3 rounded-lg border border-wcGold/40 bg-wcGold/10 text-wcGold font-medium text-sm hover:bg-wcGold/20 transition"
        >
          Continue to WellnessCafe
        </button>
      </div>
    </div>
  );
};

export default PlanStartPage;
