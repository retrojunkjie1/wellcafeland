const LANGUAGE_LABELS = Object.freeze({
  es: "Spanish",
  fr: "French",
  pt: "Portuguese",
});

const TOPIC_KEY_IDEAS = Object.freeze({
  "shame-and-recovery": "Shame is the quiet voice that says, \"Something is wrong with me\" — not just with what I did. In recovery, shame is one of the biggest forces that keeps people stuck in secrecy, relapse cycles, and self-attack.",
  "cravings-and-urges": "A craving is not a moral failure or a verdict about your recovery. It can show up in different ways, and its strength and duration can vary. You do not need to find a hidden cause or explain the feeling before getting support.",
  "nervous-system-regulation": "Your nervous system is the part of you that is always asking one quiet question: \"Am I safe right now?\" It answers not with words, but with sensations — a racing heart, a heavy chest, numbness, tension, or sudden bursts of energy.",
  "trauma-and-recovery": "Trauma is not only what happened — it is also what had to stay inside you because it was not safe to feel, speak, or process it at the time. The body remembers in ways the mind cannot always explain.",
  "sleep-and-recovery": "Sleep is not laziness or weakness — it is medicine for a brain and body in recovery. While you sleep, your nervous system processes experiences, repairs tissue, regulates hormones, and clears out stress chemicals that build up during the day.",
  "boundaries-in-recovery": "Boundaries are not punishments or walls. They are the shape of your self-respect. In recovery, healthy boundaries protect your energy, your sobriety, and your sanity.",
  "grief-and-loss": "Grief is the price we pay for loving, hoping, or dreaming in a world where things end and people leave. In recovery, grief is everywhere: losses of people, relationships, time, health, opportunities, or the version of yourself you thought you would be by now.",
  "self-compassion": "Self-compassion is not letting yourself off the hook. It is learning how to speak to yourself like someone you are responsible for protecting, not someone you are trying to destroy.",
});

function normalizeTranslatorRequest(input = {}) {
  if (!Object.hasOwn(TOPIC_KEY_IDEAS, input.topicId)) {
    const error = new Error("Choose one of the available learning topics.");
    error.code = "INVALID_TRANSLATOR_TOPIC";
    throw error;
  }
  if (!Object.hasOwn(LANGUAGE_LABELS, input.language)) {
    const error = new Error("Choose Spanish, French, or Portuguese.");
    error.code = "INVALID_TRANSLATOR_LANGUAGE";
    throw error;
  }
  return {
    topicId: input.topicId,
    language: input.language,
    languageLabel: LANGUAGE_LABELS[input.language],
    sourceText: TOPIC_KEY_IDEAS[input.topicId],
  };
}

function buildTranslatorPrompt({ languageLabel, sourceText }) {
  return [
    `Translate the supplied general wellness education into clear, natural ${languageLabel}.`,
    "Translate faithfully and preserve the original meaning, uncertainty, and choice-led tone.",
    "Do not add medical advice, diagnosis, treatment claims, urgency, cultural assumptions, or extra facts.",
    "Keep the translation concise and accessible. Return JSON only: {\"translation\":string}.",
    `Text to translate: ${sourceText}`,
  ].join("\n");
}

module.exports = { LANGUAGE_LABELS, TOPIC_KEY_IDEAS, normalizeTranslatorRequest, buildTranslatorPrompt };
