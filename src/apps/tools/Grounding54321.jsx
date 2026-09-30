// Legacy route retained for existing links; it now opens the choice-led practice.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import GroundingTool from "@/apps/tools/modules/GroundingTool";
import ToolModuleSession from "@/components/tools/ToolModuleSession";

export default function Grounding54321() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);
  const onClose = () => navigate("/tools");

  return (
    <ToolModuleSession
      title="Choose an Anchor"
      description="A short, optional way to orient to your surroundings."
      onClose={onClose}
      completed={completed}
    >
      <GroundingTool
        isEmbedded
        onComplete={() => setCompleted(true)}
        onCancel={onClose}
      />
    </ToolModuleSession>
  );
}
