// src/apps/agents/AgentsPage.jsx
// User-facing page to interact with AI agents (Seer, Oracle, Overseer, Sentinel)

import React, { useState, useEffect } from "react";
import { callAgent } from "../../agents/aiAgents";
import { trackPageView } from "../../services/telemetry";
import { Eye, Sparkles, Compass, Shield, Loader2, Send } from "lucide-react";
import PageHeader from "@/components/navigation/PageHeader";

const AGENTS = [
  {
    id: "seer",
    name: "The Seer",
    icon: Eye,
    description: "Observes patterns in your recovery journey and identifies trends.",
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10",
    borderColor: "border-cyan-400/30",
    placeholder: "Ask about patterns in your recovery journey...",
  },
  {
    id: "oracle",
    name: "The Oracle",
    icon: Sparkles,
    description: "Provides deep wisdom by connecting your context with long-term memory.",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
    placeholder: "Ask for guidance or wisdom...",
  },
  {
    id: "overseer",
    name: "The Overseer",
    icon: Compass,
    description: "Creates structured plans and orchestrates your next right steps.",
    color: "text-wcGold",
    bgColor: "bg-wcGold/10",
    borderColor: "border-wcGold/30",
    placeholder: "Ask for a plan or structured guidance...",
  },
  {
    id: "sentinel",
    name: "The Sentinel",
    icon: Shield,
    description: "Monitors for risk and flags alerts to keep you safe.",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/30",
    placeholder: "Ask about risk assessment or safety...",
  },
];

const AgentsPage = () => {
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "AI Agents - WellnessCafe";
    trackPageView("agents");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await callAgent(selectedAgent.id, {
        question: question.trim(),
        prompt: question.trim(),
      });

      if (result && result.success) {
        setResponse(result.result || result);
      } else {
        setError(result?.error || "Agent couldn't respond. Please try again.");
      }
    } catch (err) {
      console.error("Agent call error:", err);
      setError("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    setQuestion("");
    setResponse(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-light tracking-wide mb-4">AI Agents</h1>
          <p className="text-sm text-white/60 max-w-xl mx-auto">
            Connect with specialized AI agents designed to support different aspects of your recovery journey.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          {/* Agent Selection Sidebar */}
          <div className="space-y-3">
            {AGENTS.map((agent) => {
              const Icon = agent.icon;
              const isSelected = selectedAgent.id === agent.id;

              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => handleAgentSelect(agent)}
                  className={`w-full text-left rounded-lg border p-4 transition-all ${
                    isSelected
                      ? `${agent.borderColor} ${agent.bgColor} border-2`
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <Icon className={`h-4 w-4 flex-shrink-0 ${isSelected ? agent.color : "text-white/60"}`} />
                    <h3 className={`font-medium text-sm ${isSelected ? "text-white" : "text-white/80"}`}>
                      {agent.name}
                    </h3>
                  </div>
                  <p className="text-xs text-white/50">{agent.description}</p>
                </button>
              );
            })}
          </div>

          {/* Agent Interface */}
          <div className="space-y-6">
            {/* Selected Agent Header */}
            <div className={`rounded-lg border ${selectedAgent.borderColor} ${selectedAgent.bgColor} p-6`}>
              <div className="flex items-center gap-2.5 mb-2">
                {React.createElement(selectedAgent.icon, {
                  className: `h-4 w-4 flex-shrink-0 ${selectedAgent.color}`,
                })}
                <h2 className="text-lg font-medium text-white">{selectedAgent.name}</h2>
              </div>
              <p className="text-sm text-white/70">{selectedAgent.description}</p>
            </div>

            {/* Question Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={selectedAgent.placeholder}
                  rows={4}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/20 focus:outline-none resize-none"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="w-full rounded-lg bg-wcGold px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Asking {selectedAgent.name}...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Ask {selectedAgent.name}
                  </>
                )}
              </button>
            </form>

            {/* Response Display */}
            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {response && (
              <div className={`rounded-lg border ${selectedAgent.borderColor} ${selectedAgent.bgColor} p-6`}>
                <div className="flex items-center gap-2.5 mb-4">
                  {React.createElement(selectedAgent.icon, {
                    className: `h-4 w-4 flex-shrink-0 ${selectedAgent.color}`,
                  })}
                  <h3 className="font-medium text-sm text-white">{selectedAgent.name} Response</h3>
                </div>

                {typeof response === "string" ? (
                  <p className="text-sm text-white/80 whitespace-pre-wrap">{response}</p>
                ) : (
                  <div className="space-y-3">
                    {response.summary && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">Summary</p>
                        <p className="text-sm text-white/80">{response.summary}</p>
                      </div>
                    )}

                    {response.insights && Array.isArray(response.insights) && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-2">Insights</p>
                        <ul className="space-y-2">
                          {response.insights.map((insight, idx) => (
                            <li key={idx} className="text-sm text-white/70 flex items-start gap-2">
                              <span className="text-wcGold mt-1">•</span>
                              <span>{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {response.wisdom && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">Wisdom</p>
                        <p className="text-sm text-white/80">{response.wisdom}</p>
                      </div>
                    )}

                    {response.steps && Array.isArray(response.steps) && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-2">Steps</p>
                        <ol className="space-y-2 list-decimal list-inside">
                          {response.steps.map((step, idx) => (
                            <li key={idx} className="text-sm text-white/70">{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {response.riskLevel && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">Risk Level</p>
                        <p className={`text-sm font-medium ${
                          response.riskLevel === "high" ? "text-red-400" :
                          response.riskLevel === "medium" ? "text-amber-400" :
                          "text-green-400"
                        }`}>
                          {response.riskLevel.toUpperCase()}
                        </p>
                      </div>
                    )}

                    {response.alerts && Array.isArray(response.alerts) && response.alerts.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-red-400 mb-2">Alerts</p>
                        <ul className="space-y-1">
                          {response.alerts.map((alert, idx) => (
                            <li key={idx} className="text-sm text-red-300">⚠️ {alert}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!response.summary && !response.insights && !response.wisdom && !response.steps && (
                      <pre className="text-xs text-white/60 overflow-auto">
                        {JSON.stringify(response, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentsPage;

