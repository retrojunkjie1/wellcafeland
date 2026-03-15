/**
 * src/engines/liveIntervention/variationLibrary.js
 * Fallback variation library: intent -> level -> variants[].
 * Each variant: { variantId, mode, uiPreset, title, lines, instruction, choices }
 * NO long paragraphs.
 */

export const variationLibrary = {
  overwhelmed: {
    0: [
      { variantId: "ovw-0-a", mode: "stabilize", uiPreset: "orb", title: "Pause here", lines: ["You can slow down.", "One breath is enough right now."], instruction: "Place one hand on your chest and breathe out slowly.", choices: ["Do a breath", "Open Chat"] },
      { variantId: "ovw-0-b", mode: "stabilize", uiPreset: "orb", title: "Right here", lines: ["This moment is enough.", "No need to fix anything yet."], instruction: "Feel your feet on the floor for a few seconds.", choices: ["Ground", "Open Chat"] },
      { variantId: "ovw-0-c", mode: "stabilize", uiPreset: "wave", title: "Steady", lines: ["Overwhelm is a wave.", "It will pass."], instruction: "Name one thing you can see in the room.", choices: ["Next step", "Open Chat"] },
      { variantId: "ovw-0-d", mode: "stabilize", uiPreset: "orb", title: "Safe enough", lines: ["You're not in danger right now.", "Your body can slow down."], instruction: "Breathe in for 4, out for 6, once.", choices: ["Breathe", "Open Chat"] },
      { variantId: "ovw-0-e", mode: "stabilize", uiPreset: "stepper", title: "One thing", lines: ["You don't have to do everything.", "Just one small thing."], instruction: "Choose one: feel your feet, or one slow breath.", choices: ["Feet", "Breath"] },
      { variantId: "ovw-0-f", mode: "stabilize", uiPreset: "orb", title: "Pause", lines: ["It's okay to stop.", "Rest here a moment."], instruction: "Close your eyes for one breath, then open.", choices: ["Pause", "Open Chat"] },
      { variantId: "ovw-0-g", mode: "stabilize", uiPreset: "wave", title: "Here with you", lines: ["You're not alone in this.", "We can take the next step together."], instruction: "Put a hand on your heart and breathe once.", choices: ["Next", "Open Chat"] },
      { variantId: "ovw-0-h", mode: "stabilize", uiPreset: "stepper", title: "Simplify", lines: ["Nothing is required of you right now.", "Just be here."], instruction: "Say to yourself: I can take one breath.", choices: ["Breathe", "Open Chat"] },
      { variantId: "ovw-0-i", mode: "stabilize", uiPreset: "orb", title: "Enough", lines: ["You don't have to figure it out now.", "Pause is enough."], instruction: "Look at one object and name its color.", choices: ["Ground", "Open Chat"] },
      { variantId: "ovw-0-j", mode: "stabilize", uiPreset: "wave", title: "Gentle", lines: ["Be gentle with yourself.", "One step at a time."], instruction: "Exhale slowly, then inhale. Just once.", choices: ["Breathe", "Open Chat"] },
    ],
    1: [
      { variantId: "ovw-1-a", mode: "stabilize", uiPreset: "wave", title: "Stabilizing • Step 2", lines: ["Your system is activated. That's okay.", "We'll slow it down together."], instruction: "4-7-8: breathe in 4, hold 7, out 8. Do it twice.", choices: ["Breathing", "Open Chat"] },
      { variantId: "ovw-1-b", mode: "stabilize", uiPreset: "stepper", title: "Grounding", lines: ["Name 5 things you see, 4 you hear, 3 you can touch.", "Stay with your senses."], instruction: "Say them out loud or in your head.", choices: ["5-4-3", "Open Chat"] },
      { variantId: "ovw-1-c", mode: "stabilize", uiPreset: "orb", title: "Anchor", lines: ["Find one thing that feels steady.", "The floor. A chair. Your breath."], instruction: "Focus on that for 30 seconds.", choices: ["Anchor", "Open Chat"] },
      { variantId: "ovw-1-d", mode: "stabilize", uiPreset: "wave", title: "Ride the wave", lines: ["This feeling will peak and then ease.", "You don't have to fix it."], instruction: "Breathe out longer than you breathe in, 3 times.", choices: ["Breathe", "Open Chat"] },
      { variantId: "ovw-1-e", mode: "stabilize", uiPreset: "stepper", title: "Step 2", lines: ["You're doing the right thing by pausing.", "Next: one calming action."], instruction: "Choose: cold water on wrists, or 4-7-8 breath.", choices: ["Water", "Breath"] },
      { variantId: "ovw-1-f", mode: "stabilize", uiPreset: "orb", title: "Slow", lines: ["Slowing down is brave.", "Your body can follow."], instruction: "In 4, out 6. Repeat 4 times.", choices: ["Breathe", "Open Chat"] },
      { variantId: "ovw-1-g", mode: "stabilize", uiPreset: "wave", title: "Present", lines: ["Right now you are safe.", "Stay with right now."], instruction: "Feel the weight of your body in the chair or on the floor.", choices: ["Ground", "Open Chat"] },
      { variantId: "ovw-1-h", mode: "stabilize", uiPreset: "stepper", title: "Next step", lines: ["One small action can shift things.", "Pick one: breath, ground, or chat."], instruction: "Do one 4-7-8 breath or name 3 things you see.", choices: ["Breath", "Ground"] },
    ],
    2: [
      { variantId: "ovw-2-a", mode: "crisis", uiPreset: "stepper", title: "Crisis support", lines: ["You're in a lot right now.", "Reach for support if you need it."], instruction: "If you're in crisis: 988 or a trusted person. Otherwise, try 4-7-8 breathing.", choices: ["988 / Someone", "Breathing"] },
      { variantId: "ovw-2-b", mode: "crisis", uiPreset: "wave", title: "Stabilizing • Step 3", lines: ["This is a stronger wave. It will pass.", "Support is available."], instruction: "Breathe: in 4, hold 7, out 8. Do 4 rounds. Or call someone.", choices: ["Breathe 4x", "Call someone"] },
      { variantId: "ovw-2-c", mode: "crisis", uiPreset: "orb", title: "Ground first", lines: ["Before any big decision, ground.", "Then choose: breathe, call, or chat."], instruction: "Feel your feet. Then pick one action.", choices: ["Breathe", "988 / Chat"] },
      { variantId: "ovw-2-d", mode: "crisis", uiPreset: "stepper", title: "You matter", lines: ["You don't have to do this alone.", "988 and trusted people are there."], instruction: "One grounding breath, then decide: more breathing or reach out.", choices: ["Breathe", "Reach out"] },
      { variantId: "ovw-2-e", mode: "crisis", uiPreset: "wave", title: "Step 3", lines: ["Higher intensity. That's okay.", "We're still here."], instruction: "4-7-8 for 4 cycles, or text/call someone you trust.", choices: ["4-7-8", "Someone"] },
      { variantId: "ovw-2-f", mode: "crisis", uiPreset: "orb", title: "Support", lines: ["Crisis support: 988.", "You can also open Chat for a calm next step."], instruction: "Ground with one breath, then choose support or breathing.", choices: ["988", "Chat"] },
    ],
    3: [
      { variantId: "ovw-3-a", mode: "handoff", uiPreset: "stepper", title: "Real help", lines: ["This is a moment for human support.", "988 or a trusted person. Then grounding."], instruction: "Call or text 988 if you're in crisis. Then: feet on floor, slow breath.", choices: ["988", "Ground + Chat"] },
      { variantId: "ovw-3-b", mode: "handoff", uiPreset: "wave", title: "Handoff", lines: ["We're with you. Please reach out.", "988, or someone who cares."], instruction: "Reach for a person. When you're ready, come back to Chat.", choices: ["988", "Chat later"] },
      { variantId: "ovw-3-c", mode: "handoff", uiPreset: "orb", title: "Support now", lines: ["Don't stay alone in this.", "988. Trusted person. Then breathe."], instruction: "Connect with someone. Then one grounding breath.", choices: ["988", "Someone"] },
      { variantId: "ovw-3-d", mode: "handoff", uiPreset: "stepper", title: "Step 4", lines: ["Human connection will help most now.", "988 or your person. We'll be here after."], instruction: "Call or text. When you're safer, open Chat for next steps.", choices: ["988", "Chat"] },
    ],
  },
};

/**
 * Get variants for intent + level. Default level 0.
 */
export function getVariantsForLevel(intent, level = 0) {
  const byIntent = variationLibrary[intent];
  if (!byIntent) return [];
  const levelKey = Math.min(3, Math.max(0, level));
  return byIntent[levelKey] || byIntent[0] || [];
}
