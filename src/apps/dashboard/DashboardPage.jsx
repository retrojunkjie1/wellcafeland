// src/apps/dashboard/DashboardPage.jsx

import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOSStore } from "@/stores/useOSStore";
import PageHeader from "@/components/system/PageHeader";
import BackButton from "@/components/system/BackButton";
import SectionTabs from "@/components/system/SectionTabs";
import NotReadyCard from "@/components/system/NotReadyCard";

import EmotionStrip from "@/components/dashboard/EmotionStrip";

import RiskStrip from "@/components/dashboard/RiskStrip";

import TriggerStrip from "@/components/dashboard/TriggerStrip";

import HumanModeStrip from "@/components/dashboard/HumanModeStrip";

import FaceSignalStrip from "@/components/dashboard/FaceSignalStrip";

import TrajectoryGraph from "@/components/dashboard/TrajectoryGraph";

import QuickActions from "@/components/dashboard/QuickActions";

import DashboardDetailsSheet from "@/components/dashboard/DashboardDetailsSheet";

const MOMENTS_ACTIONS = [
  { label: "Talk to WellnessCafe", to: "/chat" },
  { label: "Open Tools", to: "/tools" },
  { label: "Open Profile Settings", to: "/profile" },
];

const formatLastActive = (messages) => {
  const last = messages?.length > 0 ? messages[messages.length - 1] : null;
  const ts = last?.timestamp || last?.createdAt || Date.now();
  const diff = Math.floor((Date.now() - ts) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Yesterday" : new Date(ts).toLocaleDateString();
};



const DashboardPage = () => {
  const navigate = useNavigate();
  const { messages } = useOSStore();

  const [activeView, setActiveView] = useState("signals"); // "moments" | "insights" | "signals"

  const [detail, setDetail] = useState(null); // { type: string }



  const lastMessageWithEmotion = useMemo(

    () => [...messages].reverse().find(m => m.emotion),

    [messages]

  );



  const lastRisk = useMemo(

    () => [...messages].reverse().find(m => m.risk),

    [messages]

  );



  const lastHumanMode = useMemo(

    () => [...messages].reverse().find(m => m.humanMode),

    [messages]

  );



  const lastFaceEmotion = useMemo(

    () =>

      [...messages].reverse().find(

        m => m.emotion && m.emotion.source === "face"

      ),

    [messages]

  );



  const lastTrajectory = useMemo(

    () => [...messages].reverse().find(m => m.trajectory),

    [messages]

  );



  const recentTriggers = useMemo(() => {

    const triggerCounts = new Map();

    [...messages]

      .slice(-20)

      .forEach(m => {

        (m.triggers || []).forEach(t => {

          const label = typeof t === "string" ? t : t?.label || t;

          if (label) {

            triggerCounts.set(label, (triggerCounts.get(label) || 0) + 1);

          }

        });

      });



    return Array.from(triggerCounts.entries())

      .map(([label, count]) => ({ label, count }))

      .sort((a, b) => b.count - a.count);

  }, [messages]);



  const openDetail = (type) => setDetail({ type });

  const closeDetail = () => setDetail(null);



  const hasMoments = messages.length > 0; // refine later when moments are typed



  const tabs = [{ id: "moments", label: "Moments" }, { id: "insights", label: "Insights" }, { id: "signals", label: "Signals" }];

  const lastActiveLabel = formatLastActive(messages);

  return (
    <div className="mx-auto w-full max-w-5xl flex flex-col px-4 pb-6 pt-4 sm:px-6 lg:px-0 overflow-x-hidden">
      <PageHeader
        title="Signals & Moments"
        subtitle="Your check-ins, patterns, and system signals."
        leftSlot={<BackButton to="/" />}
        rightSlot={
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            {lastActiveLabel}
          </span>
        }
      />
      <div className="mb-4 mt-2">
        <SectionTabs tabs={tabs} activeId={activeView} onChange={setActiveView} />
      </div>

      {activeView === "moments" && (
        <div className="flex-1 space-y-4">
          <div className="flex flex-col items-center">
            <NotReadyCard
              title="Today's Moments"
              body="Your check-ins, reflections, and practices will appear here. This module is being brought online safely."
              actions={MOMENTS_ACTIONS}
            />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link to="/chat" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition">
                Start Chat
              </Link>
              <Link to="/tools" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition">
                Tools
              </Link>
              <Link to="/explore" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition">
                Explore
              </Link>
            </div>
          </div>
        </div>
      )}

      {activeView === "insights" && (
        <div className="flex-1 space-y-4">
          <div className="flex flex-col items-center">
            <NotReadyCard
              title="Weekly Insights"
              body="As you log more moments, we'll surface patterns here: emotional trends, trigger clusters, and gentle suggestions."
              actions={MOMENTS_ACTIONS}
            />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Link to="/chat" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition">
                Start Chat
              </Link>
              <Link to="/tools" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition">
                Tools
              </Link>
              <Link to="/explore" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition">
                Explore
              </Link>
            </div>
          </div>
        </div>
      )}



      {activeView === "signals" && (
        <div className="flex-1 space-y-4 overflow-visible">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center">
              <NotReadyCard
                title="Signals"
                body="Your emotional patterns and check-ins will appear here once you start chatting or using tools."
                actions={MOMENTS_ACTIONS}
              />
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link to="/chat" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition">
                  Start Chat
                </Link>
                <Link to="/tools" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition">
                  Tools
                </Link>
                <Link to="/explore" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 transition">
                  Explore
                </Link>
              </div>
            </div>
          ) : (
            <>
          {/* Emotion + Risk */}
          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => openDetail("emotion")}
              className="text-left"
            >
              <EmotionStrip lastEmotion={lastMessageWithEmotion?.emotion} />
            </button>
            <button
              type="button"
              onClick={() => openDetail("risk")}
              className="text-left"
            >
              <RiskStrip risk={lastRisk?.risk} />
            </button>
          </div>



          {/* Triggers + Mode */}

          <div className="grid gap-3 md:grid-cols-2">

            <button

              type="button"

              onClick={() => openDetail("triggers")}

              className="text-left"

            >

              <TriggerStrip messages={messages} />

            </button>



            <button

              type="button"

              onClick={() => openDetail("mode")}

              className="text-left"

            >

              <HumanModeStrip humanMode={lastHumanMode?.humanMode || lastHumanMode} />

            </button>

          </div>



          {/* Face + Trajectory */}

          <div className="grid gap-3 md:grid-cols-2">

            <button

              type="button"

              onClick={() => openDetail("face")}

              className="text-left"

            >

              <FaceSignalStrip faceEmotion={lastFaceEmotion?.emotion} />

            </button>



            <button

              type="button"

              onClick={() => openDetail("trajectory")}

              className="text-left"

            >

              <TrajectoryGraph messages={messages} />

            </button>

          </div>



          {/* Quick actions */}

          <div className="pt-2">

            <QuickActions onOpenDetail={openDetail} />

          </div>

          {/* Settings redirect (keep it small) */}
          <section className="mt-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs sm:text-sm text-white/70">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="font-medium text-white">Wellness settings live in your Profile.</p>
                  <p className="text-xs sm:text-[13px] text-white/60">
                    Tone, intensity, spiritual depth, and notification settings are now managed from your Profile tab.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="inline-flex items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-200 hover:bg-amber-400/20"
                >
                  Open Profile Settings
                </button>
              </div>
            </div>
          </section>
            </>
          )}
        </div>
      )}



      <DashboardDetailsSheet

        detail={detail}

        onClose={closeDetail}

        emotionMessage={lastMessageWithEmotion}

        riskMessage={lastRisk}

        humanModeMessage={lastHumanMode}

        faceMessage={lastFaceEmotion}

        trajectoryMessage={lastTrajectory}

        triggers={recentTriggers}

        hasMoments={hasMoments}

      />

    </div>

  );

};



export default DashboardPage;
