/**
 * Match only the support option the person explicitly chose.
 * Mood, craving, and trigger answers are not used to infer a practice or diagnosis.
 */
const NEXT_STEPS = {
  "A check-in with someone I trust": {
    title: "Plan a check-in with someone you trust",
    detail: "Use the guide to find words for reaching out. It will not contact anyone for you.",
    path: "/guide",
    action: "Open the guide",
  },
  "Peer recovery support": {
    title: "Find a recovery meeting",
    detail: "Browse A.A. and N.A. meetings, including online and in-person options.",
    path: "/recovery/meetings",
    action: "Find a meeting",
  },
  "Help finding practical resources": {
    title: "Find practical support",
    detail: "Search for housing, food, transportation, shelter, and local services.",
    path: "/assistance",
    action: "Find local support",
  },
  "Professional support": {
    title: "Explore practitioners",
    detail: "Browse people offering professional, peer, movement, and bodywork support.",
    path: "/providers",
    action: "Browse practitioners",
  },
  "Quiet time for myself": {
    title: "Choose a practice at your pace",
    detail: "Open your Daily Practice or explore an optional practice if you want one.",
    path: "/tools",
    action: "Open Daily Practice",
  },
};

export function getCheckInNextStep(supportNeeded) {
  return NEXT_STEPS[supportNeeded] || {
    title: "Talk through one next step",
    detail: "You do not need to decide everything now. Start with what would feel useful.",
    path: "/guide",
    action: "Open the guide",
  };
}
