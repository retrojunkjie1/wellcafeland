// src/components/interaction/InteractionCanvas.jsx
// Central chat canvas that renders messages + injected modules

import React, { useEffect, useRef } from "react";
import { useInteractionCanvasStore, MODULE_TYPES } from "@/stores/useInteractionCanvasStore";
import MessageBubble from "./MessageBubble";
import ToolModule from "./modules/ToolModule";
import VideoModule from "./modules/VideoModule";
import VoiceModule from "./modules/VoiceModule";
import SupportSearchModule from "./modules/SupportSearchModule";

const InteractionCanvas = () => {
  const items = useInteractionCanvasStore((state) => state.items);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when items change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [items]);

  const renderItem = (item) => {
    switch (item.type) {
      case MODULE_TYPES.MESSAGE:
        return <MessageBubble key={item.id} message={item} />;

      case MODULE_TYPES.TOOL:
        return <ToolModule key={item.id} module={item} />;

      case MODULE_TYPES.VIDEO:
        return <VideoModule key={item.id} module={item} />;

      case MODULE_TYPES.VOICE:
        return <VoiceModule key={item.id} module={item} />;

      case MODULE_TYPES.SUPPORT_SEARCH:
        return <SupportSearchModule key={item.id} module={item} />;

      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {items.map((item) => renderItem(item))}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};

export default InteractionCanvas;

