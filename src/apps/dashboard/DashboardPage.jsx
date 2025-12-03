// src/apps/dashboard/DashboardPage.jsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useOSStore } from "@/stores/useOSStore";

import SignalHeader from "@/components/dashboard/SignalHeader";

import EmotionStrip from "@/components/dashboard/EmotionStrip";

import RiskStrip from "@/components/dashboard/RiskStrip";

import TriggerStrip from "@/components/dashboard/TriggerStrip";

import HumanModeStrip from "@/components/dashboard/HumanModeStrip";

import FaceSignalStrip from "@/components/dashboard/FaceSignalStrip";

import TrajectoryGraph from "@/components/dashboard/TrajectoryGraph";

import QuickActions from "@/components/dashboard/QuickActions";

import DashboardDetailsSheet from "@/components/dashboard/DashboardDetailsSheet";



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



  return (

    <div className="mx-auto flex h-full max-w-5xl flex-col px-4 pb-6 pt-4 sm:px-6 lg:px-0">

      {/* Top header with user/session info */}

      <div className="mb-4">

        <SignalHeader />

      </div>



      {/* View toggle */}

      <div className="mb-4 flex items-center justify-between gap-3">

        <div className="inline-flex rounded-full bg-white/5 p-1 text-xs font-medium text-slate-300 backdrop-blur-sm">

          <button

            type="button"

            onClick={() => setActiveView("moments")}

            className={`rounded-full px-3 py-1 transition ${

              activeView === "moments"

                ? "bg-white text-slate-900"

                : "bg-transparent text-slate-300"

            }`}

          >

            Moments

          </button>

          <button

            type="button"

            onClick={() => setActiveView("insights")}

            className={`rounded-full px-3 py-1 transition ${

              activeView === "insights"

                ? "bg-white text-slate-900"

                : "bg-transparent text-slate-300"

            }`}

          >

            Insights

          </button>

          <button

            type="button"

            onClick={() => setActiveView("signals")}

            className={`rounded-full px-3 py-1 transition ${

              activeView === "signals"

                ? "bg-amber-400 text-slate-900"

                : "bg-transparent text-slate-300"

            }`}

          >

            Signals

          </button>

        </div>

      </div>



      {activeView === "moments" && (

        <div className="flex-1 space-y-4 overflow-y-auto pb-24">

          <div className="rounded-3xl bg-white/5 px-4 py-4 text-sm text-slate-200 shadow-lg shadow-black/40 backdrop-blur-md">

            <h2 className="mb-1 text-lg font-semibold text-white">

              Today's Moments

            </h2>

            <p className="text-xs text-slate-400">

              Your check-ins, reflections, and practices will appear here. Each

              one is a small piece of your bigger story.

            </p>

          </div>

          {/* NOTE: keep existing moments list implementation below if it exists in another file. */}

        </div>

      )}



      {activeView === "insights" && (

        <div className="flex-1 space-y-4 overflow-y-auto pb-24">

          <div className="rounded-3xl bg-white/5 px-4 py-4 text-sm text-slate-200 shadow-lg shadow-black/40 backdrop-blur-md">

            <h2 className="mb-1 text-lg font-semibold text-white">

              Weekly Insights

            </h2>

            <p className="text-xs text-slate-400">

              As you log more moments, we'll surface patterns here: emotional

              trends, trigger clusters, and gentle suggestions.

            </p>

          </div>

          {/* NOTE: keep / merge any existing insights widgets here. */}

        </div>

      )}



      {activeView === "signals" && (

        <div className="flex-1 space-y-4 overflow-y-auto pb-24">

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
