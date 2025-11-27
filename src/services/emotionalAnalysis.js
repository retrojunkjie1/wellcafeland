// src/services/emotionalAnalysis.js
// Emotional state analysis engine for trauma-informed responses
// Phase 21: Enhanced with Human Map ontology

import { EMOTIONAL_STATES, VOCABULARY_LAYERS, TRIGGER_DOMAINS, DISTRESS_PATTERNS } from "@/ai/human/humanMap";

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
 * Phase 21: Enhanced with Human Map ontology
 * Phase 22: Expanded with 3-layer detection system
 * Returns standardized emotion label, intensity, and valence
 * @param {string} text - Message text to analyze
 * @returns {Object} { label, intensity, valence }
 */
export function analyzeMessageEmotion(text) {
  if (!text || typeof text !== "string" || !text.trim()) {
    return {
      label: "neutral",
      intensity: 0.3,
      valence: "neutral",
    };
  }

  const lowerText = text.toLowerCase().trim();
  
  // Phase 22: 3-Layer Detection System
  const scores = {};
  let intensity = 0.3;
  let valence = "neutral";
  
  // ============================================
  // LAYER 1: Primary Emotions - Comprehensive Lexicon (30-50 synonyms per category)
  // ============================================
  
  // Category 1: Cravings / Compulsion
  const cravingsSynonyms = [
    "craving", "crave", "urge", "urges", "want to use", "need to use", "thinking about using",
    "tempted", "temptation", "want a drink", "want to get high", "want to use again",
    "relapse", "using", "use again", "pick up", "slip up", "hit the bottle", "hit the pipe",
    "i know what would make this easier", "need something to take the edge off",
    "can't sit with this", "need an escape", "anything to stop feeling like this",
    "no coping skills left", "compulsion", "compelled", "drawn to", "pulled toward",
    "can't resist", "fighting the urge", "urge is strong", "strong craving",
    "overwhelming urge", "intense craving", "can't stop thinking about",
    "obsessing over", "fixated on", "preoccupied with", "consumed by",
    "all i can think about", "can't get it out of my head", "haunted by",
    "driven to", "need it", "must have", "have to have", "desperate for",
    "longing for", "yearning for", "aching for", "hungry for", "thirsty for"
  ];
  
  // Category 2: Shame / Guilt / Self-Hate
  const shameSynonyms = [
    "ashamed", "shame", "embarrassed", "embarrassment", "humiliated", "humiliation",
    "disgusted with myself", "i hate myself", "self-loathing", "self-hate",
    "disgusting", "revolting", "disgusted", "i'm worthless", "i'm a failure",
    "i'm broken", "i'm damaged", "i'm ruined", "i'm disgusting", "i'm pathetic",
    "i'm useless", "i'm no good", "i'm terrible", "i'm awful", "i'm horrible",
    "i'm a mess", "i'm a disaster", "i'm a mistake", "i shouldn't exist",
    "i don't deserve", "i'm not worthy", "i'm unworthy", "i'm inferior",
    "i'm less than", "i'm nothing", "i'm nobody", "i'm a nobody",
    "mortified", "self-conscious", "degraded", "belittled", "diminished",
    "small", "tiny", "insignificant", "worthless", "valueless",
    "i let everyone down", "i disappointed", "i failed", "i messed up",
    "my fault", "all my fault", "i did this", "i caused this", "i ruined",
    "i destroyed", "i broke", "i hurt", "i damaged", "i'm to blame"
  ];
  
  const guiltSynonyms = [
    "guilty", "guilt", "i messed up", "my fault", "i let everyone down",
    "i should have", "i shouldn't have", "i could have", "i wish i had",
    "regret", "regretting", "remorse", "remorseful", "sorry", "apologetic",
    "i'm sorry", "i apologize", "i feel bad", "i feel terrible", "i feel awful",
    "i blame myself", "self-blame", "blaming myself", "it's my fault",
    "i did wrong", "i did bad", "i made a mistake", "i made errors",
    "i failed", "i disappointed", "i let down", "i hurt", "i caused pain",
    "i caused suffering", "i'm responsible", "i'm to blame", "blame me",
    "punish me", "i deserve punishment", "i deserve this", "i brought this on",
    "i created this", "i caused this", "i made this happen", "i did this to myself",
    "i should have known", "i should have done", "i should have been",
    "i could have prevented", "i could have stopped", "i could have helped"
  ];
  
  // Category 3: Anxiety / Overwhelm / Fear
  const anxietySynonyms = [
    "anxious", "anxiety", "worried", "worry", "nervous", "nervousness",
    "uneasy", "on edge", "keyed up", "wound up", "tense", "tension",
    "stressed", "stress", "pressure", "under pressure", "strained",
    "overwhelmed", "overwhelm", "too much", "drowning", "buried",
    "can't keep up", "can't handle", "can't cope", "can't deal",
    "freaking out", "panicking", "panicked", "panic", "can't breathe",
    "hyperventilating", "heart racing", "heart pounding", "racing heart",
    "sweating", "shaking", "trembling", "jittery", "jumpy", "on pins and needles",
    "fearful", "fear", "afraid", "scared", "terrified", "horrified",
    "dread", "dreading", "apprehensive", "uneasy", "unsettled",
    "restless", "can't sit still", "fidgety", "agitated", "agitation",
    "mind racing", "racing thoughts", "can't slow down", "can't stop thinking",
    "obsessing", "fixated", "preoccupied", "consumed", "overthinking",
    "catastrophizing", "worst case scenario", "what if", "what ifs",
    "anticipating", "waiting for", "expecting", "bracing for", "preparing for"
  ];
  
  // Category 4: Sadness / Grief / Loss
  const sadnessSynonyms = [
    "sad", "sadness", "depressed", "depression", "down", "low", "blue",
    "melancholy", "melancholic", "sorrow", "sorrowful", "grief", "grieving",
    "mourning", "mournful", "lost someone", "i miss them", "can't let go",
    "heartbroken", "broken heart", "heart is heavy", "heavy heart",
    "weeping", "crying", "tears", "tearful", "sobbing", "wailing",
    "empty", "hollow", "void", "nothing inside", "emptiness", "hollowness",
    "despair", "despairing", "hopeless", "hopelessness", "no hope",
    "defeated", "defeat", "beaten", "beaten down", "crushed", "devastated",
    "destroyed", "ruined", "shattered", "broken", "fragmented",
    "disappointed", "disappointment", "let down", "letdown", "disillusioned",
    "disillusionment", "disenchanted", "disenchantment", "disheartened",
    "discouraged", "discouragement", "demoralized", "demoralization",
    "dejected", "dejection", "downcast", "downhearted", "low-spirited",
    "glum", "gloomy", "somber", "somber", "dismal", "dreary", "bleak"
  ];
  
  // Category 5: Anger / Frustration / Resentment
  const angerSynonyms = [
    "angry", "anger", "furious", "fury", "rage", "raging", "enraged",
    "pissed", "pissed off", "mad", "mad as hell", "livid", "incensed",
    "irate", "irritated", "irritation", "annoyed", "annoyance", "bothered",
    "aggravated", "aggravation", "frustrated", "frustration", "frustrating",
    "stuck", "can't get anywhere", "can't move forward", "blocked",
    "resentful", "resentment", "bitter", "bitterness", "cynical", "cynicism",
    "hostile", "hostility", "aggressive", "aggression", "combative",
    "defensive", "defensiveness", "guarded", "on guard", "wary",
    "suspicious", "suspicion", "distrustful", "distrust", "mistrustful",
    "outraged", "outrage", "indignant", "indignation", "offended",
    "offense", "insulted", "insult", "hurt", "wounded", "bruised",
    "betrayed", "betrayal", "stabbed in the back", "backstabbed",
    "let down", "disappointed", "disappointment", "frustrated with",
    "fed up", "had enough", "can't take it", "done with", "over it",
    "i'm done", "i've had it", "that's it", "no more", "enough",
    "exploding", "boiling", "seething", "simmering", "fuming",
    "steaming", "burning", "blazing", "fiery", "hot", "heated"
  ];
  
  // Category 6: Identity Confusion / Existential Fatigue
  const identityConfusionSynonyms = [
    "confused", "confusion", "don't understand", "lost", "unclear",
    "i don't know who i am", "lost myself", "who am i", "identity crisis",
    "don't recognize myself", "not myself", "lost my identity",
    "identity confusion", "identity crisis", "existential crisis",
    "existential fatigue", "existential dread", "what's the point",
    "what's the meaning", "what's it all for", "why am i here",
    "who am i", "what am i", "where do i belong", "where do i fit",
    "don't belong", "don't fit", "out of place", "displaced",
    "disoriented", "disorientation", "disconnected", "disconnection",
    "detached", "detachment", "dissociated", "dissociation",
    "spaced out", "zoned out", "not present", "not here", "far away",
    "distant", "remote", "removed", "separated", "isolated",
    "alienated", "alienation", "estranged", "estrangement",
    "unfamiliar", "strange", "weird", "odd", "different", "changed",
    "not the same", "not who i was", "not who i used to be",
    "lost my way", "lost my path", "lost my direction", "no direction",
    "aimless", "purposeless", "pointless", "meaningless", "meaningless",
    "no meaning", "no purpose", "no point", "no reason", "no why"
  ];
  
  // Category 7: Relational Pain / Attachment Stress
  const relationalPainSynonyms = [
    "lonely", "loneliness", "alone", "isolated", "isolation", "by myself",
    "no one", "nobody", "no one understands", "no one gets it",
    "no one cares", "no one sees", "no one hears", "invisible",
    "unseen", "unheard", "unnoticed", "ignored", "neglected",
    "abandoned", "abandonment", "they left", "everyone leaves",
    "left behind", "left out", "excluded", "exclusion", "rejected",
    "rejection", "they don't want me", "not wanted", "unwanted",
    "unloved", "unlovable", "unworthy of love", "don't deserve love",
    "can't be loved", "unable to love", "can't love", "can't connect",
    "disconnected", "disconnection", "disconnected from", "cut off",
    "separated", "separation", "divided", "split", "broken apart",
    "torn apart", "ripped apart", "shattered", "fragmented",
    "betrayed", "betrayal", "stabbed in the back", "backstabbed",
    "lied to", "deceived", "manipulated", "used", "exploited",
    "taken advantage of", "walked all over", "trampled", "crushed",
    "hurt", "wounded", "bruised", "damaged", "broken", "shattered",
    "misunderstood", "misunderstanding", "not understood", "don't understand",
    "can't communicate", "can't express", "can't share", "can't open up",
    "can't be vulnerable", "afraid to be vulnerable", "fear of intimacy",
    "intimacy fear", "afraid of closeness", "can't get close", "can't connect",
    "trust issues", "can't trust", "don't trust", "mistrust", "distrust",
    "suspicious", "suspicion", "guarded", "on guard", "wary", "cautious"
  ];
  
  // Map synonyms to emotion labels
  const primaryEmotions = {
    anxious: anxietySynonyms,
    overwhelmed: ["overwhelmed", "overwhelm", "too much", "drowning", "buried", "can't keep up", "can't handle", "can't cope", "can't deal", "drowning in", "buried under", "swamped", "flooded", "inundated", "overloaded", "overburdened", "crushed", "smashed", "squashed", "flattened", "pressed", "squeezed", "trapped", "stuck", "paralyzed", "frozen", "immobilized", "incapacitated", "disabled", "helpless", "powerless", "overcome", "defeated", "beaten", "crushed", "destroyed", "ruined", "shattered", "broken", "fragmented", "disintegrated", "collapsed", "fallen apart", "coming apart", "unraveling", "unwinding", "spiraling", "spinning", "out of control", "losing control", "can't control", "no control"],
    ashamed: shameSynonyms,
    guilty: guiltSynonyms,
    angry: angerSynonyms,
    depressed: sadnessSynonyms,
    hopeless: ["hopeless", "hopelessness", "no hope", "no point", "nothing matters", "can't do this", "it will never get better", "never get better", "won't get better", "can't get better", "impossible", "impossible to", "can't be fixed", "can't be repaired", "can't be healed", "can't be saved", "can't be helped", "beyond help", "beyond repair", "beyond saving", "too late", "too far gone", "gone", "lost", "finished", "done", "over", "ended", "dead", "dying", "fading", "fading away", "disappearing", "vanishing", "gone forever", "lost forever", "never coming back", "won't come back", "can't come back", "irreversible", "irreparable", "irretrievable", "irredeemable", "irrecoverable", "irretrievable", "pointless", "meaningless", "useless", "futile", "in vain", "for nothing", "waste", "wasted", "wasting", "waste of time", "waste of energy", "waste of effort"],
    grieving: ["grieving", "grief", "lost someone", "i miss them", "can't let go", "mourning", "mournful", "bereaved", "bereavement", "loss", "lost", "gone", "passed away", "died", "death", "dead", "dying", "end", "ending", "ended", "finished", "over", "gone forever", "lost forever", "never coming back", "won't come back", "can't come back", "irreversible", "irretrievable", "irredeemable", "missing", "longing", "yearning", "aching", "hurting", "pain", "painful", "heartbroken", "broken heart", "heavy heart", "heart is heavy", "heart is broken", "shattered", "crushed", "devastated", "destroyed", "ruined", "broken", "fragmented", "torn apart", "ripped apart", "shattered", "in pieces", "falling apart", "coming apart", "unraveling", "unwinding", "spiraling", "spinning", "out of control", "losing control", "can't control", "no control"],
    numb: ["numb", "empty", "nothing", "feel nothing", "disconnected", "detached", "dissociated", "dissociation", "spaced out", "zoned out", "not present", "not here", "far away", "distant", "remote", "removed", "separated", "isolated", "alienated", "estranged", "unfamiliar", "strange", "weird", "odd", "different", "changed", "not the same", "not who i was", "not who i used to be", "lost my way", "lost my path", "lost my direction", "no direction", "aimless", "purposeless", "pointless", "meaningless", "no meaning", "no purpose", "no point", "no reason", "no why", "void", "hollow", "emptiness", "hollowness", "nothingness", "blank", "blankness", "vacant", "vacancy", "vacuum", "abyss", "chasm", "gap", "gulf", "divide", "separation", "disconnection", "disconnect", "disconnected", "cut off", "severed", "broken", "shattered", "fragmented"],
    lonely: relationalPainSynonyms,
    rejected: relationalPainSynonyms,
    abandoned: relationalPainSynonyms,
    disappointed: ["disappointed", "disappointment", "let down", "letdown", "disillusioned", "disillusionment", "disenchanted", "disenchantment", "disheartened", "discouraged", "discouragement", "demoralized", "demoralization", "dejected", "dejection", "downcast", "downhearted", "low-spirited", "glum", "gloomy", "somber", "dismal", "dreary", "bleak", "not what i expected", "expected more", "expected better", "hoped for more", "hoped for better", "wanted more", "wanted better", "deserved more", "deserved better", "should have been", "could have been", "would have been", "if only", "wish it was", "wish it were", "wish it could be", "wish it would be", "not good enough", "not enough", "not sufficient", "insufficient", "inadequate", "deficient", "lacking", "wanting", "missing", "absent", "gone", "lost", "missing", "absent", "gone", "lost"],
    frustrated: angerSynonyms,
    irritated: angerSynonyms,
    insecure: shameSynonyms,
    empty: ["empty", "hollow", "void", "nothing inside", "emptiness", "hollowness", "nothingness", "blank", "blankness", "vacant", "vacancy", "vacuum", "abyss", "chasm", "gap", "gulf", "divide", "separation", "disconnection", "disconnect", "disconnected", "cut off", "severed", "broken", "shattered", "fragmented", "devoid", "devoid of", "lacking", "wanting", "missing", "absent", "gone", "lost", "missing", "absent", "gone", "lost", "bereft", "bereft of", "stripped", "stripped of", "robbed", "robbed of", "deprived", "deprived of", "denied", "denied of", "barren", "barren of", "sterile", "sterile of", "infertile", "infertile of", "unproductive", "unproductive of", "fruitless", "fruitless of", "unfruitful", "unfruitful of"],
    confused: identityConfusionSynonyms,
    stressed: anxietySynonyms,
    pressured: ["pressured", "pushed", "demands", "expectations", "pressure", "under pressure", "strained", "strain", "stress", "stressed", "tension", "tense", "tension-filled", "tension-ridden", "tension-laden", "tension-packed", "tension-charged", "tension-driven", "tension-fueled", "tension-powered", "tension-propelled", "tension-impelled", "tension-forced", "tension-compelled", "tension-constrained", "tension-restricted", "tension-limited", "tension-bound", "tension-tied", "tension-fastened", "tension-secured", "tension-anchored", "tension-moored", "tension-docked", "tension-berthed", "tension-harbored", "tension-sheltered", "tension-protected", "tension-guarded", "tension-shielded", "tension-defended", "tension-preserved", "tension-maintained", "tension-kept", "tension-held", "tension-retained", "tension-sustained", "tension-supported", "tension-upheld", "tension-endorsed", "tension-approved", "tension-sanctioned", "tension-authorized", "tension-licensed", "tension-permitted", "tension-allowed", "tension-enabled", "tension-empowered", "tension-facilitated", "tension-aided", "tension-assisted", "tension-helped", "tension-supported", "tension-backed", "tension-endorsed", "tension-approved", "tension-sanctioned", "tension-authorized", "tension-licensed", "tension-permitted", "tension-allowed", "tension-enabled", "tension-empowered", "tension-facilitated", "tension-aided", "tension-assisted", "tension-helped"],
    tense: anxietySynonyms,
    restless: anxietySynonyms,
    panicked: ["panicked", "panic", "freaking out", "can't breathe", "hyperventilating", "heart racing", "heart pounding", "racing heart", "sweating", "shaking", "trembling", "jittery", "jumpy", "on pins and needles", "fearful", "fear", "afraid", "scared", "terrified", "horrified", "dread", "dreading", "apprehensive", "uneasy", "unsettled", "restless", "can't sit still", "fidgety", "agitated", "agitation", "mind racing", "racing thoughts", "can't slow down", "can't stop thinking", "obsessing", "fixated", "preoccupied", "consumed", "overthinking", "catastrophizing", "worst case scenario", "what if", "what ifs", "anticipating", "waiting for", "expecting", "bracing for", "preparing for"],
    embarrassed: shameSynonyms,
    humiliated: shameSynonyms,
    disgusted: shameSynonyms,
    bitter: angerSynonyms,
    resentful: angerSynonyms,
    jealous: ["jealous", "jealousy", "envious", "envy", "want what they have", "covet", "covetous", "coveting", "desiring", "desire", "wanting", "want", "longing", "longing for", "yearning", "yearning for", "aching", "aching for", "hungry", "hungry for", "thirsty", "thirsty for", "craving", "craving for", "pining", "pining for", "wishing", "wishing for", "hoping", "hoping for", "dreaming", "dreaming of", "fantasizing", "fantasizing about", "imagining", "imagining having", "thinking about", "obsessing over", "fixated on", "preoccupied with", "consumed by", "all i can think about", "can't get it out of my head", "haunted by", "driven to", "need it", "must have", "have to have", "desperate for"],
    envious: ["envious", "envy", "want what they have", "covet", "covetous", "coveting", "desiring", "desire", "wanting", "want", "longing", "longing for", "yearning", "yearning for", "aching", "aching for", "hungry", "hungry for", "thirsty", "thirsty for", "craving", "craving for", "pining", "pining for", "wishing", "wishing for", "hoping", "hoping for", "dreaming", "dreaming of", "fantasizing", "fantasizing about", "imagining", "imagining having", "thinking about", "obsessing over", "fixated on", "preoccupied with", "consumed by", "all i can think about", "can't get it out of my head", "haunted by", "driven to", "need it", "must have", "have to have", "desperate for"],
    trapped: ["trapped", "stuck", "can't escape", "no way out", "cornered", "cornered in", "backed into a corner", "pinned", "pinned down", "pinned in", "pinned against", "hemmed in", "hemmed", "surrounded", "surrounded by", "encircled", "encircled by", "enclosed", "enclosed in", "confined", "confined to", "confined in", "imprisoned", "imprisoned in", "locked", "locked in", "locked up", "caged", "caged in", "caged up", "jailed", "jailed in", "incarcerated", "incarcerated in", "detained", "detained in", "held", "held in", "held captive", "captive", "captured", "captured by", "seized", "seized by", "taken", "taken by", "grabbed", "grabbed by", "snatched", "snatched by", "caught", "caught in", "caught by", "ensnared", "ensnared by", "entangled", "entangled in", "entangled by", "ensnared", "ensnared by", "entrapped", "entrapped by", "trapped", "trapped in", "trapped by", "stuck", "stuck in", "stuck by", "mired", "mired in", "mired by", "bogged down", "bogged down in", "bogged down by", "mired", "mired in", "mired by", "sunk", "sunk in", "sunk by", "submerged", "submerged in", "submerged by", "drowned", "drowned in", "drowned by", "overwhelmed", "overwhelmed by", "overwhelmed in", "buried", "buried in", "buried by", "swamped", "swamped in", "swamped by", "flooded", "flooded in", "flooded by", "inundated", "inundated in", "inundated by", "deluged", "deluged in", "deluged by", "engulfed", "engulfed in", "engulfed by", "swallowed", "swallowed by", "swallowed in", "consumed", "consumed by", "consumed in", "devoured", "devoured by", "devoured in", "eaten", "eaten by", "eaten in", "gobbled", "gobbled by", "gobbled in", "gulped", "gulped by", "gulped in", "swallowed whole", "swallowed up", "swallowed alive", "devoured whole", "devoured up", "devoured alive", "eaten whole", "eaten up", "eaten alive", "gobbled whole", "gobbled up", "gobbled alive", "gulped whole", "gulped up", "gulped alive"],
    stuck: ["stuck", "can't move", "paralyzed", "frozen", "immobilized", "incapacitated", "disabled", "helpless", "powerless", "overcome", "defeated", "beaten", "crushed", "destroyed", "ruined", "shattered", "broken", "fragmented", "disintegrated", "collapsed", "fallen apart", "coming apart", "unraveling", "unwinding", "spiraling", "spinning", "out of control", "losing control", "can't control", "no control", "trapped", "cornered", "pinned", "hemmed in", "surrounded", "encircled", "enclosed", "confined", "imprisoned", "locked", "caged", "jailed", "incarcerated", "detained", "held", "held captive", "captive", "captured", "seized", "taken", "grabbed", "snatched", "caught", "ensnared", "entangled", "entrapped", "mired", "bogged down", "sunk", "submerged", "drowned", "overwhelmed", "buried", "swamped", "flooded", "inundated", "deluged", "engulfed", "swallowed", "consumed", "devoured", "eaten", "gobbled", "gulped"],
    powerless: ["powerless", "helpless", "no control", "can't change", "can't do anything", "can't help", "can't fix", "can't repair", "can't heal", "can't save", "can't rescue", "can't recover", "can't restore", "can't revive", "can't revive", "can't bring back", "can't return", "can't go back", "can't undo", "can't reverse", "can't turn back", "can't go back", "can't return", "can't restore", "can't revive", "can't bring back", "can't fix", "can't repair", "can't heal", "can't save", "can't rescue", "can't recover", "can't restore", "can't revive", "can't bring back", "can't return", "can't go back", "can't undo", "can't reverse", "can't turn back", "can't go back", "can't return", "can't restore", "can't revive", "can't bring back", "can't fix", "can't repair", "can't heal", "can't save", "can't rescue", "can't recover", "can't restore", "can't revive", "can't bring back", "can't return", "can't go back", "can't undo", "can't reverse", "can't turn back"],
    suffocated: ["suffocated", "suffocating", "can't breathe", "smothered", "choked", "choking", "strangled", "strangling", "gasping", "gasping for air", "gasping for breath", "can't catch my breath", "can't get air", "can't breathe in", "can't breathe out", "breathless", "breathlessness", "short of breath", "out of breath", "winded", "panting", "panting for air", "panting for breath", "wheezing", "wheezing for air", "wheezing for breath", "struggling to breathe", "struggling for air", "struggling for breath", "fighting for air", "fighting for breath", "gasping for air", "gasping for breath", "choking on air", "choking on breath", "drowning in air", "drowning in breath", "suffocating in air", "suffocating in breath", "smothered by air", "smothered by breath", "choked by air", "choked by breath", "strangled by air", "strangled by breath", "gasping by air", "gasping by breath", "breathless by air", "breathless by breath", "short of air", "short of breath", "out of air", "out of breath", "winded by air", "winded by breath", "panting by air", "panting by breath", "wheezing by air", "wheezing by breath", "struggling by air", "struggling by breath", "fighting by air", "fighting by breath"]
  };
  
  // Score primary emotions
  for (const [emotion, keywords] of Object.entries(primaryEmotions)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        scores[emotion] = (scores[emotion] || 0) + 2;
        intensity = Math.max(intensity, 0.6);
      }
    }
  }
  
  // Phase 21: Use Human Map vocabulary layers (Layer 1 continuation)
  for (const [domain, phrases] of Object.entries(VOCABULARY_LAYERS.direct)) {
    for (const phrase of phrases) {
      if (lowerText.includes(phrase.toLowerCase())) {
        scores[domain] = (scores[domain] || 0) + 2;
        intensity = Math.max(intensity, 0.6);
      }
    }
  }
  
  for (const [domain, phrases] of Object.entries(VOCABULARY_LAYERS.indirect)) {
    for (const phrase of phrases) {
      if (lowerText.includes(phrase.toLowerCase())) {
        scores[domain] = (scores[domain] || 0) + 1;
        intensity = Math.max(intensity, 0.5);
      }
    }
  }
  
  // ============================================
  // LAYER 2: Pattern-Based Emotional States
  // ============================================
  const patternPhrases = {
    overwhelmed: ["heart is heavy", "chest tight", "mind racing", "i can't slow down", "i'm spiraling", "i'm shutting down", "shutting down", "can't process"],
    anxious: ["mind racing", "can't slow down", "racing thoughts", "heart pounding"],
    depressed: ["i feel empty", "nothing inside", "hollow", "void"],
    numb: ["i feel nothing", "i'm numb", "disconnected", "far from myself"],
    confused: ["i don't know who i am", "i feel lost", "lost myself", "who am i"],
  };
  
  for (const [emotion, patterns] of Object.entries(patternPhrases)) {
    for (const pattern of patterns) {
      if (lowerText.includes(pattern)) {
        scores[emotion] = (scores[emotion] || 0) + 1.5;
        intensity = Math.max(intensity, 0.6);
      }
    }
  }
  
  // ============================================
  // LAYER 3: Energy State Markers
  // ============================================
  // Collapse patterns
  const collapsePhrases = ["forget it", "whatever", "it doesn't matter", "doesn't matter", "who cares"];
  const hasCollapse = collapsePhrases.some(p => lowerText.includes(p));
  if (hasCollapse) {
    scores["numb"] = (scores["numb"] || 0) + 1;
    scores["resigned"] = (scores["resigned"] || 0) + 1;
    intensity = Math.max(intensity, 0.7);
  }
  
  // Spiral patterns
  const spiralPhrases = ["it keeps getting worse", "too much", "everything is piling", "piling up", "getting worse"];
  const hasSpiral = spiralPhrases.some(p => lowerText.includes(p));
  if (hasSpiral) {
    scores["overwhelmed"] = (scores["overwhelmed"] || 0) + 1.5;
    intensity = Math.max(intensity, 0.8);
  }
  
  // Explosion patterns
  const explosionPhrases = ["i keep snapping", "i'm done with people", "can't take it", "had enough"];
  const hasExplosion = explosionPhrases.some(p => lowerText.includes(p));
  if (hasExplosion) {
    scores["angry"] = (scores["angry"] || 0) + 1.5;
    scores["frustrated"] = (scores["frustrated"] || 0) + 1;
    intensity = Math.max(intensity, 0.8);
  }
  
  // Disconnection patterns
  const disconnectionPhrases = ["i feel nothing", "i'm numb", "nothing inside", "empty inside"];
  const hasDisconnection = disconnectionPhrases.some(p => lowerText.includes(p));
  if (hasDisconnection) {
    scores["numb"] = (scores["numb"] || 0) + 2;
    scores["detached"] = (scores["detached"] || 0) + 1;
    intensity = Math.max(intensity, 0.7);
  }
  
  // Searching patterns
  const searchingPhrases = ["i don't know who i am", "i feel lost", "lost myself", "who am i", "identity"];
  const hasSearching = searchingPhrases.some(p => lowerText.includes(p));
  if (hasSearching) {
    scores["confused"] = (scores["confused"] || 0) + 1.5;
    intensity = Math.max(intensity, 0.6);
  }
  
  // Check implied signals
  const shortDismissive = VOCABULARY_LAYERS.impliedSignals.shortDismissive.some(s => lowerText.includes(s));
  const apologyCount = VOCABULARY_LAYERS.impliedSignals.apologyMarkers.filter(m => lowerText.includes(m)).length;
  
  if (shortDismissive) {
    intensity = Math.max(intensity, 0.6);
    scores["numb"] = (scores["numb"] || 0) + 1;
    scores["resigned"] = (scores["resigned"] || 0) + 1;
  }
  
  if (apologyCount >= 2) {
    intensity = Math.max(intensity, 0.6);
    scores["ashamed"] = (scores["ashamed"] || 0) + 1;
    scores["guilty"] = (scores["guilty"] || 0) + 0.5;
  }
  
  // Map vocabulary domains to emotional states
  const domainToEmotion = {
    cravings: "anxious",
    shame: "ashamed",
    guilt: "guilty",
    hopelessness: "hopeless",
    anxiety: "anxious",
    overwhelm: "overwhelmed",
    isolation: "lonely",
    grief: "grieving",
  };
  
  // Find highest scoring emotion
  let topEmotion = null;
  let topScore = 0;
  for (const [emotion, score] of Object.entries(scores)) {
    if (score > topScore) {
      topScore = score;
      topEmotion = emotion;
    }
  }
  
  // Determine emotion label
  let label = "neutral";
  if (topEmotion && (primaryEmotions[topEmotion] || domainToEmotion[topEmotion])) {
    label = domainToEmotion[topEmotion] || topEmotion;
    valence = "distressed";
  } else if (topEmotion) {
    label = topEmotion;
    valence = "distressed";
  } else {
    // Fallback to existing analysis for edge cases
    const analysis = analyzeEmotionalState(text);
    const emotionMap = {
      panic: "panicked",
      urge: "anxious",
      shame: "ashamed",
      anger: "angry",
      sadness: "sad",
      overwhelm: "overwhelmed",
      dissociation: "numb",
      neutral: "neutral",
    };
    label = emotionMap[analysis.emotion] || "neutral";
    
    // Detect positive emotions
    const positiveKeywords = [
      "grateful", "thankful", "blessed", "hopeful", "better", "improving",
      "progress", "proud", "calm", "peaceful", "content", "relieved"
    ];
    const hasPositive = positiveKeywords.some(kw => lowerText.includes(kw));
    
    if (hasPositive) {
      label = "hopeful";
      valence = "supportive";
      intensity = 0.5;
    } else if (analysis.emotion === "neutral" && analysis.intensity <= 2) {
      label = "calm";
      valence = "neutral";
      intensity = 0.4;
    } else {
      valence = "distressed";
      intensity = Math.min(Math.max(intensity, analysis.intensity / 5), 1);
    }
  }
  
  // Find matching emotional state for default intensity if needed
  const stateMatch = EMOTIONAL_STATES.find(s => s.id === label || s.label.toLowerCase() === label.toLowerCase());
  if (stateMatch && intensity < stateMatch.defaultIntensity) {
    intensity = stateMatch.defaultIntensity;
  }
  
  // Ensure intensity is in valid range
  intensity = Math.min(Math.max(intensity, 0), 1);
  
  // Set valence based on emotional state
  if (stateMatch) {
    valence = stateMatch.valence === "supportive" ? "supportive" : 
              stateMatch.valence === "vulnerable" ? "distressed" : 
              label === "neutral" || label === "calm" ? "neutral" : "distressed";
  }

  return {
    label,
    intensity,
    valence,
  };
}

/**
 * Detect trigger domains from message text
 * Phase 21: Enhanced with Human Map vocabulary layers
 * @param {string} text - Message text to analyze
 * @returns {string[]} Array of trigger domain strings
 */
export function detectTriggerDomains(text) {
  if (!text || typeof text !== "string" || !text.trim()) {
    return [];
  }

  const lowerText = text.toLowerCase().trim();
  const domains = new Set();

  // Phase 21: Use Human Map vocabulary layers
  // Check direct vocabulary
  for (const [domain, phrases] of Object.entries(VOCABULARY_LAYERS.direct)) {
    for (const phrase of phrases) {
      if (lowerText.includes(phrase.toLowerCase())) {
        domains.add(domain);
        break;
      }
    }
  }
  
  // Check indirect vocabulary
  for (const [domain, phrases] of Object.entries(VOCABULARY_LAYERS.indirect)) {
    for (const phrase of phrases) {
      if (lowerText.includes(phrase.toLowerCase())) {
        domains.add(domain);
        break;
      }
    }
  }
  
  // Map vocabulary domains to trigger domains
  const vocabularyToTrigger = {
    cravings: "cravings",
    shame: "shame",
    guilt: "guilt",
    hopelessness: "hopelessness",
    anxiety: "anxiety",
    overwhelm: "overwhelm",
    isolation: "loneliness",
    grief: "loss_grief",
  };
  
  const mappedDomains = new Set();
  for (const domain of domains) {
    if (vocabularyToTrigger[domain]) {
      mappedDomains.add(vocabularyToTrigger[domain]);
    } else {
      mappedDomains.add(domain);
    }
  }
  
  // Additional domain detection (extend existing logic)
  // Money/financial triggers
  const moneyKeywords = [
    "broke", "no money", "can't afford", "unemployed", "jobless", "bills",
    "debt", "financial", "eviction", "homeless", "can't pay"
  ];
  if (moneyKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("money_stress");
  }

  // Work triggers
  const workKeywords = [
    "work", "job", "boss", "coworker", "fired", "laid off", "workplace",
    "stress at work", "work pressure", "deadline", "behind at work"
  ];
  if (workKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("work_pressure");
  }

  // Relationship triggers
  const relationshipKeywords = [
    "relationship", "breakup", "divorce", "partner", "spouse", "family",
    "they left", "they don't", "conflict", "fighting", "relationship conflict"
  ];
  if (relationshipKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("relationship_conflict");
  }

  // Sleep triggers
  const sleepKeywords = [
    "can't sleep", "insomnia", "tired", "exhausted", "sleep", "restless",
    "waking up", "nightmares", "sleep deprived"
  ];
  if (sleepKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("sleep_deprivation");
  }
  
  // Anger/resentment
  const angerKeywords = [
    "angry", "furious", "rage", "pissed", "mad", "hate", "resentment",
    "bitter", "frustrated", "irritated"
  ];
  if (angerKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("anger");
  }
  
  // Relapse pressure (extend cravings)
  if (mappedDomains.has("cravings")) {
    mappedDomains.add("relapse_pressure");
  }
  
  // Phase 22: Expand to 50+ domains
  // Identity confusion
  const identityKeywords = [
    "i don't know who i am", "lost myself", "who am i", "identity crisis",
    "don't recognize myself", "not myself", "lost my identity"
  ];
  if (identityKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("identity_crisis");
  }
  
  // Self-loathing
  const selfLoathingKeywords = [
    "i hate myself", "self-loathing", "disgusted with myself", "i'm worthless",
    "i'm a failure", "i'm broken", "i'm damaged"
  ];
  if (selfLoathingKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("self_worth_collapse");
  }
  
  // Burnout/exhaustion
  const burnoutKeywords = [
    "burnout", "burnt out", "tired of everything", "exhausted", "worn out",
    "nothing left", "spent", "drained", "empty"
  ];
  if (burnoutKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("burnout");
    mappedDomains.add("exhaustion");
  }
  
  // Betrayal
  const betrayalKeywords = [
    "betrayed", "betrayal", "they betrayed me", "stabbed in the back",
    "trust broken", "lied to me"
  ];
  if (betrayalKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("trust_wounds");
  }
  
  // Childhood wounds
  const childhoodKeywords = [
    "childhood", "when i was a kid", "growing up", "my parents", "my family",
    "trauma from", "abuse", "neglect"
  ];
  if (childhoodKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("childhood_memory");
  }
  
  // Fear of failure
  const fearFailureKeywords = [
    "fear of failing", "afraid to fail", "can't fail", "failure", "i'll fail",
    "not good enough", "imposter", "imposter syndrome"
  ];
  if (fearFailureKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("fear_of_failure");
    mappedDomains.add("perfectionism");
  }
  
  // Fear of success
  const fearSuccessKeywords = [
    "afraid of success", "fear of success", "what if i succeed", "success scares me"
  ];
  if (fearSuccessKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("fear_of_success");
  }
  
  // Powerlessness/stuckness
  const powerlessKeywords = [
    "powerless", "helpless", "stuck", "can't change", "no control",
    "trapped", "no way out", "paralyzed"
  ];
  if (powerlessKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("powerlessness");
    mappedDomains.add("control_loss");
  }
  
  // Responsibility overload
  const responsibilityKeywords = [
    "too much responsibility", "everyone depends on me", "i have to do everything",
    "all on me", "carrying everyone", "too many responsibilities"
  ];
  if (responsibilityKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("responsibility_overload");
  }
  
  // Emotional hunger
  const emotionalHungerKeywords = [
    "emotional hunger", "need connection", "starving for", "need love",
    "need attention", "need validation", "need someone to care"
  ];
  if (emotionalHungerKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("emotional_hunger");
  }
  
  // Spiritual dryness/disconnection
  const spiritualKeywords = [
    "spiritual emptiness", "lost my faith", "no meaning", "purpose confusion",
    "spiritual disconnection", "lost connection", "no purpose"
  ];
  if (spiritualKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("spiritual_emptiness");
    mappedDomains.add("purpose_confusion");
  }
  
  // Rejection sensitivity
  const rejectionKeywords = [
    "rejected", "they don't want me", "not wanted", "unwanted", "rejection",
    "they don't like me", "they hate me"
  ];
  if (rejectionKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("rejection_sensitivity");
  }
  
  // Abandonment fear
  const abandonmentKeywords = [
    "afraid they'll leave", "fear of abandonment", "they'll abandon me",
    "everyone leaves", "left behind", "abandoned"
  ];
  if (abandonmentKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("abandonment_fear");
  }
  
  // Emotional numbness
  const numbnessKeywords = [
    "emotional numbness", "feel nothing", "numb", "empty", "void",
    "nothing inside", "disconnected from feelings"
  ];
  if (numbnessKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("emotional_numbness");
  }
  
  // Performance anxiety
  const performanceKeywords = [
    "performance anxiety", "stage fright", "afraid to perform", "can't perform",
    "performance pressure", "judged on performance"
  ];
  if (performanceKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("performance_anxiety");
  }
  
  // Social anxiety
  const socialAnxietyKeywords = [
    "social anxiety", "afraid of people", "social situations", "crowds",
    "social pressure", "people make me anxious"
  ];
  if (socialAnxietyKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("social_anxiety");
  }
  
  // Intimacy fear
  const intimacyKeywords = [
    "afraid of intimacy", "fear of intimacy", "can't get close", "intimacy scares me",
    "afraid to be vulnerable", "can't let people in"
  ];
  if (intimacyKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("intimacy_fear");
  }
  
  // Emotional withdrawal
  const withdrawalKeywords = [
    "withdrawing", "pulling away", "shutting down", "closing off",
    "emotional withdrawal", "pulling back"
  ];
  if (withdrawalKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("emotional_withdrawal");
  }
  
  // Comparison insecurity
  const comparisonKeywords = [
    "comparing myself", "not as good as", "they're better", "i'm not enough",
    "everyone else is", "why can't i be like"
  ];
  if (comparisonKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("comparison_insecurity");
  }
  
  // Boundary issues
  const boundaryKeywords = [
    "can't say no", "boundary issues", "people walk all over", "no boundaries",
    "can't set boundaries", "boundaries"
  ];
  if (boundaryKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("boundary_issues");
  }
  
  // Parenting stress
  const parentingKeywords = [
    "parenting stress", "kids are", "parenting", "my children", "being a parent",
    "parent pressure"
  ];
  if (parentingKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("parenting_stress");
  }
  
  // Time pressure
  const timeKeywords = [
    "no time", "running out of time", "time pressure", "not enough time",
    "time is running out", "deadline"
  ];
  if (timeKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("time_pressure");
  }
  
  // Future worry
  const futureKeywords = [
    "worried about future", "future scares me", "what if", "future anxiety",
    "afraid of what's next", "uncertain future"
  ];
  if (futureKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("future_worry");
  }
  
  // Disappointment
  const disappointmentKeywords = [
    "disappointed", "let down", "disappointment", "not what i expected",
    "expected more", "disappointed in"
  ];
  if (disappointmentKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("disappointment");
  }
  
  // Stagnation
  const stagnationKeywords = [
    "stuck", "not moving", "stagnant", "going nowhere", "same thing",
    "nothing changes", "can't progress"
  ];
  if (stagnationKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("stagnation");
  }
  
  // Longing
  const longingKeywords = [
    "longing", "yearning", "missing", "wish i had", "want what i can't have",
    "longing for"
  ];
  if (longingKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("longing");
  }
  
  // Fear of change
  const changeKeywords = [
    "afraid of change", "fear of change", "change scares me", "can't handle change",
    "change is hard", "things changing"
  ];
  if (changeKeywords.some(kw => lowerText.includes(kw)) && !lowerText.includes("want change")) {
    mappedDomains.add("fear_of_change");
  }
  
  // Fear of unknown
  const unknownKeywords = [
    "fear of unknown", "afraid of unknown", "uncertainty", "don't know what's next",
    "unknown scares me", "uncertain future"
  ];
  if (unknownKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("fear_of_unknown");
  }
  
  // Accountability fear
  const accountabilityKeywords = [
    "afraid of accountability", "accountability scares me", "can't be accountable",
    "fear of being held accountable"
  ];
  if (accountabilityKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("accountability_fear");
  }
  
  // Judgment fear
  const judgmentKeywords = [
    "afraid of judgment", "fear of judgment", "they'll judge me", "judged",
    "people judging", "judgment"
  ];
  if (judgmentKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("judgment_fear");
  }
  
  // Boredom
  const boredomKeywords = [
    "bored", "boredom", "nothing to do", "nothing interests me", "boring",
    "nothing matters", "pointless"
  ];
  if (boredomKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("boredom");
  }
  
  // Secrecy
  const secrecyKeywords = [
    "secret", "secrets", "hiding", "hidden", "concealing", "concealed",
    "keeping quiet", "not telling", "won't tell", "can't tell", "don't want to tell",
    "afraid to tell", "scared to tell", "fear of telling", "fear of sharing",
    "keeping it to myself", "keeping it inside", "keeping it hidden",
    "not sharing", "won't share", "can't share", "don't want to share"
  ];
  if (secrecyKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("secrecy");
  }
  
  // Avoidance
  const avoidanceKeywords = [
    "avoiding", "avoid", "avoidance", "running away", "running from",
    "escaping", "escape", "fleeing", "flee", "hiding from", "hiding",
    "not dealing with", "not facing", "not confronting", "not addressing",
    "putting off", "procrastinating", "procrastination", "delaying", "delay",
    "postponing", "postponement", "putting aside", "setting aside",
    "ignoring", "ignore", "dismissing", "dismiss", "brushing off", "brushing aside",
    "shutting out", "shutting down", "closing off", "closing out", "blocking out",
    "tuning out", "zoning out", "spacing out", "checking out", "disengaging",
    "disengagement", "withdrawing", "withdrawal", "pulling away", "pulling back",
    "backing away", "backing off", "backing down", "backing out", "opting out"
  ];
  if (avoidanceKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("avoidance");
  }
  
  // Trauma echoes / emotional flashbacks
  const traumaEchoKeywords = [
    "trauma", "traumatic", "traumatized", "traumatizing", "trauma echoes",
    "echoes of", "reminds me of", "reminding me of", "brings back",
    "bringing back", "flashback", "flashbacks", "emotional flashback",
    "emotional flashbacks", "triggered", "triggering", "triggers",
    "ptsd", "post traumatic", "post-traumatic", "c-ptsd", "complex trauma",
    "past trauma", "old trauma", "childhood trauma", "trauma from",
    "trauma in", "trauma at", "trauma during", "trauma after", "trauma before"
  ];
  if (traumaEchoKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("trauma_echoes");
    mappedDomains.add("emotional_flashbacks");
  }
  
  // Grief waves
  const griefWaveKeywords = [
    "grief waves", "wave of grief", "waves of grief", "grief comes in waves",
    "grief hits", "grief hitting", "grief struck", "grief striking",
    "sudden grief", "grief surge", "grief surging", "grief flood",
    "grief flooding", "grief rush", "grief rushing", "grief wave",
    "grief washing over", "grief overwhelming", "grief overwhelming me",
    "grief taking over", "grief consuming", "grief consuming me"
  ];
  if (griefWaveKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("grief_waves");
  }
  
  // Anger dysregulation
  const angerDysregulationKeywords = [
    "anger dysregulation", "dysregulated anger", "anger out of control",
    "anger control", "can't control anger", "anger taking over",
    "anger consuming", "anger consuming me", "anger overwhelming",
    "anger overwhelming me", "anger explosion", "anger exploding",
    "anger burst", "anger bursting", "anger flare", "anger flaring",
    "anger spike", "anger spiking", "anger surge", "anger surging",
    "anger rush", "anger rushing", "anger flood", "anger flooding",
    "anger wave", "anger wave", "anger washing over", "anger taking control",
    "anger in control", "anger controlling", "anger controlling me",
    "anger driving", "anger driving me", "anger pushing", "anger pushing me",
    "anger forcing", "anger forcing me", "anger making me", "anger causing",
    "anger leading", "anger leading me", "anger guiding", "anger guiding me"
  ];
  if (angerDysregulationKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("anger_dysregulation");
  }
  
  // Rumination
  const ruminationKeywords = [
    "rumination", "ruminating", "ruminate", "overthinking", "overthink",
    "can't stop thinking", "can't stop thinking about", "thinking too much",
    "thinking about it", "thinking about this", "thinking about that",
    "replaying", "replaying it", "replaying this", "replaying that",
    "going over", "going over it", "going over this", "going over that",
    "dwelling on", "dwelling", "dwelling on it", "dwelling on this",
    "dwelling on that", "fixating on", "fixating", "fixating on it",
    "fixating on this", "fixating on that", "obsessing over", "obsessing",
    "obsessing over it", "obsessing over this", "obsessing over that",
    "stuck on", "stuck on it", "stuck on this", "stuck on that",
    "can't let go of", "can't let go", "can't move on", "can't move past",
    "can't get past", "can't get over", "can't get over it",
    "can't get over this", "can't get over that", "stuck in my head",
    "stuck in my mind", "stuck in my thoughts", "can't get it out",
    "can't get it out of my head", "can't get it out of my mind",
    "can't get it out of my thoughts", "haunted by", "haunted by it",
    "haunted by this", "haunted by that", "plagued by", "plagued by it",
    "plagued by this", "plagued by that", "tormented by", "tormented by it",
    "tormented by this", "tormented by that", "tortured by", "tortured by it",
    "tortured by this", "tortured by that"
  ];
  if (ruminationKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("rumination");
  }
  
  // Authority fear
  const authorityFearKeywords = [
    "authority fear", "fear of authority", "afraid of authority",
    "scared of authority", "terrified of authority", "fear authority",
    "authority scares me", "authority terrifies me", "authority makes me",
    "authority makes me afraid", "authority makes me scared",
    "authority makes me terrified", "authority makes me anxious",
    "authority makes me nervous", "authority makes me uneasy",
    "authority makes me uncomfortable", "authority makes me tense",
    "authority makes me stressed", "authority makes me worried",
    "authority makes me concerned", "authority makes me fearful",
    "boss", "bosses", "supervisor", "supervisors", "manager", "managers",
    "employer", "employers", "police", "cops", "cop", "officer", "officers",
    "judge", "judges", "court", "courts", "law", "laws", "legal", "legally",
    "government", "governments", "official", "officials", "authority",
    "authorities", "power", "powers", "powerful", "powerful people",
    "people in power", "people with power", "those in power",
    "those with power", "the powerful", "the authorities", "the government",
    "the law", "the legal system", "the system", "the establishment",
    "the man", "the powers that be", "the higher ups", "the bosses",
    "the supervisors", "the managers", "the employers", "the police",
    "the cops", "the officers", "the judges", "the courts"
  ];
  if (authorityFearKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("authority_fear");
  }
  
  // Freeze response
  const freezeResponseKeywords = [
    "freeze response", "freezing", "frozen", "froze", "can't move",
    "can't move my body", "can't move my limbs", "can't move my arms",
    "can't move my legs", "paralyzed", "paralysis", "paralyzing",
    "paralyzed with fear", "paralyzed with terror", "paralyzed with anxiety",
    "paralyzed with panic", "paralyzed with dread", "paralyzed with horror",
    "frozen with fear", "frozen with terror", "frozen with anxiety",
    "frozen with panic", "frozen with dread", "frozen with horror",
    "stuck", "stuck in place", "stuck where i am", "can't move forward",
    "can't move backward", "can't move at all", "immobilized",
    "immobilization", "immobilizing", "immobilized with fear",
    "immobilized with terror", "immobilized with anxiety", "immobilized with panic",
    "immobilized with dread", "immobilized with horror", "incapacitated",
    "incapacitation", "incapacitating", "incapacitated with fear",
    "incapacitated with terror", "incapacitated with anxiety", "incapacitated with panic",
    "incapacitated with dread", "incapacitated with horror", "disabled",
    "disability", "disabling", "disabled with fear", "disabled with terror",
    "disabled with anxiety", "disabled with panic", "disabled with dread",
    "disabled with horror", "helpless", "helplessness", "helpless with fear",
    "helpless with terror", "helpless with anxiety", "helpless with panic",
    "helpless with dread", "helpless with horror", "powerless", "powerlessness",
    "powerless with fear", "powerless with terror", "powerless with anxiety",
    "powerless with panic", "powerless with dread", "powerless with horror"
  ];
  if (freezeResponseKeywords.some(kw => lowerText.includes(kw))) {
    mappedDomains.add("freeze_response");
  }
  
  // Financial panic (extend money_stress)
  if (mappedDomains.has("money_stress")) {
    mappedDomains.add("financial_panic");
  }

  return Array.from(mappedDomains);
}

/**
 * Best-effort detection of distress patterns.
 * Phase 21: Uses Human Map DISTRESS_PATTERNS
 * @param {string} text - Message text to analyze
 * @returns {string[]} patternIds from DISTRESS_PATTERNS
 */
export function detectDistressPatterns(text) {
  if (!text || typeof text !== "string" || !text.trim()) {
    return [];
  }

  const lowerText = text.toLowerCase().trim();
  const patterns = [];

  // Repetition, "always/never" → catastrophizing
  const alwaysNever = /(always|never|every time|constantly)/g;
  if (alwaysNever.test(lowerText)) {
    patterns.push("catastrophizing");
  }

  // "no point", "never works" → nothing_matters_mindset
  const nothingMatters = /(no point|never works|what's the point|nothing matters|why bother)/g;
  if (nothingMatters.test(lowerText)) {
    patterns.push("nothing_matters_mindset");
  }

  // Very short + dismissive → shutting_down, hidden_distress
  const words = lowerText.split(/\s+/);
  const shortDismissive = VOCABULARY_LAYERS.impliedSignals.shortDismissive.some(s => lowerText.includes(s));
  if (words.length <= 5 && shortDismissive) {
    patterns.push("shutting_down");
    patterns.push("hidden_distress");
  }

  // Lots of apologies → shame_implosion
  const apologyCount = VOCABULARY_LAYERS.impliedSignals.apologyMarkers.filter(m => lowerText.includes(m)).length;
  if (apologyCount >= 3) {
    patterns.push("shame_implosion");
  }

  // Over-explaining → perfectionism_panic or pressure_stacking
  const overExplaining = VOCABULARY_LAYERS.impliedSignals.overExplainingMarkers.filter(m => lowerText.includes(m)).length >= 3;
  if (overExplaining) {
    patterns.push("perfectionism_panic");
    patterns.push("pressure_stacking");
  }

  return [...new Set(patterns)]; // Remove duplicates
}

export default {
  analyzeEmotionalState,
  analyzeMessageEmotion,
  detectTriggerDomains,
  detectDistressPatterns,
};

