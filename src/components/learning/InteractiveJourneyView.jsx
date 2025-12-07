// Phase 46 — Interactive Journey View
// Luxury, cinematic, multi-layer learning OS

import React, { useState, useMemo, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ChevronsDownUp, Sparkles } from "lucide-react";
import { getTileIcons } from "@/engines/learningPaths/tileIconMap";
import { useNavigate } from "react-router-dom";

import { getTopic, getTopicList } from "@/engines/learningPaths/learningPathsEngine";
import {
  getJourneyNodes,
  pickNextJourneyNode,
  rememberNode,
} from "@/engines/learningPaths/interactiveJourneyEngine";

import { LearningInsightPanel } from "./LearningInsightPanel";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

export default function InteractiveJourneyView({ topicId }) {
  const navigate = useNavigate();
  const topic = useMemo(() => getTopic(topicId), [topicId]);

  // Dropdown state for topics (shame, trauma, boundaries, etc.)
  const [topicDropdown, setTopicDropdown] = useState(false);
  const topicsList = useMemo(() => getTopicList(), []);
  const topicDropdownRef = useRef(null);

  // Active tile + node (angle)
  const [activeTileId, setActiveTile] = useState(topic?.tiles?.[0]?.id || null);
  const [activeNode, setActiveNode] = useState(null);
  const scrollContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const tiles = topic?.tiles || [];
  const nodes = useMemo(
    () => getJourneyNodes(topicId, activeTileId),
    [topicId, activeTileId]
  );

  // Close topic dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        topicDropdownRef.current &&
        !topicDropdownRef.current.contains(event.target)
      ) {
        setTopicDropdown(false);
      }
    };

    if (topicDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [topicDropdown]);

  // Track scroll progress
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const updateScrollProgress = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? (scrollLeft / maxScroll) * 100 : 0;
      setScrollProgress(progress);
    };

    container.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); // Initial calculation

    return () => {
      container.removeEventListener('scroll', updateScrollProgress);
    };
  }, [tiles]);

  const handleAngleSelect = (node) => {
    setActiveNode(node);
    rememberNode(topicId, activeTileId, node.nodeId);
  };

  const handleAnotherAngle = () => {
    const next = pickNextJourneyNode(topicId, activeTileId);
    if (next) {
      setActiveNode(next);
      rememberNode(topicId, activeTileId, next.nodeId);
    }
  };

  const handleTileChange = (tileId) => {
    setActiveTile(tileId);
    setActiveNode(null); // Reset node when changing tiles
  };

  if (!topic) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-slate-300">
        Topic not found.
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate("/recovery")}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-700/70 text-xs text-slate-200 hover:text-amber-200 hover:border-amber-400/60 transition-all"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </button>

        {/* Topic Dropdown */}
        <div className="relative" ref={topicDropdownRef}>
          <button
            type="button"
            onClick={() => setTopicDropdown(!topicDropdown)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/70 border border-slate-700/70 text-xs text-slate-200 hover:border-amber-400/60 hover:text-amber-200 transition-all"
          >
            <ChevronsDownUp className="h-3.5 w-3.5" />
            {topic.title}
          </button>

          {topicDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 border border-slate-700/70 rounded-xl shadow-2xl backdrop-blur-xl z-20 max-h-[60vh] overflow-y-auto">
              {topicsList.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    navigate(`/tools/recovery.${t.id}`);
                    setTopicDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-200 hover:text-amber-100 hover:bg-slate-800/60 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {t.title}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl text-amber-50 font-light tracking-wide">
          {topic.title}
        </h1>
        {topic.subtitle && (
          <p className="text-sm text-slate-300 max-w-2xl mt-1">{topic.subtitle}</p>
        )}
      </div>

      {/* Tile Selector - Creative Menu Format */}
      <section className="relative">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-slate-400 uppercase tracking-widest">
            Core Perspectives
          </p>
          <p className="text-xs text-slate-500">{tiles.length} tiles</p>
        </div>

        {/* Scrollable Container */}
        <div className="relative group/scroll">
          {/* Scroll Container */}
          <div 
            ref={scrollContainerRef}
            className="no-scrollbar flex gap-3 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {tiles.map((tile, index) => {
              const tileIcons = getTileIcons(topicId, tile.id);
              const TileIcon = tileIcons[0];
              const isActive = tile.id === activeTileId;
              
              return (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => handleTileChange(tile.id)}
                  className={cx(
                    "group relative flex-shrink-0 snap-center",
                    "transform transition-all duration-500 ease-out",
                    "hover:scale-105 active:scale-95",
                    isActive && "scale-105"
                  )}
                  title={tile.label}
                >
                  {/* Glowing Background Orb - Active State */}
                  {isActive && (
                    <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-emerald-500/20 blur-xl animate-pulse" />
                  )}
                  
                  {/* Card Container */}
                  <div className={cx(
                    "relative px-4 py-3 rounded-2xl border backdrop-blur-sm transition-all duration-500",
                    "transform perspective-1000 preserve-3d",
                    isActive
                      ? "bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border-amber-400/60 shadow-[0_8px_32px_rgba(245,158,11,0.3),0_0_0_1px_rgba(251,191,36,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]"
                      : "bg-slate-900/60 border-slate-700/50 hover:border-amber-400/40 hover:bg-slate-800/70 hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
                  )}>
                    {/* Inner Glow */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400/10 to-transparent pointer-events-none" />
                    )}
                    
                    {/* Content */}
                    <div className="relative flex items-center gap-3 min-w-[140px] sm:min-w-[160px]">
                      {/* Icon with Rotating Ring */}
                      <div className={cx(
                        "relative flex-shrink-0 transition-all duration-500",
                        isActive && "animate-spin-slow"
                      )}>
                        <div className={cx(
                          "absolute inset-0 rounded-full transition-all duration-500",
                          isActive 
                            ? "bg-gradient-to-br from-amber-400/30 to-emerald-400/30 blur-sm scale-150" 
                            : "bg-slate-700/30 blur-sm scale-100"
                        )} />
                        <div className={cx(
                          "relative p-2 rounded-xl transition-all duration-500",
                          isActive
                            ? "bg-gradient-to-br from-amber-500/30 to-amber-600/20 border border-amber-400/40"
                            : "bg-slate-800/50 border border-slate-700/50 group-hover:border-amber-400/30"
                        )}>
                          <TileIcon className={cx(
                            "h-4 w-4 transition-all duration-500",
                            isActive ? "text-amber-200 scale-110" : "text-slate-400 group-hover:text-amber-300"
                          )} />
                        </div>
                      </div>
                      
                      {/* Text */}
                      <span className={cx(
                        "text-xs font-medium transition-all duration-500 truncate",
                        isActive 
                          ? "text-amber-100" 
                          : "text-slate-300 group-hover:text-amber-50"
                      )}>
                        {tile.label}
                      </span>
                    </div>
                    
                    {/* Active Indicator Line */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
                    )}
                    
                    {/* Hover Glow Effect */}
                    <div className={cx(
                      "absolute -inset-1 rounded-2xl opacity-0 transition-all duration-500 pointer-events-none",
                      "bg-gradient-to-r from-amber-500/30 via-orange-500/25 to-emerald-500/30 blur-xl",
                      "group-hover:opacity-100 group-hover:scale-105",
                      isActive && "opacity-60"
                    )} 
                    style={{ zIndex: -1 }} />
                  </div>
                  
                  {/* Connection Line (except last) */}
                  {index < tiles.length - 1 && (
                    <div className={cx(
                      "absolute top-1/2 -right-1.5 w-3 h-px transition-all duration-500 -translate-y-1/2",
                      isActive ? "bg-gradient-to-r from-amber-400/60 to-transparent" : "bg-slate-700/30"
                    )} />
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Scroll Progress Indicator */}
          <div className="mt-2 h-0.5 bg-slate-800/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        </div>
      </section>

      {/* Main body: Angles OR Node */}
      {!activeNode && (
        <AnglesGrid
          nodes={nodes}
          tile={tiles.find((t) => t.id === activeTileId)}
          onSelect={handleAngleSelect}
          onRandom={() => {
            const next = pickNextJourneyNode(topicId, activeTileId);
            if (next) {
              setActiveNode(next);
              rememberNode(topicId, activeTileId, next.nodeId);
            }
          }}
        />
      )}

      {activeNode && (
        <NodeView
          node={activeNode}
          onBack={() => setActiveNode(null)}
          onNext={handleAnotherAngle}
        />
      )}
    </div>
  );
}

//////////////////////////////////////////////////////////////////////////////////////////
// ANGLES GRID
//////////////////////////////////////////////////////////////////////////////////////////

function AnglesGrid({ nodes, tile, onSelect, onRandom }) {
  if (!nodes.length) {
    return (
      <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-300 text-center">
        No angles available for this perspective.
      </div>
    );
  }

  if (!tile) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
            Choose an angle
          </p>
          <p className="text-base font-medium text-slate-100">{tile.label}</p>
          <p className="text-xs text-slate-500 mt-1">
            {nodes.length} {nodes.length === 1 ? "perspective" : "perspectives"} available
          </p>
        </div>

        <button
          type="button"
          onClick={onRandom}
          className="px-4 py-2 rounded-full text-xs border border-amber-400/60 text-amber-100 bg-amber-500/10 hover:bg-amber-500/20 inline-flex items-center gap-2 transition-all"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Surprise me
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nodes.map((n, index) => {
          const icons = getTileIcons(n.topicId, n.tileId);
          const Icon1 = icons[0];
          const Icon2 = icons[1];
          const Icon3 = icons[2];
          
          return (
            <button
              key={n.nodeId}
              type="button"
              onClick={() => onSelect(n)}
              className="group p-6 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-amber-400/60 hover:bg-slate-900/90 transition-all text-left flex flex-col h-full"
            >
              {/* Header with icons and number */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-1.5 flex-1">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-400/20 group-hover:bg-amber-500/20 transition-colors">
                    <Icon1 className="h-4 w-4 text-amber-300" />
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-400/20 group-hover:bg-amber-500/20 transition-colors">
                    <Icon2 className="h-4 w-4 text-amber-300" />
                  </div>
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-400/20 group-hover:bg-amber-500/20 transition-colors">
                    <Icon3 className="h-4 w-4 text-amber-300" />
                  </div>
                </div>
                <span className="flex-shrink-0 text-[10px] uppercase tracking-wider text-slate-500 bg-slate-800/50 px-2 py-1 rounded-full">
                  {index + 1}
                </span>
              </div>
              
              {/* Title */}
              <div className="mb-3">
                <p className="text-sm font-semibold text-amber-50 group-hover:text-amber-100 leading-snug">
                  {n.angleTitle}
                </p>
              </div>
              
              {/* Body content */}
              <div className="flex-1">
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-4 group-hover:text-slate-200 mb-3">
                  {n.body}
                </p>
              </div>
              
              {/* Reflection prompt */}
              {n.reflectionPrompt && (
                <div className="pt-3 mt-auto border-t border-slate-800/50">
                  <p className="text-xs text-amber-200/90 italic leading-relaxed">
                    {n.reflectionPrompt}
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

//////////////////////////////////////////////////////////////////////////////////////////
// NODE VIEW (deep panel)
//////////////////////////////////////////////////////////////////////////////////////////

function NodeView({ node, onBack, onNext }) {
  const insight = {
    ...node,
    title: node.angleTitle,
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-3 py-1.5 rounded-full bg-slate-950/70 border border-slate-700/70 text-[11px] text-slate-300 hover:text-amber-100 hover:border-amber-400/60 inline-flex items-center gap-1.5 transition-all"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to angles
        </button>

        <button
          type="button"
          onClick={onNext}
          className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/60 text-[11px] text-amber-100 hover:bg-amber-500/20 hover:shadow-[0_0_0_1px_rgba(251,191,36,0.4)] inline-flex items-center gap-1.5 transition-all"
        >
          Show another angle
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <LearningInsightPanel
        insight={insight}
        onRefresh={onNext}
        onClose={onBack}
      />
    </div>
  );
}

