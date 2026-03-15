// src/components/explore/ExploreHub.jsx
// Unified Explore hub that injects modules into chat instead of routing

import React from "react";
import {
  Wrench,
  Users,
  LifeBuoy,
  BookOpen,
  Wind,
  Mountain,
  PenTool,
  Waves,
  Activity,
  MapPin,
  Phone,
  DollarSign,
  GraduationCap,
} from "lucide-react";
import { useInteractionCanvasStore, MODULE_TYPES } from "@/stores/useInteractionCanvasStore";

const EXPLORE_SECTIONS = [
  {
    id: "tools",
    label: "Tools",
    icon: Wrench,
    items: [
      {
        id: "breathing-478",
        label: "4-7-8 Breathing",
        icon: Wind,
        toolType: "breathing",
        toolConfig: { pattern: "4-7-8" },
      },
      {
        id: "breathing-box",
        label: "Box Breathing",
        icon: Wind,
        toolType: "breathing",
        toolConfig: { pattern: "box" },
      },
      {
        id: "grounding-54321",
        label: "5-4-3-2-1 Grounding",
        icon: Mountain,
        toolType: "grounding",
      },
      {
        id: "journaling",
        label: "Journaling",
        icon: PenTool,
        toolType: "journaling",
      },
      {
        id: "urge-surfing",
        label: "Urge Surfing",
        icon: Waves,
        toolType: "urge-surfing",
      },
      {
        id: "body-scan",
        label: "Body Scan",
        icon: Activity,
        toolType: "body-scan",
      },
    ],
  },
  {
    id: "providers",
    label: "Providers",
    icon: Users,
    items: [
      {
        id: "find-therapist",
        label: "Find a Therapist",
        icon: Users,
        action: "search_providers",
        category: "therapist",
      },
      {
        id: "find-coach",
        label: "Find a Coach",
        icon: Users,
        action: "search_providers",
        category: "coach",
      },
      {
        id: "spiritual-support",
        label: "Spiritual Support",
        icon: Users,
        action: "search_providers",
        category: "spiritual",
      },
    ],
  },
  {
    id: "support",
    label: "Support & Resources",
    icon: LifeBuoy,
    items: [
      {
        id: "crisis-hotlines",
        label: "Crisis Hotlines",
        icon: Phone,
        action: "support_search",
        category: "crisis",
      },
      {
        id: "samhsa",
        label: "SAMHSA Assistance",
        icon: LifeBuoy,
        action: "support_search",
        category: "samhsa",
      },
      {
        id: "rehab-programs",
        label: "Rehab Programs",
        icon: LifeBuoy,
        action: "support_search",
        category: "rehab",
      },
      {
        id: "financial-assistance",
        label: "Financial Assistance",
        icon: DollarSign,
        action: "support_search",
        category: "financial",
      },
      {
        id: "sober-living",
        label: "Sober Living",
        icon: MapPin,
        action: "support_search",
        category: "sober_living",
      },
    ],
  },
  {
    id: "education",
    label: "Education & Guides",
    icon: BookOpen,
    items: [
      {
        id: "recovery-basics",
        label: "Recovery Basics",
        icon: GraduationCap,
        action: "education",
        topic: "basics",
      },
      {
        id: "relapse-prevention",
        label: "Relapse Prevention",
        icon: BookOpen,
        action: "education",
        topic: "relapse",
      },
    ],
  },
];

const ExploreHub = ({ isMobile = false, onClose }) => {
  const { injectModule, addMessage, setExploreOpen } = useInteractionCanvasStore();

  const handleItemClick = (item) => {
    if (item.toolType) {
      // Inject tool module
      injectModule(MODULE_TYPES.TOOL, {
        toolId: item.id,
        toolType: item.toolType,
        config: item.toolConfig || {},
      });
      addMessage(
        "assistant",
        `Let's try ${item.label}. I'll guide you through it.`
      );
    } else if (item.action === "support_search") {
      // Inject support search module
      injectModule(MODULE_TYPES.SUPPORT_SEARCH, {
        category: item.category,
        label: item.label,
      });
      addMessage(
        "assistant",
        `Let me help you find ${item.label}. What region are you in?`
      );
    } else if (item.action === "search_providers") {
      // Inject provider search (could be support search with provider filter)
      injectModule(MODULE_TYPES.SUPPORT_SEARCH, {
        category: "providers",
        providerType: item.category,
        label: item.label,
      });
      addMessage(
        "assistant",
        `I'll help you find ${item.label}. Let's start with your location.`
      );
    } else if (item.action === "education") {
      // For now, just send a message about education
      addMessage(
        "assistant",
        `I'd be happy to share information about ${item.label}. Let me prepare some resources for you.`
      );
    }

    // Close explore on mobile after selection
    if (isMobile) {
      setExploreOpen(false);
      onClose?.();
    }
  };

  return (
    <div
      className={`flex h-full flex-col bg-slate-950/95 border-r border-white/5 ${
        isMobile ? "w-full" : "w-72"
      }`}
    >
      <div className="border-b border-white/5 px-4 py-2.5">
        <h2 className="text-xs font-semibold tracking-wide text-white">
          Explore
        </h2>
        <p className="text-[11px] text-white/50 mt-0.5">
          Tools, support, and resources
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {EXPLORE_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.id} className="space-y-2">
              <div className="flex items-center gap-2 px-2">
                <Icon className="h-4 w-4 text-white/50" />
                <h3 className="text-xs font-medium uppercase tracking-wide text-white/50">
                  {section.label}
                </h3>
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-white/70 transition hover:bg-white/5 hover:text-white/90"
                    >
                      <ItemIcon className="h-4 w-4 text-white/40" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExploreHub;

