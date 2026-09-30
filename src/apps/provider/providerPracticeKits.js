/**
 * Optional practice starting points for each practitioner service.
 * These are workflow suggestions, not treatment recommendations. The
 * practitioner always chooses what to send, and the client chooses whether
 * to add or use it.
 */
const PRACTICE_KITS = {
  therapist: {
    label: "Therapy",
    description: "Reflection and orientation options for between-session choice.",
    suggestions: [
      { id: "self-surgeon", reason: "Offers a structured way to separate what happened from the meaning attached to it." },
      { id: "journaling", reason: "Leaves room for private reflection; the client decides what, if anything, to share." },
      { id: "grounding", reason: "Provides a non-writing way to orient to the present if that feels welcome." },
      { id: "urge-surfing", reason: "Offers a choice-led next step when the client names an urge." },
    ],
  },
  counselor: {
    label: "Counseling",
    description: "Conversation, reflection, and practical follow-through options.",
    suggestions: [
      { id: "low-energy-plan", reason: "Turns a client-named daily need into one optional, manageable next step." },
      { id: "journaling", reason: "Gives the client a private place to prepare or continue a conversation." },
      { id: "grounding", reason: "Offers a simple orientation choice without requiring a written response." },
      { id: "self-surgeon", reason: "Helps organize a situation into facts, interpretations, and needs." },
    ],
  },
  "recovery-coach": {
    label: "Recovery coaching",
    description: "Client-led options for urges, recovery routines, and everyday barriers.",
    suggestions: [
      { id: "urge-surfing", reason: "Lets the client choose a practical response when they identify an urge." },
      { id: "low-energy-plan", reason: "Supports a small step around a daily need or recovery routine." },
      { id: "grounding", reason: "Offers a brief orientation option the client can use or skip." },
      { id: "breathing", reason: "Provides a paced option while making clear that natural breathing is fine too." },
    ],
  },
  "peer-support": {
    label: "Peer support",
    description: "Low-pressure choices that can complement conversation and connection.",
    suggestions: [
      { id: "low-energy-plan", reason: "Helps the person name one practical need or ask for support." },
      { id: "grounding", reason: "Offers a simple option to orient together, without asking for a personal disclosure." },
      { id: "breathing", reason: "Can be shared as an optional pause; no breathing pattern is required." },
      { id: "urge-surfing", reason: "Offers a few client-selected next moves if they bring up an urge." },
    ],
  },
  yoga: {
    label: "Yoga and movement",
    description: "Breath, imagery, and easy movement choices; no pose or body rating is required.",
    suggestions: [
      { id: "breathing", reason: "Offers optional pacing while explicitly allowing a natural breath." },
      { id: "body-scan", reason: "Focuses on a small movement or supportive surface, not symptom scoring." },
      { id: "meditation", reason: "Provides an imagery or quiet-attention option that can stay external to the body." },
      { id: "grounding", reason: "Lets the client choose a comfortable point of orientation." },
    ],
  },
  massage: {
    label: "Massage and bodywork",
    description: "Optional transition and rest practices that do not assess the body or promise treatment effects.",
    suggestions: [
      { id: "meditation", reason: "Offers a quiet external image or attention practice for a transition into rest." },
      { id: "breathing", reason: "Provides a gentle pacing option without requiring breath holds or a target." },
      { id: "grounding", reason: "Can help a client choose what feels familiar or comfortable before or after a session." },
      { id: "low-energy-plan", reason: "Supports a practical after-session need only if the client identifies one." },
    ],
  },
  bodywork: {
    label: "Bodywork",
    description: "Choice-led orientation and movement practices without clinical body ratings.",
    suggestions: [
      { id: "body-scan", reason: "Offers a small movement, supportive surface, familiar object, or space change." },
      { id: "grounding", reason: "Lets the client pick an external anchor rather than describe body sensations." },
      { id: "low-energy-plan", reason: "Can help plan a practical next step the client has asked for." },
      { id: "breathing", reason: "Offers a paced option with no required pattern or breath hold." },
    ],
  },
  acupuncture: {
    label: "Acupuncture",
    description: "Optional preparation and reflection practices; they do not describe or predict treatment effects.",
    suggestions: [
      { id: "grounding", reason: "Offers an external orientation choice before or after an appointment." },
      { id: "journaling", reason: "Lets the client note questions or reflections privately, if useful." },
      { id: "breathing", reason: "Provides an optional pause without prescribing a breathing pattern." },
      { id: "meditation", reason: "Offers imagery or quiet attention that can use an external scene." },
    ],
  },
  "spiritual-counselor": {
    label: "Spiritual care",
    description: "Reflection and meaning-making options that never assume a faith or belief.",
    suggestions: [
      { id: "affirmations", reason: "Offers editable language the client can accept, revise, or reject." },
      { id: "journaling", reason: "Makes space for private reflection on values, meaning, or gratitude." },
      { id: "meditation", reason: "Provides optional imagery or quiet attention without requiring a spiritual frame." },
      { id: "grounding", reason: "Offers a present-moment anchor outside of belief or writing." },
    ],
  },
  "community-supporter": {
    label: "Community support",
    description: "Practical, welcoming options that keep the person in charge of what help they want.",
    suggestions: [
      { id: "low-energy-plan", reason: "Can help turn a practical need into a small request or next step." },
      { id: "grounding", reason: "Offers a brief optional pause without asking the person to explain themselves." },
      { id: "affirmations", reason: "Provides editable words the person can keep only if they feel genuine." },
      { id: "breathing", reason: "Offers an optional pause without asking for a particular breathing technique." },
    ],
  },
};

const DEFAULT_KIT = {
  label: "Practitioner",
  description: "Choose a practice that fits the support the client asked for.",
  suggestions: [
    { id: "grounding", reason: "A simple orientation option the client can accept or skip." },
    { id: "low-energy-plan", reason: "A practical next step for a need the client has named." },
    { id: "breathing", reason: "An optional pause; a natural breath is always fine." },
  ],
};

export function getPractitionerPracticeKit(type) {
  const normalized = typeof type === "string" ? type.trim().toLowerCase() : "";
  return PRACTICE_KITS[normalized] || DEFAULT_KIT;
}
