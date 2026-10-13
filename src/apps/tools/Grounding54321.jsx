// Legacy route retained for existing links; it now opens the choice-led practice.

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GroundingTool from "@/apps/tools/modules/GroundingTool";
import ToolModuleSession from "@/components/tools/ToolModuleSession";
import { resolveToolReturnTarget, returnFromTool } from "@/navigation/toolReturn";

export default function Grounding54321() {
  const navigate = useNavigate();
  const location = useLocation();
  const [completed, setCompleted] = useState(false);
  const onClose = () => returnFromTool(navigate, resolveToolReturnTarget(location.state));

  return (
    <ToolModuleSession
      title="Reconnect with the room"
      onClose={onClose}
      completed={completed}
      completedTitle="Pause complete"
      completedDescription="There’s no score or required feeling. If it did not help or felt uncomfortable, stop or choose something else."
      onViewProgress={() => navigate("/milestones")}
      showProgressAction={completed}
      onRestart={() => setCompleted(false)}
    >
      <GroundingTool
        isEmbedded
        onComplete={() => setCompleted(true)}
        onCancel={onClose}
      />
    </ToolModuleSession>
  );
}
