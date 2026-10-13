// src/apps/tools/VoiceCheckIn.jsx
// Voice Check-In — uses VoiceCheckInModal (same component as composer mic)
// Route /tools/voice-checkin renders modal; on close, navigates back

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resolveToolReturnTarget, returnFromTool } from "@/navigation/toolReturn";
import VoiceCheckInModal from "@/components/tools/VoiceCheckInModal";

export default function VoiceCheckIn() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <VoiceCheckInModal
      open={true}
      onClose={() => returnFromTool(navigate, resolveToolReturnTarget(location.state))}
    />
  );
}
