import React from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { withFrom } from "@/navigation/linkState";
import { LifeBuoy, Home, Wallet, Hospital, MapPin, PhoneCall, Search } from "lucide-react";

const CARDS = [
  {
    id: "housing",
    title: "Housing & Sober Living",
    description: "Find sober homes, transitional housing, and emergency shelter options.",
    icon: Home,
    action: "navigate",
    to: "/workspace/real-help?priority=housing",
  },
  {
    id: "food",
    title: "Food & Groceries",
    description: "Look for food assistance, pantries, and community kitchens near you.",
    icon: MapPin,
    action: "navigate",
    to: "/workspace/real-help?priority=food",
  },
  {
    id: "grants",
    title: "Grants & Funding",
    description: "Search for treatment funding, grants, and financial aid programs.",
    icon: Wallet,
    action: "navigate",
    to: "/workspace/real-help?priority=funding",
  },
  {
    id: "programs",
    title: "Programs & Treatment",
    description: "Detox, residential, PHP, IOP, and outpatient programs.",
    icon: Hospital,
    action: "navigate",
    to: "/workspace/real-help?priority=programs",
  },
  {
    id: "emergency",
    title: "Emergency & Crisis",
    description: "Hotlines, crisis lines, and urgent support options.",
    icon: PhoneCall,
    action: "navigate",
    to: "/workspace/real-help?priority=emergency",
  },
  {
    id: "custom",
    title: "Help Me Find Something Else",
    description: "Describe what you need and let WellnessCafe search across all categories.",
    icon: Search,
    action: "navigate",
    to: "/workspace/real-help",
  },
];

const AssistanceHubPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex h-full flex-col bg-slate-950">
      <div className="mx-auto w-full max-w-5xl px-4 py-4 sm:px-6 sm:py-5">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-4 sm:mb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-amber-200">
              <LifeBuoy className="h-3 w-3" />
              <span>Assistance Hub</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-light text-white">
              Real-world help, not just talk.
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-white/60">
              Housing, food, treatment, grants, and emergency support — all in one place.
              When life outside the app is loud, this is where WellnessCafe rolls up its sleeves.
            </p>
          </div>
          {/* Phase A1: Link to AssistancePage with from state */}
          <Link
            to="/assistance/request"
            {...withFrom(location)}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/80 hover:bg-white/10 transition"
          >
            Request Help
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  if (card.action === "navigate" && card.to) {
                    navigate(card.to, withFrom(location));
                  }
                }}
                className="flex min-h-[88px] flex-col items-start rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950/95 p-3 text-left shadow-sm transition hover:border-amber-300/40 hover:shadow-[0_0_30px_-12px_rgba(251,191,36,0.4)]"
              >
                <div className="mb-2 flex items-center gap-2.5 w-full">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/10 border border-amber-400/30 flex-shrink-0">
                    <Icon className="h-4 w-4 text-amber-300" />
                  </div>
                  <h2 className="text-sm font-medium text-white truncate flex-1">
                    {card.title}
                  </h2>
                </div>
                <p className="text-xs text-white/60 line-clamp-2 mb-auto">
                  {card.description}
                </p>
                <span className="mt-2 text-[10px] font-medium text-amber-300/80 uppercase tracking-wider">
                  Open
                </span>
              </button>
            );
          })}
        </div>

        {/* Hint about chat integration */}
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs text-white/70">
          You can also just type{" "}
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[11px]">
            "help me find housing"
          </span>{" "}
          or{" "}
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[11px]">
            "I need food assistance"
          </span>{" "}
          in the chat, and WellnessCafe will route you here automatically.
        </div>
      </div>
    </div>
  );
};

export default AssistanceHubPage;

