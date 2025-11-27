// src/apps/onboarding/OnboardingPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import { Heart, Wind, Brain, Sparkles, ArrowRight } from "lucide-react";

const OnboardingPage = () => {
  const [step, setStep] = useState(0);
  const [selectedConcerns, setSelectedConcerns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // If already completed onboarding, skip
    const completed = localStorage.getItem("wc_onboarding_complete");
    if (completed) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const concerns = [
    { id: "stress", label: "Stress", icon: Wind, color: "text-blue-400" },
    { id: "anxiety", label: "Anxiety", icon: Brain, color: "text-purple-400" },
    { id: "grounding", label: "Grounding", icon: Heart, color: "text-red-400" },
    { id: "focus", label: "Focus", icon: Sparkles, color: "text-amber-400" },
  ];

  const handleConcernToggle = (concernId) => {
    setSelectedConcerns((prev) =>
      prev.includes(concernId)
        ? prev.filter((id) => id !== concernId)
        : [...prev, concernId]
    );
  };

  const handleComplete = () => {
    localStorage.setItem("wc_onboarding_complete", "true");
    // Store selected concerns if needed
    if (selectedConcerns.length > 0) {
      localStorage.setItem("wc_onboarding_concerns", JSON.stringify(selectedConcerns));
    }
    navigate("/", { replace: true });
  };

  const steps = [
    {
      title: "Welcome to WellnessCafe",
      subtitle: "Your wellness companion for recovery and healing",
      content: (
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <Logo size="lg" showText={true} />
          </div>
          <p className="text-muted-foreground">
            We're here to support you on your journey. Let's get started.
          </p>
        </div>
      ),
    },
    {
      title: "What would you like help with today?",
      subtitle: "Select what resonates with you",
      content: (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {concerns.map((concern) => {
              const Icon = concern.icon;
              const isSelected = selectedConcerns.includes(concern.id);
              return (
                <button
                  key={concern.id}
                  type="button"
                  onClick={() => handleConcernToggle(concern.id)}
                  className={`lux-card p-4 text-left transition-all ${
                    isSelected
                      ? "border-amber-400 bg-amber-400/10"
                      : "border-border hover:border-amber-400/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${concern.color} flex-shrink-0`} />
                    <span className="text-sm font-medium">{concern.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            You can always change this later
          </p>
        </div>
      ),
    },
    {
      title: "You're all set",
      subtitle: "Ready to begin your wellness journey",
      content: (
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-amber-400/20 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-amber-400" />
            </div>
          </div>
          <p className="text-muted-foreground">
            WellnessCafe is ready to support you. Take a breath, and let's begin.
          </p>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="lux-card p-8 md:p-12 space-y-8">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index <= step ? "bg-amber-400 w-8" : "bg-border w-1.5"
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="space-y-4 text-center">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {currentStep.title}
            </h1>
            <p className="text-sm text-muted-foreground">{currentStep.subtitle}</p>
          </div>

          <div className="min-h-[200px]">{currentStep.content}</div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-4">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-2 rounded-full border border-foreground bg-foreground text-background px-6 py-2 text-sm font-medium hover:bg-background hover:text-foreground transition-colors"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                className="inline-flex items-center gap-2 rounded-full border border-foreground bg-foreground text-background px-6 py-2 text-sm font-medium hover:bg-background hover:text-foreground transition-colors"
              >
                Open WellnessCafe
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

