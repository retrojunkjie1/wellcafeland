// src/engines/ritual/ritualSequenceMap.js
// Phase 48 — Ritual Sequence Map
// Defines light, mixed, and deep ritual sequences based on activation levels

export const ritualSequences = {
  light: {
    name: "Light Stabilization Ritual",
    steps: [
      {
        id: "arrive",
        title: "Arrive Here",
        text: "Take one slow breath. Feel the weight of your body. You made it here.",
        groundingLevel: 10,
      },
      {
        id: "orient",
        title: "Orient Yourself",
        text: "Look around slowly. Notice three objects without judging them.",
        groundingLevel: 15,
      },
      {
        id: "breath",
        title: "Gentle Breathing",
        text: "Breathe in for four seconds, exhale gently for six.",
        groundingLevel: 25,
      },
      {
        id: "naming",
        title: "Name One Truth",
        text: "Say quietly: 'I am still here. I am safe enough in this moment.'",
        groundingLevel: 30,
      },
      {
        id: "return",
        title: "Return",
        text: "Place your hand on your chest. Feel your presence.",
        groundingLevel: 35,
      },
    ],
  },

  deep: {
    name: "Deep Stabilization Ritual (Ikuku Method)",
    steps: [
      {
        id: "summon",
        title: "Call Yourself Into the Room",
        text: "Pause. Your spirit is shifting. Call your name quietly. Call yourself back into your body.",
        groundingLevel: 40,
        triggerIntensity: -10,
      },
      {
        id: "bodyClaim",
        title: "Claim the Body",
        text: "Place one hand on your chest, one on your stomach. Press gently. This body answers to you.",
        groundingLevel: 55,
      },
      {
        id: "interrupt",
        title: "Interrupt the Surge",
        text: "Push your feet down. Harder. Feel the pressure. You are not floating away. You are here.",
        groundingLevel: 70,
        nervousSystem: "activation → stabilization",
      },
      {
        id: "shadowBreak",
        title: "Break the Loop",
        text: "Whisper this with authority: 'Not now. Not today. Not this moment.'",
        groundingLevel: 80,
        triggerIntensity: -25,
      },
      {
        id: "reclaim",
        title: "Reclaim Your Spirit",
        text: "Lift your chin slightly. Inhale slow. Exhale slower. Reclaim your life in this breath.",
        groundingLevel: 95,
      },
    ],
  },

  mixed: {
    name: "Hybrid Grounding Ritual",
    steps: [
      {
        id: "softStart",
        title: "Start Gently",
        text: "Take a breath without forcing anything.",
        groundingLevel: 10,
      },
      {
        id: "orient",
        title: "Orient to Safety",
        text: "Touch something near you. Describe the texture in your mind.",
        groundingLevel: 20,
      },
      {
        id: "anchor",
        title: "Deepen the Anchor",
        text: "Place your hand over your heart. Slow everything down.",
        groundingLevel: 40,
      },
      {
        id: "command",
        title: "Command Your Presence",
        text: "Say your name clearly. Bring yourself fully into this moment.",
        groundingLevel: 65,
      },
      {
        id: "return",
        title: "Return Steady",
        text: "Let your breath find a steady rhythm. Your system is recalibrating.",
        groundingLevel: 80,
      },
    ],
  },
};

