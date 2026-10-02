import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseMedical,
  HandHeart,
  HeartHandshake,
  Home,
  MapPin,
  PhoneCall,
  UsersRound,
  Wallet,
} from "lucide-react";
import { getPracticeReturnPath } from "./assistanceReturnPath";

const NEEDS = [
  {
    id: "housing",
    title: "A safe place to stay",
    description: "Shelter, sober living, or a place to land.",
    icon: Home,
    to: "/assistance?priority=housing",
    tone: "amber",
  },
  {
    id: "food",
    title: "Food and essentials",
    description: "Meals, groceries, and everyday necessities.",
    icon: MapPin,
    to: "/assistance?priority=food",
    tone: "emerald",
  },
  {
    id: "meetings",
    title: "A.A. or N.A. meetings",
    description: "Find online or in-person recovery meetings.",
    icon: UsersRound,
    to: "/recovery/meetings",
    tone: "blue",
  },
  {
    id: "care",
    title: "Treatment and programs",
    description: "Explore care options and recovery services.",
    icon: BriefcaseMedical,
    to: "/assistance?priority=programs",
    tone: "violet",
  },
  {
    id: "funding",
    title: "Money or benefits",
    description: "Look for treatment funding and practical aid.",
    icon: Wallet,
    to: "/assistance?priority=funding",
    tone: "teal",
  },
  {
    id: "urgent",
    title: "I need urgent support",
    description: "See crisis options and immediate contacts.",
    icon: PhoneCall,
    to: "/assistance?priority=emergency",
    tone: "rose",
  },
];

const TONES = {
  amber: "border-amber-200/20 bg-amber-100/[0.045] text-amber-200 group-hover:border-amber-200/45",
  emerald: "border-emerald-200/20 bg-emerald-100/[0.045] text-emerald-200 group-hover:border-emerald-200/45",
  blue: "border-sky-200/20 bg-sky-100/[0.045] text-sky-200 group-hover:border-sky-200/45",
  violet: "border-violet-200/20 bg-violet-100/[0.045] text-violet-200 group-hover:border-violet-200/45",
  teal: "border-teal-200/20 bg-teal-100/[0.045] text-teal-200 group-hover:border-teal-200/45",
  rose: "border-rose-200/20 bg-rose-100/[0.045] text-rose-200 group-hover:border-rose-200/45",
};

export const assistanceNeeds = NEEDS;

const AssistanceHubPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnToPractice = getPracticeReturnPath(location.state);
  const continueTo = (to) => navigate(to, { state: location.state });

  return (
    <main className="min-h-full bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
        <header className="mb-6 sm:mb-8">
          {returnToPractice && <button type="button" onClick={() => navigate(returnToPractice)} className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/70 transition hover:bg-white/[0.05] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"><ArrowRight aria-hidden="true" className="h-4 w-4 rotate-180" />Back to your practice</button>}
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/80">Real-world support</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">What would help today?</h1>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">Choose one need to start. You can change direction at any time.</p>
        </header>

        <section aria-label="Choose the kind of help you need" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {NEEDS.map(({ id, title, description, icon: Icon, to, tone }) => (
            <button
              key={id}
              type="button"
              onClick={() => continueTo(to)}
              className={`group flex min-h-28 items-center gap-4 rounded-2xl border bg-slate-900/70 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 sm:min-h-32 sm:p-5 ${TONES[tone]}`}
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/20 sm:h-14 sm:w-14">
                <Icon aria-hidden="true" className="h-6 w-6 sm:h-7 sm:w-7" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-semibold leading-snug text-white sm:text-xl">{title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-white/65 sm:text-base">{description}</span>
              </span>
              <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0 text-white/45 transition group-hover:translate-x-1 group-hover:text-white" />
            </button>
          ))}
        </section>

        <section className="mt-6 grid grid-cols-1 gap-3 border-t border-white/10 pt-5 sm:grid-cols-2" aria-label="Other ways to find support">
          <button
            type="button"
            onClick={() => continueTo("/assistance/community")}
            className="flex min-h-16 items-center gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200"
          >
            <HandHeart aria-hidden="true" className="h-6 w-6 shrink-0 text-emerald-200" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-white">Give or receive community support</span>
              <span className="mt-0.5 block text-sm text-white/55">Practical help offered by real people.</span>
            </span>
            <ArrowRight aria-hidden="true" className="h-4 w-4 text-white/40" />
          </button>
          <button
            type="button"
            onClick={() => continueTo("/providers")}
            className="flex min-h-16 items-center gap-3 rounded-xl px-2 py-3 text-left transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-200"
          >
            <HeartHandshake aria-hidden="true" className="h-6 w-6 shrink-0 text-sky-200" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-white">Find a practitioner</span>
              <span className="mt-0.5 block text-sm text-white/55">Browse wellness and recovery providers.</span>
            </span>
            <ArrowRight aria-hidden="true" className="h-4 w-4 text-white/40" />
          </button>
        </section>

        <p className="mt-6 rounded-xl border border-rose-200/15 bg-rose-200/[0.04] px-4 py-3 text-sm text-white/70">
          In immediate danger? Call your local emergency number. In the U.S., call or text <a className="font-semibold text-rose-200 underline underline-offset-4" href="tel:988">988</a> for crisis support.
        </p>
      </div>
    </main>
  );
};

export default AssistanceHubPage;
