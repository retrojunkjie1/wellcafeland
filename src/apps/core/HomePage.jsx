// src/apps/core/HomePage.jsx
// Phase 2E: Luxury clinical wellness OS — premium, non-repetitive layout

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  MessageCircle,
  HeartHandshake,
  Flower2,
  Wind,
  Mountain,
  Moon,
  Sparkles,
  ArrowUpRight,
  ChevronDown,
  HeartPulse,
  BookOpen,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { trackPageView } from "../../services/telemetry";
import { listResources } from "@/data/resources";
import { ensureDevAuth } from "@/dev/ensureAuth";
import PractitionerSupportInbox from "@/components/PractitionerSupportInbox";
import ClientNextSessionCard from "@/components/ClientNextSessionCard";
import ClientWeekProgress from "./ClientWeekProgress";
import { navigateToTool } from "@/navigation/toolReturn";

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasResources, setHasResources] = useState(null);
  const [showStabilizers, setShowStabilizers] = useState(false);

  const walkthrough = useMemo(() => new URLSearchParams(location.search).get("tour") === "home", [location.search]);

  useEffect(() => {
    document.title = "WellnessCafe - Home";
    trackPageView("home");
  }, []);

  useEffect(() => {
    const run = async () => {
      if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "true") {
        const ok = await ensureDevAuth();
        if (!ok) {
          setHasResources(false);
          return;
        }
      }
      listResources({ mode: "indexed" })
        .then((r) => {
          if (Array.isArray(r.items)) setHasResources(r.items.length > 0);
          else setHasResources(false);
        })
        .catch(() => setHasResources(false));
    };
    run();
  }, []);

  return (
    <div className="wc-home mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6 sm:py-8">
      <section className="wc-home-hero" data-tour="home-welcome">
        <p className="wc-home-eyebrow"><Sparkles aria-hidden="true" className="h-4 w-4" /> SUPPORT, AT YOUR PACE</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">What would help most right now?</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">Choose one place to begin. You can change direction whenever you want.</p>
      </section>

      <Link
        to="/getting-started"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/80 transition hover:border-amber-200/50 hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
      >
        <BookOpen aria-hidden="true" className="h-4 w-4 text-amber-200" />
        New here? See how WellnessCafe works
      </Link>

      <ClientNextSessionCard />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Choose a kind of support">
        <button
          type="button"
          onClick={() => navigate("/chat", { state: { startConversation: true } })}
          className="wc-home-pathway wc-home-pathway--talk group"
          data-tour="home-guide"
        >
          <span className="wc-home-pathway__icon wc-home-pathway__icon--talk"><MessageCircle aria-hidden="true" className="h-6 w-6" /><Sparkles aria-hidden="true" className="wc-home-pathway__sparkle h-3.5 w-3.5" /></span>
          <span className="wc-home-pathway__copy"><span className="wc-home-pathway__title">Talk it through</span><span className="wc-home-pathway__description">Start with what’s on your mind.</span></span>
          <ArrowUpRight aria-hidden="true" className="wc-home-pathway__arrow h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => navigate("/assistance")}
          className="wc-home-pathway wc-home-pathway--help group"
          data-tour="home-help"
        >
          <span className="wc-home-pathway__icon wc-home-pathway__icon--help"><HeartHandshake aria-hidden="true" className="h-7 w-7" /></span>
          <span className="wc-home-pathway__copy"><span className="wc-home-pathway__title">Find real-world help</span><span className="wc-home-pathway__description">Housing, food, treatment, and more.</span></span>
          <ArrowUpRight aria-hidden="true" className="wc-home-pathway__arrow h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => navigate("/tools")}
          className="wc-home-pathway wc-home-pathway--practice group"
          data-tour="home-practice"
        >
          <span className="wc-home-pathway__icon wc-home-pathway__icon--practice"><Flower2 aria-hidden="true" className="h-7 w-7" /></span>
          <span className="wc-home-pathway__copy"><span className="wc-home-pathway__title">Daily Practice</span><span className="wc-home-pathway__description">A practice you can choose and keep.</span></span>
          <ArrowUpRight aria-hidden="true" className="wc-home-pathway__arrow h-5 w-5" />
        </button>
      </section>

      <section className="wc-home-checkin" data-tour="home-checkin">
        <div className="flex items-start gap-3 sm:items-center">
          <div className="wc-home-checkin__icon">
            <HeartPulse className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-200/80">A moment for you</p>
            <h2 className="mt-1 text-lg font-semibold text-white">Daily check-in</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/65">Share only what you want. You can leave any question blank.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("/check-in")}
          className="wc-home-checkin-cta mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-wcGold px-5 text-sm font-semibold text-slate-950 transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wcGold sm:mt-0 sm:w-auto sm:shrink-0"
        >
          Begin check-in <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </section>

      {walkthrough && <HomeWalkthrough onClose={() => navigate("/home", { replace: true })} />}

      <ClientWeekProgress />

      <PractitionerSupportInbox />

      {/* 2) Stabilizers — small row, only on tap */}
      <section>
        <button
          type="button"
          onClick={() => setShowStabilizers((s) => !s)}
          className="w-full flex items-center justify-between py-2 px-3 rounded-lg text-white/50 hover:text-white/70 hover:bg-white/5 transition text-sm"
        >
          <span>Quick stabilizers</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showStabilizers ? "rotate-180" : ""}`}
          />
        </button>
        {showStabilizers && (
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              type="button"
              onClick={() => navigateToTool(navigate, "/tools/breathing", location)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/80 text-sm transition"
            >
              <Wind className="h-4 w-4" />
              Breathing
            </button>
            <button
              type="button"
              onClick={() => navigateToTool(navigate, "/tools/grounding", location)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/80 text-sm transition"
            >
              <Mountain className="h-4 w-4" />
              Grounding
            </button>
            <button
              type="button"
              onClick={() => navigateToTool(navigate, "/tools/recovery.sleep-and-recovery", location)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/80 text-sm transition"
            >
              <Moon className="h-4 w-4" />
              Sleep
            </button>
          </div>
        )}
      </section>

      {/* Keep the resource reminder small; check-in progress is shown above from saved check-ins. */}
      <section className="flex flex-wrap gap-4 justify-center pt-2">
        {hasResources && (
          <button
            type="button"
            onClick={() => navigate("/resources")}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition"
          >
            Resources available
          </button>
        )}
      </section>
    </div>
  );
};

const HOME_TOUR_STEPS = [
  { selector: '[data-tour="home-welcome"]', title: "Start with what you need", body: "Choose a place to begin. You can return to this home screen or change direction at any time.", nextLabel: "Next" },
  { selector: '[aria-label="Open navigation menu"]', title: "Find your way around", body: "Open Menu to move between pages. Workspace choices appear here when your account has access to them.", nextLabel: "Show me the menu", opensMenu: true },
  { selector: "#wc-primary-navigation", title: "Your menu", body: "Choose a destination from this list. Your available pages and workspaces depend on your account.", nextLabel: "Continue" },
  { selector: '[data-tour="home-guide"]', title: "Talk it through", body: "Open a conversation to put words to what is happening and explore a manageable next step.", nextLabel: "Next" },
  { selector: '[data-tour="home-practice"]', title: "Choose a practice", body: "Browse guided breathing, grounding, and other practices. Choose one that fits today and move at your own pace.", nextLabel: "Next" },
  { selector: '[data-tour="home-checkin"]', title: "Check in at your pace", body: "A check-in can help you notice how you are doing. It is optional; skip anything you would rather not answer.", nextLabel: "Next" },
  { selector: '[data-tour="home-help"]', title: "Find practical support", body: "Look for local resources and services such as housing, food, and treatment support.", nextLabel: "Finish" },
];

function HomeWalkthrough({ onClose }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const dialogRef = useRef(null);
  const nextButtonRef = useRef(null);
  const step = HOME_TOUR_STEPS[stepIndex];

  useEffect(() => {
    document.body.dataset.wcTourActive = "true";
    return () => { delete document.body.dataset.wcTourActive; };
  }, []);

  useEffect(() => {
    nextButtonRef.current?.focus({ preventScroll: true });
  }, [stepIndex]);

  useEffect(() => {
    const containFocus = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        document.querySelector('[aria-label="Close navigation menu"]')?.click();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const controls = [...dialogRef.current.querySelectorAll('button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])')];
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", containFocus);
    return () => document.removeEventListener("keydown", containFocus);
  }, [onClose]);

  useEffect(() => {
    if (stepIndex === 2 && !document.querySelector("#wc-primary-navigation")) {
      document.querySelector('[aria-label="Open navigation menu"]')?.click();
    }
    const target = document.querySelector(step.selector);
    target?.scrollIntoView?.({ behavior: "smooth", block: "center", inline: "nearest" });

    let frame = 0;
    const measure = () => {
      const currentTarget = document.querySelector(step.selector);
      const rect = currentTarget?.getBoundingClientRect();
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        target: rect ? { x: rect.left - 4, y: rect.top - 4, width: rect.width + 8, height: rect.height + 8 } : null,
      });
    };
    const scheduleMeasure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const timeout = window.setTimeout(scheduleMeasure, stepIndex === 2 ? 140 : 40);
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("scroll", scheduleMeasure, true);
    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure, true);
    };
  }, [step.selector, stepIndex]);

  const advance = () => {
    if (step.opensMenu) {
      document.querySelector(step.selector)?.click();
      window.setTimeout(() => setStepIndex((current) => current + 1), 140);
      return;
    }
    if (stepIndex === HOME_TOUR_STEPS.length - 1) {
      const closeButton = document.querySelector('[aria-label="Close navigation menu"]');
      closeButton?.click();
      onClose();
      return;
    }
    if (stepIndex === 2) document.querySelector('[aria-label="Close navigation menu"]')?.click();
    setStepIndex((current) => current + 1);
  };

  const goBack = () => {
    if (stepIndex === 3) document.querySelector('[aria-label="Open navigation menu"]')?.click();
    if (stepIndex === 2) document.querySelector('[aria-label="Close navigation menu"]')?.click();
    setStepIndex((current) => Math.max(0, current - 1));
  };

  return (
    <>
      <svg className="fixed inset-0 z-[9998] h-full w-full" aria-hidden="true" viewBox={`0 0 ${viewport.width || 1} ${viewport.height || 1}`} preserveAspectRatio="none">
        <defs>
          <mask id="wellnesscafe-tour-spotlight" maskUnits="userSpaceOnUse" x="0" y="0" width={viewport.width || 1} height={viewport.height || 1}>
            <rect width="100%" height="100%" fill="white" />
            {viewport.target && <rect x={viewport.target.x} y={viewport.target.y} width={viewport.target.width} height={viewport.target.height} rx="20" fill="black" />}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(3, 8, 20, 0.76)" mask="url(#wellnesscafe-tour-spotlight)" />
        {viewport.target && <rect x={viewport.target.x} y={viewport.target.y} width={viewport.target.width} height={viewport.target.height} rx="20" fill="none" stroke="rgba(250, 224, 160, 0.95)" strokeWidth="2" />}
      </svg>
      <section ref={dialogRef} className="wc-home-tour-dialog fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[9999] mx-auto max-h-[min(48vh,24rem)] max-w-xl overflow-y-auto overscroll-contain rounded-2xl border border-amber-100/25 bg-slate-950 p-4 text-white shadow-2xl sm:inset-x-4 sm:bottom-6 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="home-tour-title" aria-describedby="home-tour-description">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="wc-home-tour-dialog__eyebrow text-xs font-semibold uppercase tracking-[0.15em] text-amber-200/75">Walkthrough · {stepIndex + 1} of {HOME_TOUR_STEPS.length}</p>
            <h2 id="home-tour-title" className="wc-home-tour-dialog__title mt-2 text-xl font-semibold">{step.title}</h2>
            <p id="home-tour-description" className="wc-home-tour-dialog__description mt-2 text-sm leading-relaxed text-white/70">{step.body}</p>
          </div>
          <button type="button" onClick={() => { document.querySelector('[aria-label="Close navigation menu"]')?.click(); onClose(); }} className="wc-home-tour-dialog__exit flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/65 hover:bg-white/10 hover:text-white" aria-label="Exit walkthrough"><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3 sm:mt-5 sm:gap-3 sm:pt-4">
          <button type="button" onClick={goBack} disabled={stepIndex === 0} className="wc-home-tour-dialog__back inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm text-white/70 hover:bg-white/5 disabled:opacity-35"><ChevronLeft className="h-4 w-4" aria-hidden="true" />Back</button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => { document.querySelector('[aria-label="Close navigation menu"]')?.click(); onClose(); }} className="wc-home-tour-dialog__skip min-h-10 rounded-lg px-3 text-sm text-white/60 hover:text-white">Skip tour</button>
            <button ref={nextButtonRef} type="button" onClick={advance} className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-amber-200 px-4 text-sm font-semibold text-slate-950 hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-100">{step.nextLabel}<ChevronRight className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
