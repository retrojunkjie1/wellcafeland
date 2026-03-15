// src/apps/tools/VoiceCheckIn.jsx
// Voice Check-In — uses VoiceCheckInModal (same component as composer mic)
// Route /tools/voice-checkin renders modal; on close, navigates back

import React from "react";
import { useNavigate } from "react-router-dom";
import VoiceCheckInModal from "@/components/tools/VoiceCheckInModal";

export default function VoiceCheckIn() {
  const navigate = useNavigate();

  return (
    <VoiceCheckInModal
      open={true}
      onClose={() => navigate(-1)}
    />
  );
}
