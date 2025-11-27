// src/services/emotionalAnalysis.js
// Emotional state analysis engine for trauma-informed responses

/**
 * Analyze emotional state from user text
 * Returns emotion type, intensity, cues, and urgency level
 */
export function analyzeEmotionalState(text) {
  if (!text || typeof text !== "string") {
    return {
      emotion: "neutral",
      intensity: 1,
      cues: [],
      urgency: "low",
    };
  }

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  const cues = [];
  let intensity = 1;
  let urgency = "low";

  // Panic detection
  const panicKeywords = [
    "help", "can't breathe", "freaking out", "please", "urgent", "emergency",
    "panic", "anxious", "overwhelmed", "drowning", "can't handle", "breaking",
    "falling apart", "losing it", "can't cope", "desperate", "terrified"
  ];
  const panicCount = panicKeywords.filter(kw => lowerText.includes(kw)).length;
  if (panicCount > 0) {
    cues.push(...panicKeywords.filter(kw => lowerText.includes(kw)));
    intensity = Math.min(3 + panicCount, 5);
    urgency = panicCount >= 2 ? "high" : "medium";
  }

  // Shame detection
  const shameKeywords = [
    "i'm failing", "i'm the problem", "i'm weak", "i'm broken", "i'm worthless",
    "i'm a failure", "i'm pathetic", "i'm disgusting", "i'm unlovable",
    "i'm a burden", "i'm useless", "i'm a mess", "i'm damaged", "i'm ruined"
  ];
  const shameCount = shameKeywords.filter(kw => lowerText.includes(kw)).length;
  if (shameCount > 0) {
    cues.push(...shameKeywords.filter(kw => lowerText.includes(kw)));
    intensity = Math.max(intensity, Math.min(2 + shameCount, 5));
    urgency = shameCount >= 2 ? "high" : urgency === "low" ? "medium" : urgency;
  }

  // Urge/craving detection
  const urgeKeywords = [
    "craving", "urge", "tempted", "using", "want to use", "need to use",
    "thinking about using", "want a drink", "want to get high", "using again",
    "relapse", "slipping", "using drugs", "drinking", "getting high"
  ];
  const urgeCount = urgeKeywords.filter(kw => lowerText.includes(kw)).length;
  if (urgeCount > 0) {
    cues.push(...urgeKeywords.filter(kw => lowerText.includes(kw)));
    intensity = Math.max(intensity, Math.min(3 + urgeCount, 5));
    urgency = urgeCount >= 1 ? "high" : urgency === "low" ? "medium" : urgency;
  }

  // Overwhelm detection
  const overwhelmKeywords = [
    "too much", "i'm done", "can't handle", "overwhelmed", "exhausted",
    "burnt out", "drained", "empty", "nothing left", "can't do this",
    "giving up", "tired", "worn out", "spent"
  ];
  const overwhelmCount = overwhelmKeywords.filter(kw => lowerText.includes(kw)).length;
  if (overwhelmCount > 0) {
    cues.push(...overwhelmKeywords.filter(kw => lowerText.includes(kw)));
    intensity = Math.max(intensity, Math.min(2 + overwhelmCount, 5));
    urgency = overwhelmCount >= 2 ? "medium" : urgency;
  }

  // Dissociation detection
  const dissociationKeywords = [
    "numb", "empty", "disconnected", "not real", "out of body", "floating",
    "derealization", "depersonalization", "not myself", "like a dream",
    "unreal", "detached", "spaced out", "zoned out"
  ];
  const dissociationCount = dissociationKeywords.filter(kw => lowerText.includes(kw)).length;
  if (dissociationCount > 0) {
    cues.push(...dissociationKeywords.filter(kw => lowerText.includes(kw)));
    intensity = Math.max(intensity, Math.min(2 + dissociationCount, 5));
    urgency = dissociationCount >= 2 ? "medium" : urgency;
  }

  // Anger detection
  const angerKeywords = [
    "angry", "furious", "rage", "pissed", "mad", "hate", "resentment",
    "bitter", "frustrated", "irritated", "annoyed", "livid"
  ];
  const angerCount = angerKeywords.filter(kw => lowerText.includes(kw)).length;
  if (angerCount > 0) {
    cues.push(...angerKeywords.filter(kw => lowerText.includes(kw)));
    intensity = Math.max(intensity, Math.min(2 + angerCount, 5));
    urgency = angerCount >= 2 ? "medium" : urgency;
  }

  // Sadness detection
  const sadnessKeywords = [
    "sad", "depressed", "hopeless", "despair", "grief", "mourning",
    "empty", "lonely", "isolated", "alone", "worthless", "useless"
  ];
  const sadnessCount = sadnessKeywords.filter(kw => lowerText.includes(kw)).length;
  if (sadnessCount > 0) {
    cues.push(...sadnessKeywords.filter(kw => lowerText.includes(kw)));
    intensity = Math.max(intensity, Math.min(2 + sadnessCount, 5));
    urgency = sadnessCount >= 3 ? "medium" : urgency;
  }

  // Intensity adjustments based on punctuation and patterns
  const exclamationCount = (text.match(/!/g) || []).length;
  const questionCount = (text.match(/\?/g) || []).length;
  const ellipsisCount = (text.match(/\.{3,}/g) || []).length;
  
  if (exclamationCount >= 3) {
    intensity = Math.min(intensity + 1, 5);
    urgency = urgency === "low" ? "medium" : "high";
  }
  
  if (ellipsisCount >= 2) {
    intensity = Math.min(intensity + 1, 5);
  }

  // Sentence length drops (fragmented speech)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
  const shortSentences = sentences.filter(s => s.split(/\s+/).length < 5).length;
  if (shortSentences >= 3 && avgLength < 8) {
    intensity = Math.min(intensity + 1, 5);
    urgency = urgency === "low" ? "medium" : urgency;
  }

  // Repetition detection
  const wordFreq = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  const repeatedWords = Object.entries(wordFreq).filter(([_, count]) => count >= 3);
  if (repeatedWords.length > 0) {
    intensity = Math.min(intensity + 1, 5);
    cues.push(...repeatedWords.map(([word]) => `repeated: ${word}`));
  }

  // Determine primary emotion
  let emotion = "neutral";
  if (panicCount > 0 && panicCount >= Math.max(shameCount, urgeCount, overwhelmCount)) {
    emotion = "panic";
  } else if (urgeCount > 0 && urgeCount >= Math.max(shameCount, overwhelmCount)) {
    emotion = "urge";
  } else if (shameCount > 0 && shameCount >= Math.max(overwhelmCount, angerCount)) {
    emotion = "shame";
  } else if (angerCount > 0 && angerCount >= sadnessCount) {
    emotion = "anger";
  } else if (sadnessCount > 0) {
    emotion = "sadness";
  } else if (overwhelmCount > 0) {
    emotion = "overwhelm";
  } else if (dissociationCount > 0) {
    emotion = "dissociation";
  }

  return {
    emotion,
    intensity: Math.min(Math.max(intensity, 1), 5),
    cues: [...new Set(cues)], // Remove duplicates
    urgency,
  };
}

/**
 * Analyze message emotion for Phase 17 telemetry
 * Returns standardized emotion label, intensity, and valence
 * @param {string} text - Message text to analyze
 * @returns {Object} { label, intensity, valence }
 */
export function analyzeMessageEmotion(text) {
  if (!text || typeof text !== "string") {
    return {
      label: "neutral",
      intensity: 0,
      valence: "neutral",
    };
  }

  const lowerText = text.toLowerCase();
  const analysis = analyzeEmotionalState(text);
  
  // Map existing emotion types to Phase 17 labels
  const emotionMap = {
    panic: "anxious",
    urge: "anxious",
    shame: "ashamed",
    anger: "angry",
    sadness: "sad",
    overwhelm: "overwhelmed",
    dissociation: "numb",
    neutral: "neutral",
  };

  // Detect positive emotions
  const positiveKeywords = [
    "grateful", "thankful", "blessed", "hopeful", "better", "improving",
    "progress", "proud", "calm", "peaceful", "content", "relieved"
  ];
  const hasPositive = positiveKeywords.some(kw => lowerText.includes(kw));
  
  let label = emotionMap[analysis.emotion] || "neutral";
  let valence = "distressed";
  
  if (hasPositive) {
    label = "hopeful";
    valence = "supportive";
  } else if (analysis.emotion === "neutral" && analysis.intensity <= 2) {
    label = "calm";
    valence = "neutral";
  } else if (label === "neutral") {
    valence = "neutral";
  }

  // Normalize intensity to 0-1 range
  const intensity = Math.min(analysis.intensity / 5, 1);

  return {
    label,
    intensity,
    valence,
  };
}

/**
 * Detect trigger domains from message text
 * @param {string} text - Message text to analyze
 * @returns {string[]} Array of trigger domain strings
 */
export function detectTriggerDomains(text) {
  if (!text || typeof text !== "string") {
    return [];
  }

  const lowerText = text.toLowerCase();
  const domains = [];

  // Cravings/urge triggers
  const cravingKeywords = [
    "use", "drink", "relapse", "craving", "urge", "tempted", "using",
    "want to use", "need to use", "thinking about using", "getting high"
  ];
  if (cravingKeywords.some(kw => lowerText.includes(kw))) {
    domains.push("cravings");
  }

  // Shame triggers
  const shameKeywords = [
    "shame", "ashamed", "embarrassed", "humiliated", "disgusted with myself",
    "i'm a failure", "i'm worthless", "i'm broken"
  ];
  if (shameKeywords.some(kw => lowerText.includes(kw))) {
    domains.push("shame");
  }

  // Guilt triggers
  const guiltKeywords = [
    "guilt", "guilty", "i hurt", "i wronged", "i should have", "i shouldn't have",
    "i let down", "i disappointed"
  ];
  if (guiltKeywords.some(kw => lowerText.includes(kw))) {
    domains.push("guilt");
  }

  // Anger triggers
  const angerKeywords = [
    "angry", "furious", "rage", "pissed", "mad", "hate", "resentment",
    "bitter", "frustrated", "irritated"
  ];
  if (angerKeywords.some(kw => lowerText.includes(kw))) {
    domains.push("anger");
  }

  // Isolation triggers
  const isolationKeywords = [
    "alone", "lonely", "isolated", "no one", "nobody", "cut off", "disconnected",
    "no friends", "no support", "by myself"
  ];
  if (isolationKeywords.some(kw => lowerText.includes(kw))) {
    domains.push("isolation");
  }

  // Money/financial triggers
  const moneyKeywords = [
    "broke", "no money", "can't afford", "unemployed", "jobless", "bills",
    "debt", "financial", "eviction", "homeless"
  ];
  if (moneyKeywords.some(kw => lowerText.includes(kw))) {
    domains.push("money");
  }

  // Relationship triggers
  const relationshipKeywords = [
    "relationship", "breakup", "divorce", "partner", "spouse", "family",
    "they left", "they don't", "conflict", "fighting"
  ];
  if (relationshipKeywords.some(kw => lowerText.includes(kw))) {
    domains.push("relationship");
  }

  // Work triggers
  const workKeywords = [
    "work", "job", "boss", "coworker", "fired", "laid off", "workplace",
    "stress at work", "work pressure"
  ];
  if (workKeywords.some(kw => lowerText.includes(kw))) {
    domains.push("work");
  }

  // Sleep triggers
  const sleepKeywords = [
    "can't sleep", "insomnia", "tired", "exhausted", "sleep", "restless",
    "waking up", "nightmares"
  ];
  if (sleepKeywords.some(kw => lowerText.includes(kw))) {
    domains.push("sleep");
  }

  // Grief triggers
  const griefKeywords = [
    "grief", "grieving", "loss", "died", "death", "passed away", "mourning",
    "miss them", "they're gone"
  ];
  if (griefKeywords.some(kw => lowerText.includes(kw))) {
    domains.push("grief");
  }

  return [...new Set(domains)]; // Remove duplicates
}

export default {
  analyzeEmotionalState,
  analyzeMessageEmotion,
  detectTriggerDomains,
};

