// src/apps/support/SupportHubPage.jsx

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trackPageView } from "../../services/telemetry";
import { Phone, Heart, Building2 } from "lucide-react";

const SUPPORT_TO_DIRECTORY = {
  crisis: "/resources?type=hotlines",
  resources: "/resources?type=programs",
  government: "/resources?type=assistance",
};

const SupportHubPage = () => {
  const navigate = useNavigate();

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
