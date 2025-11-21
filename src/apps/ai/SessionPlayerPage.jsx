// src/apps/ai/SessionPlayerPage.jsx

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAIStore } from "./useAIStore";

const SessionPlayerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { startWithPrompt } = useAIStore();

  const template = location.state?.template;

  if (!template) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
          <h1 className="text-2xl font-semibold mb-4">Session not found</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Please go back to the templates page and open it again.
          </p>
          <button
            onClick={() => navigate("/sessions/templates")}
            className="px-4 py-2 text-sm rounded-full border border-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            Back to templates
          </button>
        </div>
      </div>
    );
  }

  const handleStartAI = () => {
    // Simple, clean prompt
    const sessionInfo = [
      template.title && `Session: ${template.title}`,
      template.summary && `About: ${template.summary}`,
      template.category && `Focus: ${template.category}`,
    ].filter(Boolean).join("\n");

    const stepsInfo = Array.isArray(template.steps) && template.steps.length > 0
      ? template.steps
          .map((step, i) => {
            if (typeof step === "string") return `${i + 1}. ${step}`;
            return `${i + 1}. ${step.title || step.label || "Step"}: ${step.description || step.text || ""}`;
          })
          .join("\n")
      : "Guide me through this wellness session step by step.";

    const prompt = `${sessionInfo}

${stepsInfo}

Guide me through this session. Speak simply, validate my feelings, and offer gentle options.`;

    startWithPrompt(prompt.trim());
  };

  const handleBack = () => {
    navigate("/sessions/templates");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back link */}
        <button
          onClick={handleBack}
          className="mb-6 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
            {template.title || "Session"}
          </h1>
          {(template.summary || template.description) && (
            <p className="text-sm text-muted-foreground">
              {template.summary || template.description}
            </p>
          )}
        </div>

        {/* Steps - simplified */}
        {Array.isArray(template.steps) && template.steps.length > 0 && (
          <div className="mb-8 space-y-3">
            {template.steps.map((step, index) => {
              const stepText = typeof step === "string" 
                ? step 
                : (step.description || step.text || step.title || step.label || "");
              
              if (!stepText) return null;

              return (
                <div
                  key={index}
                  className="border-b border-border/50 pb-3 last:border-0"
                >
                  <p className="text-sm text-foreground leading-relaxed">
                    {stepText}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Action */}
        <div className="flex gap-3">
          <button
            type="button"
            className="px-6 py-2.5 rounded-full border border-foreground bg-foreground text-background text-sm font-medium hover:bg-background hover:text-foreground transition-colors"
            onClick={handleStartAI}
          >
            Start session
          </button>
          <button
            type="button"
            className="px-4 py-2.5 rounded-full border border-border text-sm text-muted-foreground hover:bg-foreground/5 transition-colors"
            onClick={handleBack}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionPlayerPage;
