// src/apps/support/SupportHubPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { trackPageView } from "../../services/telemetry";
import { Phone, Heart, Building2 } from "lucide-react";
import { runWellnessExperience } from "@/ai/experience/experienceEngine";

const SUPPORT_TO_DIRECTORY = {
  crisis: "/resources?type=hotlines",
  resources: "/resources?type=programs",
  government: "/resources?type=assistance",
};

const SupportHubPage = () => {
  const navigate = useNavigate();
  const [hearthChoice, setHearthChoice] = useState("");
  const [hearthLoading, setHearthLoading] = useState(false);
  const [hearthResponse, setHearthResponse] = useState(null);
  const [hearthError, setHearthError] = useState("");
  const [lighthouseCue, setLighthouseCue] = useState("");
  const [lighthouseLoading, setLighthouseLoading] = useState(false);
  const [lighthouseResponse, setLighthouseResponse] = useState(null);
  const [lighthouseError, setLighthouseError] = useState("");
  const [sentinelChoice, setSentinelChoice] = useState("");
  const [sentinelLoading, setSentinelLoading] = useState(false);
  const [sentinelRoute, setSentinelRoute] = useState(null);
  const [sentinelError, setSentinelError] = useState("");

  const requestHearthSupport = async () => {
    if (!hearthChoice || hearthLoading) return;
    setHearthLoading(true);
    setHearthResponse(null);
    setHearthError("");
    try {
      const { result } = await runWellnessExperience("support.companion", { choice: hearthChoice });
      if (![result.summary, result.invitation, result.nextStep].every((value) => typeof value === "string" && value.trim())) {
        throw new Error("This support is unavailable right now. You can still explore the options below.");
      }
      setHearthResponse({
        summary: result.summary.trim().slice(0, 180),
        invitation: result.invitation.trim().slice(0, 300),
        nextStep: result.nextStep.trim().slice(0, 240),
      });
    } catch {
      setHearthError("A supportive message isn’t available right now. You can still explore the options below or leave this for later.");
    } finally {
      setHearthLoading(false);
    }
  };

  const requestLighthouseSupport = async () => {
    if (!lighthouseCue || lighthouseLoading) return;
    setLighthouseLoading(true);
    setLighthouseResponse(null);
    setLighthouseError("");
    try {
      const { result } = await runWellnessExperience("support.early-option", { cue: lighthouseCue });
      if (![result.reflection, result.option, result.supportStep].every((value) => typeof value === "string" && value.trim())) {
        throw new Error("This support is unavailable right now.");
      }
      setLighthouseResponse({
        reflection: result.reflection.trim().slice(0, 200),
        option: result.option.trim().slice(0, 320),
        supportStep: result.supportStep.trim().slice(0, 240),
      });
    } catch {
      setLighthouseError("An early-support idea isn’t available right now. You can still choose one of the options below or leave this for later.");
    } finally {
      setLighthouseLoading(false);
    }
  };

  const requestSentinelRoute = async () => {
    if (!sentinelChoice || sentinelLoading) return;
    setSentinelLoading(true);
    setSentinelRoute(null);
    setSentinelError("");
    try {
      const { result } = await runWellnessExperience("support.human-route", { supportNeed: sentinelChoice });
      if (![result.summary, result.invitation, result.nextStep].every((value) => typeof value === "string" && value.trim())
        || result.resourcePath !== "/resources?type=hotlines") {
        throw new Error("Support routes are unavailable right now.");
      }
      setSentinelRoute({
        summary: result.summary.trim().slice(0, 180),
        invitation: result.invitation.trim().slice(0, 320),
        nextStep: result.nextStep.trim().slice(0, 320),
        resourcePath: result.resourcePath,
      });
    } catch {
      setSentinelError("This guide is unavailable right now. The direct support contacts below are still available.");
    } finally {
      setSentinelLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Find Support - WellnessCafe";
    trackPageView("support_hub");
  }, []);

  const supportCards = [
    {
      id: "crisis",
      title: "Crisis Hotlines",
      description: "24/7 support for immediate help. National Suicide Prevention Lifeline, SAMHSA, and more.",
      icon: Phone,
      color: "text-red-400",
      bgColor: "bg-red-400/10",
      borderColor: "border-red-400/30",
      comingSoon: false,
    },
    {
      id: "resources",
      title: "Recovery Resources",
      description: "Local rehab centers, sober living facilities, support groups, and recovery programs.",
      icon: Heart,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
      borderColor: "border-amber-400/30",
      comingSoon: false,
    },
    {
      id: "government",
      title: "Government Assistance",
      description: "SAMHSA resources, government programs, insurance help, and financial assistance options.",
      icon: Building2,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
      borderColor: "border-blue-400/30",
      comingSoon: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="lux-shell py-10 space-y-8 flex-1">
        <section className="lux-card border border-rose-200/20 bg-rose-100/[0.035] p-5 sm:p-6" aria-labelledby="sentinel-heading">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-rose-100/75">Immediate human support</p>
            <h2 id="sentinel-heading" className="mt-2 text-xl font-semibold">What kind of help would be useful?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Choose a route. It does not assess or label you. Only your selected route is sent to prepare these options; no writing or conversation is sent.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Choose a support route">
            {[
              ["immediate-danger", "Immediate danger"],
              ["need-a-person", "I need a person now"],
              ["unsure", "I’m not sure yet"],
            ].map(([value, label]) => (
              <button key={value} type="button" aria-pressed={sentinelChoice === value} onClick={() => { setSentinelChoice(value); setSentinelRoute(null); setSentinelError(""); }} className={`min-h-10 rounded-full border px-3 text-sm transition ${sentinelChoice === value ? "border-rose-100/45 bg-rose-100/[0.15] text-foreground" : "border-border bg-background/40 text-muted-foreground hover:bg-background/70"}`}>
                {label}
              </button>
            ))}
          </div>
          <button type="button" onClick={requestSentinelRoute} disabled={!sentinelChoice || sentinelLoading} className="mt-4 min-h-11 rounded-full border border-rose-100/25 bg-rose-100/[0.08] px-4 text-sm font-medium text-foreground hover:bg-rose-100/[0.14] disabled:cursor-not-allowed disabled:opacity-50">
            {sentinelLoading ? "Opening support options…" : "Show support options"}
          </button>
          {sentinelRoute && <div className="mt-4 max-w-2xl rounded-xl border border-border bg-background/40 p-4" aria-live="polite"><p className="text-sm font-medium text-foreground">{sentinelRoute.summary}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{sentinelRoute.invitation}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{sentinelRoute.nextStep}</p><button type="button" onClick={() => navigate(sentinelRoute.resourcePath)} className="mt-3 min-h-10 rounded-full border border-border px-3 text-sm text-foreground hover:bg-background/70">Browse crisis and hotline options</button></div>}
          {sentinelError && <p role="alert" className="mt-3 max-w-2xl text-sm text-amber-700 dark:text-amber-200">{sentinelError}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/70 pt-4 text-sm">
            <span className="text-muted-foreground">Direct contacts · U.S. and territories</span>
            <a className="min-h-10 rounded-full border border-rose-100/25 px-3 py-2 font-medium text-foreground hover:bg-rose-100/[0.08]" href="tel:911">Call 911</a>
            <a className="min-h-10 rounded-full border border-rose-100/25 px-3 py-2 font-medium text-foreground hover:bg-rose-100/[0.08]" href="tel:988">Call 988</a>
            <a className="min-h-10 rounded-full border border-rose-100/25 px-3 py-2 font-medium text-foreground hover:bg-rose-100/[0.08]" href="sms:988">Text 988</a>
            <a className="min-h-10 rounded-full border border-border px-3 py-2 text-foreground hover:bg-background/70" href="https://chat.988lifeline.org/" target="_blank" rel="noreferrer">Chat with 988</a>
          </div>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground">If you or someone else is in immediate physical danger, contact your local emergency service now. In the U.S., call 911.</p>
        </section>
        <section className="lux-card border border-violet-200/15 bg-violet-100/[0.035] p-5 sm:p-6" aria-labelledby="hearth-heading">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-100/70">Optional, private moment</p>
            <h2 id="hearth-heading" className="mt-2 text-xl font-semibold">Would a little company help?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Choose a short description to receive one gentle, non-clinical message. We send only this choice, not your writing or conversation. You can skip it.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Choose the kind of support">
            {[
              ["quiet-company", "Quiet company"],
              ["miss-someone", "I miss someone"],
              ["feel-disconnected", "I feel disconnected"],
              ["not-sure", "I’m not sure"],
            ].map(([value, label]) => (
              <button key={value} type="button" aria-pressed={hearthChoice === value} onClick={() => { setHearthChoice(value); setHearthResponse(null); setHearthError(""); }} className={`min-h-10 rounded-full border px-3 text-sm transition ${hearthChoice === value ? "border-violet-100/40 bg-violet-100/[0.15] text-foreground" : "border-border bg-background/40 text-muted-foreground hover:bg-background/70"}`}>
                {label}
              </button>
            ))}
            <button type="button" onClick={() => { setHearthChoice(""); setHearthResponse(null); setHearthError(""); }} className="min-h-10 rounded-full px-3 text-sm text-muted-foreground underline-offset-4 hover:underline">Skip</button>
          </div>
          <button type="button" onClick={requestHearthSupport} disabled={!hearthChoice || hearthLoading} className="mt-4 min-h-11 rounded-full border border-violet-100/25 bg-violet-100/[0.08] px-4 text-sm font-medium text-foreground hover:bg-violet-100/[0.14] disabled:cursor-not-allowed disabled:opacity-50">
            {hearthLoading ? "Preparing a message…" : "Offer a kind word"}
          </button>
          {hearthResponse && <div className="mt-4 max-w-2xl rounded-xl border border-border bg-background/40 p-4" aria-live="polite"><p className="text-sm text-muted-foreground">{hearthResponse.summary}</p><p className="mt-2 text-base leading-relaxed text-foreground">{hearthResponse.invitation}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{hearthResponse.nextStep}</p><button type="button" onClick={() => navigate("/circles")} className="mt-3 min-h-10 rounded-full border border-border px-3 text-sm text-foreground hover:bg-background/70">Explore connection options</button></div>}
          {hearthError && <p role="alert" className="mt-3 max-w-2xl text-sm text-amber-700 dark:text-amber-200">{hearthError}</p>}
        </section>
        <section className="lux-card border border-sky-200/15 bg-sky-100/[0.035] p-5 sm:p-6" aria-labelledby="lighthouse-heading">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-sky-100/70">You choose what to notice</p>
            <h2 id="lighthouse-heading" className="mt-2 text-xl font-semibold">Would an early-support idea help?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Choose one cue you notice right now for a small, optional next step. This does not monitor or assess you, and you can skip it. Only your selected cue is sent; no writing or history is included.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Choose an early cue">
            {[
              ["thoughts-racing", "My thoughts feel fast"],
              ["body-tense", "I notice tension"],
              ["restless", "I feel restless"],
              ["urge-building", "An urge is building"],
              ["pulling-away", "I want to withdraw"],
              ["not-sure", "I’m not sure yet"],
            ].map(([value, label]) => (
              <button key={value} type="button" aria-pressed={lighthouseCue === value} onClick={() => { setLighthouseCue(value); setLighthouseResponse(null); setLighthouseError(""); }} className={`min-h-10 rounded-full border px-3 text-sm transition ${lighthouseCue === value ? "border-sky-100/40 bg-sky-100/[0.15] text-foreground" : "border-border bg-background/40 text-muted-foreground hover:bg-background/70"}`}>
                {label}
              </button>
            ))}
            <button type="button" onClick={() => { setLighthouseCue(""); setLighthouseResponse(null); setLighthouseError(""); }} className="min-h-10 rounded-full px-3 text-sm text-muted-foreground underline-offset-4 hover:underline">Skip</button>
          </div>
          <button type="button" onClick={requestLighthouseSupport} disabled={!lighthouseCue || lighthouseLoading} className="mt-4 min-h-11 rounded-full border border-sky-100/25 bg-sky-100/[0.08] px-4 text-sm font-medium text-foreground hover:bg-sky-100/[0.14] disabled:cursor-not-allowed disabled:opacity-50">
            {lighthouseLoading ? "Preparing an idea…" : "Show me one option"}
          </button>
          {lighthouseResponse && <div className="mt-4 max-w-2xl rounded-xl border border-border bg-background/40 p-4" aria-live="polite"><p className="text-sm text-muted-foreground">{lighthouseResponse.reflection}</p><p className="mt-2 text-base leading-relaxed text-foreground">{lighthouseResponse.option}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{lighthouseResponse.supportStep}</p><button type="button" onClick={() => navigate("/resources?type=programs")} className="mt-3 min-h-10 rounded-full border border-border px-3 text-sm text-foreground hover:bg-background/70">Browse support options</button></div>}
          {lighthouseError && <p role="alert" className="mt-3 max-w-2xl text-sm text-amber-700 dark:text-amber-200">{lighthouseError}</p>}
        </section>
        {/* Support Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {supportCards.map((card) => {
            const Icon = card.icon;
            const path = SUPPORT_TO_DIRECTORY[card.id];
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => navigate(path)}
                className={`lux-card w-full p-6 text-left border-2 ${card.borderColor} ${card.bgColor} transition-all cursor-pointer hover:scale-[1.02] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200`}
              >
                <div className="flex items-start gap-4">
                  <div className={`${card.color} flex-shrink-0`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">For immediate danger, contact local emergency services. The resources directory includes curated national options when live local listings are unavailable.</p>
      </div>
    </div>
  );
};

export default SupportHubPage;
