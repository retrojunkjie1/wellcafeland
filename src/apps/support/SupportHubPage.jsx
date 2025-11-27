// src/apps/support/SupportHubPage.jsx

import React, { useEffect } from "react";
import { trackPageView } from "../../services/telemetry";
import { Phone, Heart, Building2, MapPin, BookOpen, Users } from "lucide-react";
import FooterMinimal from "@/components/FooterMinimal";
import PageHeader from "@/components/navigation/PageHeader";

const SupportHubPage = () => {
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
      <PageHeader 
        title="Find Support" 
        subtitle="Hotlines • Assistance • Recovery Resources"
      />
      <div className="lux-shell py-10 space-y-8 flex-1">
        {/* Header */}
        <header className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Support & Resources
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Find Support
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Hotlines • Assistance • Recovery Resources
          </p>
        </header>

        {/* Support Cards Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {supportCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className={`lux-card p-6 border-2 ${card.borderColor} ${card.bgColor} transition-all hover:scale-[1.02] hover:shadow-lg`}
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
                    {card.comingSoon && (
                      <span className="inline-block mt-3 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Coming Soon Notice */}
        <div className="lux-card p-6 border border-border/50 bg-muted/30">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold mb-1">More Resources Coming Soon</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We're building a comprehensive directory of crisis hotlines, local recovery resources, 
                government assistance programs, and support networks. This will be available during Launch Prep.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportHubPage;

