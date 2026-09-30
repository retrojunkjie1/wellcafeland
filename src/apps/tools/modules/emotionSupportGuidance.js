export const EMOTION_SUPPORT_GUIDANCE = Object.freeze({
  "Move: walk, stretch, or use safe energy": {
    title: "Choose a movement that feels manageable",
    detail: "If movement feels right, choose one small action. Changing position or staying still also counts.",
    placeholder: "One movement, and where or when it might fit…",
    suggestions: ["Walk to a nearby doorway or window, if comfortable.", "Change position or stay still for a moment."],
  },
  "Orient: notice a place, object, or sound": {
    title: "Choose one familiar point of orientation",
    detail: "You can look toward a familiar object, listen for a steady sound, or move to a place that feels easier. No counting is needed.",
    placeholder: "One thing or place I can turn toward…",
    suggestions: ["Look toward one familiar object nearby.", "Move to a place that feels a little easier."],
  },
  "Connect: contact someone trustworthy": {
    title: "Choose who could be with you",
    detail: "You can decide who to contact and what you might ask for. You do not have to send anything now.",
    placeholder: "A person I could contact, or what I might ask for…",
    suggestions: ["Text someone I trust: ‘Could you stay with me for a few minutes?’", "Choose who I could contact; no message needed yet."],
  },
  "Reduce: pause a task or lower stimulation": {
    title: "Take one demand off the moment",
    detail: "Pick one task, noise, or interruption you can pause or make smaller. It can be temporary.",
    placeholder: "One demand I can pause or make smaller…",
    suggestions: ["Pause one task for ten minutes.", "Lower one source of noise or interruption."],
  },
  "Understand: name what set this off": {
    title: "Name what happened and what would help now",
    detail: "If it helps, separate the event from the support you need. You do not have to explain why or analyze it.",
    placeholder: "What happened, and what I need now…",
    suggestions: ["Name one thing that happened and one thing I need.", "Leave the cause unanswered for now."],
  },
  "Practical help: food, water, transport, or a task": {
    title: "Pick one concrete need to address",
    detail: "Choose the immediate need first. A place, person, or small first action can make it easier to find the right support.",
    placeholder: "Food, water, transport, or a task: what would help first?…",
    suggestions: ["Get water or something to eat.", "Find help with transport or one task."],
  },
});

export function getEmotionSupportGuidance(choice) {
  return EMOTION_SUPPORT_GUIDANCE[choice] || null;
}
