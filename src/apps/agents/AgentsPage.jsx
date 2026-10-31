// src/apps/agents/AgentsPage.jsx
// User-facing page to interact with AI agents (Seer, Oracle, Overseer, Sentinel)

import React, { useState, useEffect } from "react";
import { callAgent } from "@/ai/agents/agentClient";
import { trackPageView } from "../../services/telemetry";
import { Eye, Sparkles, Compass, Shield, Loader2, Send, BookOpen, Lightbulb, MapPin, Wind, ScanHeart, UsersRound, Sprout } from "lucide-react";
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
    id: "sentinel",
    name: "The Sentinel",
    icon: Shield,
    description: "Monitors for risk and flags alerts to keep you safe.",
    color: "text-red-400",
    bgColor: "bg-red-400/10",
    borderColor: "border-red-400/30",
    placeholder: "Ask about risk assessment or safety...",
  },
  {
    id: "scribe",
    name: "Scribe",
    icon: BookOpen,
    description: "Offers one optional, focused reflection prompt for your own journal.",
    color: "text-emerald-300",
    bgColor: "bg-emerald-300/10",
    borderColor: "border-emerald-300/30",
    placeholder: "What would you like a reflection prompt about?",
  },
  {
    id: "lantern",
    name: "Lantern",
    icon: Lightbulb,
    description: "Explains a wellbeing topic in plain language and offers one optional next step.",
    color: "text-amber-200",
    bgColor: "bg-amber-200/10",
    borderColor: "border-amber-200/30",
    placeholder: "What would you like explained?",
  },
  {
    id: "anchor",
    name: "Anchor",
    icon: MapPin,
    description: "Offers one optional sensory grounding cue and opens the guided grounding practice.",
    color: "text-teal-300",
    bgColor: "bg-teal-300/10",
    borderColor: "border-teal-300/30",
    placeholder: "What would help you feel a little more present right now?",
    toolPath: "/tools/grounding",
    toolLabel: "Open grounding guide",
  },
  {
    id: "breathkeeper",
    name: "Breathkeeper",
    icon: Wind,
    description: "Offers a choice-led breath cue and opens the gentle paced breathing guide.",
    color: "text-sky-300",
    bgColor: "bg-sky-300/10",
    borderColor: "border-sky-300/30",
    placeholder: "What would make a breathing practice feel comfortable for you?",
    toolPath: "/tools/breathing",
    toolLabel: "Open breathing guide",
  },
  {
    id: "mirror",
    name: "Mirror",
    icon: ScanHeart,
    description: "Reflects your own words back gently, without assuming what they mean.",
    color: "text-violet-300",
    bgColor: "bg-violet-300/10",
    borderColor: "border-violet-300/30",
    placeholder: "What would you like reflected back?",
  },
  {
    id: "shepherd",
    name: "Shepherd",
    icon: UsersRound,
    description: "Helps you explore peer circles or trusted connections at your own pace.",
    color: "text-lime-300",
    bgColor: "bg-lime-300/10",
    borderColor: "border-lime-300/30",
    placeholder: "What kind of connection would feel comfortable?",
    toolPath: "/circles",
    toolLabel: "Explore peer circles",
  },
  {
    id: "compass",
    name: "Compass",
    icon: Compass,
    description: "Helps you choose one small next step that fits a value you name.",
    color: "text-amber-200",
    bgColor: "bg-amber-200/10",
    borderColor: "border-amber-200/30",
    placeholder: "What matters to you as you decide what to do next?",
  },
  {
    id: "gardener",
    name: "Gardener",
    icon: Sprout,
    description: "Helps you recognize an effort you describe, without pressure to feel positive.",
    color: "text-lime-300",
    bgColor: "bg-lime-300/10",
    borderColor: "border-lime-300/30",
    placeholder: "Is there an effort or small moment you'd like to recognize?",
    toolPath: "/milestones",
    toolLabel: "Open milestones",
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

                    {response.invitation && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">A gentle option</p>
                        <p className="text-sm text-white/80">{response.invitation}</p>
                      </div>
                    )}

                    {response.reflection && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">A reflection</p>
                        <p className="text-sm text-white/80">{response.reflection}</p>
                      </div>
                    )}

                    {response.question && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">If you want to explore</p>
                        <p className="text-sm text-white/80">{response.question}</p>
                      </div>
                    )}

                    {response.takeaway && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">Takeaway</p>
                        <p className="text-sm text-white/80">{response.takeaway}</p>
                      </div>
                    )}

                    {response.value && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">A value to consider</p>
                        <p className="text-sm text-white/80">{response.value}</p>
                      </div>
                    )}

                    {response.choice && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">A small choice</p>
                        <p className="text-sm text-white/80">{response.choice}</p>
                      </div>
                    )}

                    {response.win && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">An effort to recognize</p>
                        <p className="text-sm text-white/80">{response.win}</p>
                      </div>
                    )}

                    {response.reinforcement && (
                      <p className="text-sm text-white/70">{response.reinforcement}</p>
                    )}

                    {response.nextStep && !response.toolPath && (
                      <div>
                        <p className="text-xs uppercase tracking-[0.1em] text-white/50 mb-1">Next step</p>
                        <p className="text-sm text-white/80">{response.nextStep}</p>
                      </div>
                    )}

                    {selectedAgent.toolPath && (
                      <a
                        href={selectedAgent.toolPath}
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-medium text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-wcGold"
                      >
                        {selectedAgent.toolLabel}
                      </a>
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

                    {!response.summary && !response.insights && !response.wisdom && !response.steps && !response.reflection && !response.invitation && !response.takeaway && !response.question && (
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
