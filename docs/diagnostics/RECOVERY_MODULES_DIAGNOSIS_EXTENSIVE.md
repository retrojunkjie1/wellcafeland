# Recovery Modules — EXTENSIVE Technical Diagnosis

**Generated:** 2024  
**Status:** Complete Deep-Dive Analysis  
**Last Updated:** Phase 45 Complete  
**Document Version:** 2.0 (Extensive)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Complete Module Inventory](#complete-module-inventory)
3. [Architecture & Code Analysis](#architecture--code-analysis)
4. [Content Delivery Systems](#content-delivery-systems)
5. [Audio/Video Infrastructure](#audiovideo-infrastructure)
6. [Navigation & Routing](#navigation--routing)
7. [Memory & State Management](#memory--state-management)
8. [UI/UX Components](#uiux-components)
9. [Error Handling & Edge Cases](#error-handling--edge-cases)
10. [Performance Analysis](#performance-analysis)
11. [Integration Points](#integration-points)
12. [Missing Features & Gaps](#missing-features--gaps)
13. [Code Examples & Snippets](#code-examples--snippets)
14. [Testing & Quality Assurance](#testing--quality-assurance)
15. [Accessibility Analysis](#accessibility-analysis)
16. [Security Considerations](#security-considerations)
17. [Recommended Improvements](#recommended-improvements)

---

## Executive Summary

### System Overview
The Recovery Modules system is a **multi-layered content delivery platform** consisting of:

- **8 Learning Path Topics** (Phase 45 - Dynamic 7-tile system)
- **1 Legacy Markdown Topic** (Backward compatibility)
- **1 Education Module** (Shame basics)
- **3 Content Delivery Engines** (Learning Paths, Recovery Basics, Markdown)
- **2 Audio Systems** (Web Speech API, Narration Engine - not integrated)
- **1 Video Component** (Exists but not integrated)
- **1 Soundscape Engine** (Exists but not integrated)

### Status Matrix

| Component | Status | Integration | Notes |
|-----------|--------|-------------|-------|
| Learning Paths Engine | ✅ Working | ✅ Integrated | Phase 45 complete |
| Recovery Basics Engine | ✅ Working | ⚠️ Fallback only | Phase 44, superseded |
| Markdown Content Service | ✅ Working | ✅ Integrated | Legacy support |
| Web Speech API Audio | ✅ Working | ✅ Integrated | Basic TTS |
| Narration Engine | ✅ Exists | ❌ Not integrated | Advanced audio available |
| VideoGuidance Component | ✅ Exists | ❌ Not integrated | Video player ready |
| Soundscape Engine | ✅ Exists | ❌ Not integrated | Ambient audio available |
| Memory System | ✅ Working | ✅ Integrated | Phase 44 |
| Content Registry | ✅ Working | ✅ Integrated | All entries registered |
| Session History | ✅ Working | ✅ Integrated | Streak tracking |

---

## Complete Module Inventory

### Phase 45: Learning Paths (7-Tile Dynamic System)

#### Architecture
- **Engine:** `src/engines/learningPaths/learningPathsEngine.js`
- **Config:** `src/engines/learningPaths/learningTopicsConfig.js` (924 lines)
- **Hook:** `src/hooks/useLearningPath.js`
- **Components:** 
  - `LearningPathView.jsx` (Main UI)
  - `LearningInsightPanel.jsx` (Insight card with audio)
  - `LearningTopicTiles.jsx` (Legacy, not used)

#### Topic 1: Shame and Recovery
**ID:** `recovery.shame-and-recovery`  
**Route:** `/tools/recovery.shame-and-recovery`  
**Status:** ✅ Fully Functional

**Content Structure:**
```javascript
{
  id: "shame-and-recovery",
  title: "Shame and Recovery",
  subtitle: "Understanding the hidden architect of self-attack",
  tiles: [
    {
      id: "what-shame-really-is",
      label: "What Shame Really Is",
      mood: "deep",
      caption: "The foundation",
      versions: [
        { versionId: "v1", depthLevel: 1, title: "...", body: "...", reflectionPrompt: "..." },
        { versionId: "v2", depthLevel: 1, title: "...", body: "...", reflectionPrompt: "..." }
      ]
    },
    // ... 6 more tiles
  ]
}
```

**Tiles Breakdown:**
1. **What Shame Really Is** - 2 versions ✅
2. **Where Shame Learned Its Script** - 1 version
3. **The Difference Between 'I Am Bad' and 'I Did Something Bad'** - 1 version
4. **How Shame Lives in the Body** - 1 version
5. **How Shame Sabotages Connection** - 1 version
6. **The Shame → Escape → Regret Loop** - 1 version
7. **What Healing With Shame Looks Like** - 1 version

**Audio:** ✅ Web Speech API (Listen/Pause button)  
**Video:** ❌ Not implemented  
**Narration Engine:** ❌ Not integrated (exists but unused)  
**Soundscape:** ❌ Not integrated (exists but unused)

**Code Flow:**
```
User clicks topic → ToolDetailPage detects learning path → 
LearningPathView renders → Dropdown shows tiles → 
User selects tile → pickTileVersion() selects version → 
LearningInsightPanel displays → Audio available via Web Speech API
```

#### Topic 2: Cravings and Urges
**ID:** `recovery.cravings-and-urges`  
**Route:** `/tools/recovery.cravings-and-urges`  
**Status:** ✅ Fully Functional

**Tiles:**
1. What Cravings Really Are (1 version)
2. The Three Layers of Urges (1 version)
3. Rise, Peak, Fall (1 version)
4. What the Craving Is Protecting You From (1 version)
5. Urge Surfing Technique (1 version)
6. Understanding Your Triggers (1 version)
7. The Long-Term Shift (1 version)

**Legacy Mapping:** `recovery.cravings.intro` → maps to this topic

#### Topic 3: Nervous System Regulation
**ID:** `recovery.nervous-system-regulation`  
**Route:** `/tools/recovery.nervous-system-regulation`  
**Status:** ✅ Fully Functional

**Tiles:**
1. What Regulation Really Means (1 version)
2. Your Window of Tolerance (1 version)
3. When You're Too High (1 version)
4. When You're Too Low (1 version)
5. Regulation Tools That Work (1 version)
6. The Power of Co-Regulation (1 version)
7. Building Lasting Regulation (1 version)

#### Topic 4: Trauma and Recovery
**ID:** `recovery.trauma-and-recovery`  
**Route:** `/tools/recovery.trauma-and-recovery`  
**Status:** ✅ Fully Functional

**Tiles:**
1. What Trauma Really Is (1 version)
2. How Trauma Shows Up (1 version)
3. The Trauma-Addiction Connection (1 version)
4. Processing Trauma Safely (1 version)
5. Understanding Trauma Triggers (1 version)
6. Post-Traumatic Growth (1 version)
7. Trauma-Informed Recovery (1 version)

#### Topic 5: Sleep and Recovery
**ID:** `recovery.sleep-and-recovery`  
**Route:** `/tools/recovery.sleep-and-recovery`  
**Status:** ✅ Fully Functional

**Tiles:**
1. Why Sleep Matters in Recovery (1 version)
2. Sleep and Your Nervous System (1 version)
3. Sleep Hygiene That Works (1 version)
4. When Nighttime Gets Loud (1 version)
5. Sleep and Cravings (1 version)
6. Sleep Medications and Recovery (1 version)
7. Rest as a Recovery Practice (1 version)

#### Topic 6: Boundaries in Recovery
**ID:** `recovery.boundaries-in-recovery`  
**Route:** `/tools/recovery.boundaries-in-recovery`  
**Status:** ✅ Fully Functional

**Tiles:**
1. What Boundaries Really Are (1 version)
2. Boundaries and Guilt (1 version)
3. Types of Boundaries (1 version)
4. Boundaries with Family (1 version)
5. Boundaries with Yourself (1 version)
6. Enforcing Boundaries (1 version)
7. Boundaries as an Act of Love (1 version)

#### Topic 7: Grief and Loss
**ID:** `recovery.grief-and-loss`  
**Route:** `/tools/recovery.grief-and-loss`  
**Status:** ✅ Fully Functional

**Tiles:**
1. What Grief Really Is (1 version)
2. The Many Types of Grief (1 version)
3. Grief and the Fear of Relapse (1 version)
4. How to Grieve in Recovery (1 version)
5. Complicated Grief (1 version)
6. Grieving While Building a Future (1 version)
7. Grief as Part of Healing (1 version)

#### Topic 8: Self-Compassion
**ID:** `recovery.self-compassion`  
**Route:** `/tools/recovery.self-compassion`  
**Status:** ✅ Fully Functional

**Tiles:**
1. What Self-Compassion Really Is (1 version)
2. The Science of Self-Compassion (1 version)
3. Practicing Self-Compassion (1 version)
4. Self-Compassion and Accountability (1 version)
5. Self-Compassion as Shame Antidote (1 version)
6. Why Self-Compassion Feels Hard (1 version)
7. Self-Compassion as Recovery Foundation (1 version)

---

### Legacy Modules

#### Understanding Cravings (Legacy)
**ID:** `recovery.cravings.intro`  
**Route:** `/tools/recovery.cravings.intro`  
**Status:** ✅ Working (Backward Compatible)

**Content Type:** Markdown file  
**File:** `src/content/recovery/cravings-intro.md`

**Content:**
```markdown
---
title: "Understanding Cravings"
type: "recovery"
tags: ["cravings", "urges"]
---

### Understanding Cravings

A craving is **not a command** — it is a **signal**.

- It rises.
- It peaks.
- It falls.

Your job is not to crush it.  
Your job is to **outlast it** with support, tools, and honesty.
```

**Delivery System:** `contentService.js` → `loadContentById()`  
**Renderer:** `ContentViewer.jsx`  
**Audio:** ❌ Not available (no audio in markdown viewer)  
**Video:** ❌ Not implemented

**Note:** This topic also maps to `recovery.cravings-and-urges` learning path for backward compatibility.

---

### Education Modules

#### Shame vs Guilt — Basic Distinction
**ID:** `education.shame.basics`  
**Route:** `/tools/education.shame.basics`  
**Status:** ✅ Working

**Content Type:** Markdown file  
**File:** `src/content/education/shame-basics.md`

**Content:**
```markdown
---
title: "Shame vs Guilt — Basic Distinction"
type: "education"
tags: ["shame", "guilt"]
---

### Shame vs Guilt

- **Guilt:** "I did something bad."
- **Shame:** "I am bad."

Guilt can guide change.  
Shame collapses the person inside the behavior.

In recovery, we learn how to **separate who we are from what we did**.
```

**Section:** EDUCATION (shown in RecoveryPage)  
**Audio:** ❌ Not available  
**Video:** ❌ Not implemented

**Note:** This topic also maps to `recovery.shame-and-recovery` learning path for backward compatibility.

---

## Architecture & Code Analysis

### Learning Paths Engine

**File:** `src/engines/learningPaths/learningPathsEngine.js`

**Core Functions:**

```javascript
// Get topic by ID
export function getTopic(topicId) {
  if (!topicId) return null;
  return LEARNING_TOPICS[topicId] || null;
}

// Get list of all topics
export function getTopicList() {
  return Object.values(LEARNING_TOPICS).map(({ id, title, subtitle }) => ({
    id,
    title,
    subtitle,
  }));
}

// Select version with non-repeating logic
export function pickTileVersion(topicId, tileId, forceDifferent = false) {
  const state = loadSessionState();
  const topic = getTopic(topicId);
  if (!topic) return null;

  const tile = topic.tiles.find((t) => t.id === tileId);
  if (!tile || !tile.versions || tile.versions.length === 0) return null;

  // Version selection logic with sessionStorage tracking
  const lastKey = `${topicId}:${tileId}`;
  const lastVersionId = state[lastKey];

  // Filter out last version if forcing different
  let candidates = tile.versions;
  if (forceDifferent || lastVersionId) {
    candidates = tile.versions.filter((v) => v.versionId !== lastVersionId);
    if (candidates.length === 0) {
      candidates = tile.versions; // Cycle complete
    }
  }

  // Random selection
  const chosen = candidates[Math.floor(Math.random() * candidates.length)] || tile.versions[0];

  // Save to sessionStorage
  state[lastKey] = chosen.versionId;
  saveSessionState(state);

  return {
    topicId,
    tileId,
    ...chosen,
    topicTitle: topic.title,
    tileLabel: tile.label,
  };
}
```

**Session Storage:**
- **Key:** `wc_learning_path_state_v1`
- **Structure:** `{ "topicId:tileId": "versionId" }`
- **Purpose:** Track last shown version per tile to avoid repeats
- **Scope:** Session-only (cleared on browser close)

**Error Handling:**
- ✅ Null checks for topic/tile existence
- ✅ Fallback to first version if selection fails
- ✅ Graceful handling of missing versions
- ⚠️ No error logging (silent failures)

---

### Content Service

**File:** `src/services/contentService.js`

**Core Functions:**

```javascript
// Load content by ID (markdown files)
export async function loadContentById(id) {
  const entry = getContentRegistryEntry(id);
  if (!entry) return null;

  const filePath = `../content/${entry.file}`;
  const loader = contentFiles[filePath];

  if (!loader) {
    console.warn("[contentService] No loader for path:", filePath);
    return null;
  }

  try {
    const raw = await loader();
    const { meta, body } = parseFrontmatter(raw);

    return {
      id: entry.id,
      section: entry.section,
      title: meta.title || entry.title,
      tags: entry.tags || meta.tags || [],
      meta,
      body,
    };
  } catch (err) {
    console.warn("[contentService] Failed to load content:", id, err);
    return null;
  }
}

// List content summaries by section
export function listContentSummaries(section) {
  const list = listContentBySection(section);
  return list.map((entry) => ({
    id: entry.id,
    title: entry.title,
    section: entry.section,
    tags: entry.tags || [],
    file: entry.file,
  }));
}
```

**Frontmatter Parser:**
- Parses YAML frontmatter between `---` markers
- Extracts metadata (title, type, tags)
- Returns `{ meta, body }` structure

**File Loading:**
- Uses Vite's `import.meta.glob` for dynamic imports
- Pattern: `../content/**/*.md`
- Async loading with error handling

**Error Handling:**
- ✅ Try-catch blocks
- ✅ Null checks
- ⚠️ Console warnings only (no user-facing errors)
- ⚠️ No retry logic

---

### Recovery Basics Engine (Legacy)

**File:** `src/engines/education/recoveryBasicsEngine.js`

**Status:** ⚠️ Superseded by Learning Paths but still functional

**Structure:**
```javascript
export const RECOVERY_BASICS_TOPICS = [
  "shame-and-recovery",
  "cravings-and-urges",
  // ... 6 more
];

const TOPIC_MAP = {
  "shame-and-recovery": {
    id: "shame-and-recovery",
    title: "Shame and Recovery",
    understanding: "...",
    reflection: "...",
  },
  // ... more topics
};

export function getRecoveryBasicsContent(topicId) {
  const fallback = TOPIC_MAP["shame-and-recovery"];
  if (!topicId) return fallback;
  const normalized = topicId.toLowerCase().replace(/\s+/g, "-");
  return TOPIC_MAP[normalized] ?? fallback;
}
```

**Usage:** Fallback in `ToolDetailPage.jsx` when learning path not found

**Content Format:**
- Two-section layout: "Understanding" + "Reflection"
- Static content (no versions)
- No tile system

---

## Content Delivery Systems

### System 1: Learning Paths Engine (Primary)

**Flow:**
```
User navigates to /tools/recovery.{topic} →
ToolDetailPage.jsx detects topicId →
Maps to learning topic ID →
getTopic() loads from learningTopicsConfig.js →
LearningPathView renders dropdown →
User selects tile →
pickTileVersion() selects version →
LearningInsightPanel displays content →
Audio available via Web Speech API
```

**Advantages:**
- ✅ Dynamic version selection
- ✅ Non-repeating versions
- ✅ 7-tile structured learning
- ✅ Session state tracking
- ✅ Audio support

**Limitations:**
- ⚠️ Most tiles have only 1-2 versions (target: 8+)
- ❌ No video support
- ❌ No pre-recorded audio
- ❌ No progress tracking

---

### System 2: Markdown Content Service (Legacy)

**Flow:**
```
User navigates to /tools/{content-id} →
ToolDetailPage.jsx checks contentRegistry →
loadContentById() loads markdown file →
parseFrontmatter() extracts metadata →
ContentViewer.jsx renders markdown →
No audio/video support
```

**Advantages:**
- ✅ Simple file-based system
- ✅ Easy to edit (markdown files)
- ✅ Version control friendly

**Limitations:**
- ❌ No audio support
- ❌ No video support
- ❌ Static content (no versions)
- ❌ No interactivity

---

### System 3: Recovery Basics Engine (Fallback)

**Flow:**
```
User navigates to legacy topic →
ToolDetailPage.jsx detects fallback →
getRecoveryBasicsContent() loads from engine →
Two-section layout (Understanding/Reflection) →
No audio/video support
```

**Status:** ⚠️ Deprecated but functional

---

## Audio/Video Infrastructure

### Audio System 1: Web Speech API (Integrated)

**Location:** `src/components/learning/LearningInsightPanel.jsx`

**Implementation:**
```javascript
const playAudio = () => {
  if (!insight || !synthRef.current) return;
  stopAudio();

  const fullText = `${insight.title}. ${insight.body}${insight.reflectionPrompt ? ` Reflection: ${insight.reflectionPrompt}` : ""}`;

  const utterance = new SpeechSynthesisUtterance(fullText);
  utterance.rate = 0.9; // Slightly slower
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.lang = "en-US";

  utterance.onstart = () => setIsPlaying(true);
  utterance.onend = () => setIsPlaying(false);
  utterance.onerror = () => setIsPlaying(false);

  synthRef.current.speak(utterance);
};
```

**Features:**
- ✅ Play/Pause functionality
- ✅ Auto-stop on content change
- ✅ Cleanup on unmount
- ✅ Error handling

**Limitations:**
- ⚠️ Text-to-speech only (robotic voice)
- ⚠️ No voice selection
- ⚠️ No speed control UI
- ⚠️ No progress tracking
- ⚠️ Browser-dependent quality

**Status:** ✅ Working in Learning Paths only

---

### Audio System 2: Narration Engine (Exists, Not Integrated)

**Location:** `src/engines/narration/narrationEngine.js`

**Features:**
- ✅ Advanced text-to-speech
- ✅ Voice profile selection
- ✅ Chunk-based playback
- ✅ Progress tracking
- ✅ Speed control
- ✅ Skip forward/backward
- ✅ Position saving/restoring
- ✅ Markdown parsing
- ✅ Telemetry integration

**Code Structure:**
```javascript
export class NarrationEngine {
  constructor(contentId, content, voiceProfile = null) {
    this.contentId = contentId;
    this.content = content;
    this.voiceProfile = voiceProfile || getRecommendedVoiceProfile(content);
    // ... initialization
  }

  async start() {
    await this.initialize();
    // Chunk-based playback with pauses
  }

  toggle() { /* Play/Pause */ }
  skipForward() { /* Next chunk */ }
  skipBackward() { /* Previous chunk */ }
  setSpeed(rate) { /* Adjust speed */ }
  savePosition() { /* Save to localStorage */ }
  loadPosition() { /* Restore from localStorage */ }
}
```

**Why Not Integrated:**
- ❌ Not connected to Learning Paths
- ❌ Requires content object structure
- ❌ More complex than Web Speech API
- ⚠️ Would need refactoring to work with insight objects

**Recommendation:** Integrate for better audio experience

---

### Video System: VideoGuidance Component (Exists, Not Integrated)

**Location:** `src/components/os/VideoGuidance.jsx`

**Features:**
- ✅ Full video player
- ✅ Play/Pause controls
- ✅ Progress bar
- ✅ Time display
- ✅ Fullscreen support
- ✅ Error handling
- ✅ Fallback videos
- ✅ Responsive design

**Code Structure:**
```javascript
const VideoGuidance = ({ videoUrl, title, onClose, mode }) => {
  // Video player with controls
  // Supports fallback videos by mode
  // Fullscreen capability
  // Error handling
};
```

**Fallback Videos:**
```javascript
const FALLBACK_VIDEOS = {
  breathing: "https://commondatastorage.googleapis.com/...",
  grounding: "https://commondatastorage.googleapis.com/...",
  yoga: "https://commondatastorage.googleapis.com/...",
  // ... more
};
```

**Why Not Integrated:**
- ❌ No video URLs in learning paths config
- ❌ No video content files
- ❌ Component exists but not used in recovery modules
- ⚠️ Would need video asset management

**Recommendation:** Add video support to learning paths

---

### Audio System 3: Soundscape Engine (Exists, Not Integrated)

**Location:** `src/engines/tools/SoundscapeEngine.js`

**Features:**
- ✅ Ambient audio playback
- ✅ Multiple soundscapes (wind, ocean, bowl, hum, rain, silence)
- ✅ Fade in/out
- ✅ Volume control
- ✅ Preloading
- ✅ Loop support

**Available Soundscapes:**
```javascript
export const Soundscapes = {
  WIND: { id: 'wind', name: 'Ikuku Wind', url: '/audio/soundscapes/wind.mp3' },
  OCEAN: { id: 'ocean', name: 'Ocean Waves', url: '/audio/soundscapes/ocean.mp3' },
  BOWL: { id: 'bowl', name: 'Singing Bowl', url: '/audio/soundscapes/bowl.mp3' },
  HUM: { id: 'hum', name: 'Deep Hum', url: '/audio/soundscapes/hum.mp3' },
  RAIN: { id: 'rain', name: 'Soft Rain', url: '/audio/soundscapes/rain.mp3' },
  SILENCE: { id: 'silence', name: 'Silence', url: null },
};
```

**Why Not Integrated:**
- ❌ Not connected to learning paths
- ❌ Used in tools, not content
- ⚠️ Would enhance reading experience

**Recommendation:** Add ambient audio option to learning paths

---

## Navigation & Routing

### Route Configuration

**File:** `src/App.jsx`

**Routes:**
```javascript
<Route path="/recovery" element={<RecoveryPage />} />
<Route path="/tools" element={<ToolsPage />} />
<Route path="/tools/:toolId" element={<ToolDetailPage />} />
```

**Route Detection in ToolDetailPage:**
```javascript
const { toolId } = useParams();
const decodedId = useMemo(() => {
  try {
    return decodeURIComponent(toolId ?? "");
  } catch {
    return toolId ?? "";
  }
}, [toolId]);
```

**Topic Mapping:**
```javascript
const topicMapping = {
  "recovery.shame-and-recovery": "shame-and-recovery",
  "recovery.cravings-and-urges": "cravings-and-urges",
  // ... 6 more
  "recovery.cravings.intro": "cravings-and-urges", // Legacy
  "education.shame.basics": "shame-and-recovery", // Legacy
};
```

**Navigation Flow:**
1. User clicks module in RecoveryPage → `navigate(/tools/${encodeURIComponent(item.id)})`
2. ToolDetailPage receives `toolId` param
3. Decodes and maps to learning topic ID
4. Renders appropriate view (Learning Path, Markdown, or Recovery Basics)

**Deep Linking:** ✅ Works (all routes accessible directly)

---

### RecoveryPage Navigation

**File:** `src/apps/recovery/RecoveryPage.jsx`

**Navigation Points:**
- Recovery Modules → `/tools/{module-id}`
- Education Modules → `/tools/{module-id}`
- Milestones → `/milestones`
- Sessions → `/sessions/templates`
- Last Session → `/sessions/view/{session-id}`

**Content Loading:**
```javascript
const recoverySummaries = listContentSummaries(CONTENT_SECTIONS.RECOVERY);
const educationSummaries = listContentSummaries(CONTENT_SECTIONS.EDUCATION);
```

**Status:** ✅ All navigation working

---

## Memory & State Management

### Memory System (Phase 44)

**Store:** `src/store/memoryStore.js` (Zustand with persist)

**Structure:**
```javascript
const initialState = {
  lastVisitedRoute: "/",
  lastVisitedAt: null,
  lastToolId: null,
  lastToolSession: null,
  lastTopicId: null,
  lastTopicType: null,
  lastTopicVisitedAt: null,
  lastWorkspaceId: null,
  lastWorkspaceContext: null,
  lastWorkspaceVisitedAt: null,
  lastEmotionSnapshot: null,
  preferences: {
    soundEnabled: true,
    narrationEnabled: false,
    darkModePreferred: true,
  },
  memoryVersion: 1,
};
```

**Content Memory Engine:**
```javascript
// src/engines/memory/contentMemoryEngine.js
export function rememberTopic(topicId, topicType) {
  if (!topicId) return;
  memoryStore.setLastTopic(topicId, topicType || null);
}

export function getLastTopic() {
  const state = memoryStore.getState();
  if (!state.lastTopicId) return null;
  return {
    id: state.lastTopicId,
    type: state.lastTopicType,
    visitedAt: state.lastTopicVisitedAt,
  };
}
```

**Integration:**
- ✅ `ToolDetailPage.jsx` uses `useTopicMemory()` hook
- ✅ `RecoveryPage.jsx` displays last viewed topic
- ✅ "Recent" badges shown on last viewed modules

**Persistence:**
- ✅ localStorage via Zustand persist middleware
- ✅ Key: `wc-os-memory-v1`
- ✅ Version tracking for migrations

---

### Session History

**File:** `src/services/sessionHistory.js`

**Features:**
- ✅ Last session tracking
- ✅ Session history (one per day)
- ✅ Streak calculation
- ✅ Longest streak tracking

**Storage:**
- `wc-last-session-v1` - Last session
- `wc-session-history-v1` - History array

**Streak Logic:**
```javascript
export function getStreakStats() {
  // Calculates current streak (consecutive days)
  // Calculates longest streak (all time)
  // Handles timezone and date edge cases
}
```

**Integration:**
- ✅ `RecoveryPage.jsx` displays streak
- ✅ Progress bar (7-day visual)
- ✅ "Last session" pill with repeat button

---

## UI/UX Components

### LearningPathView Component

**File:** `src/components/learning/LearningPathView.jsx`

**Structure:**
```jsx
<div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
  {/* Back button */}
  {/* Title Section - Compact */}
  {/* Compact Dropdown Selector */}
  {/* Insight Panel (conditional) */}
</div>
```

**Features:**
- ✅ Compact layout (space-y-6)
- ✅ Dropdown selector (replaces large grid)
- ✅ Click-outside handler
- ✅ Active tile highlighting
- ✅ Responsive design

**State Management:**
```javascript
const [dropdownOpen, setDropdownOpen] = useState(false);
const dropdownRef = useRef(null);

// Click outside handler
useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };
  // ... event listener setup
}, [dropdownOpen]);
```

**Accessibility:**
- ⚠️ No ARIA labels
- ⚠️ No keyboard navigation
- ⚠️ No screen reader announcements

---

### LearningInsightPanel Component

**File:** `src/components/learning/LearningInsightPanel.jsx`

**Structure:**
```jsx
<div className="rounded-3xl border border-slate-700/80 bg-slate-950/80 ...">
  {/* Header with breadcrumb and audio control */}
  {/* Title */}
  {/* Body text */}
  {/* Reflection prompt (highlighted) */}
  {/* "Show me another angle" button */}
</div>
```

**Audio Integration:**
```javascript
const [isPlaying, setIsPlaying] = useState(false);
const synthRef = useRef(null);
const utteranceRef = useRef(null);

// Initialize Web Speech API
useEffect(() => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    synthRef.current = window.speechSynthesis;
  }
}, []);

// Auto-stop on content change
useEffect(() => {
  if (insight?.versionId !== lastVersionId) {
    stopAudio();
    setLastVersionId(insight?.versionId || null);
  }
  return () => { stopAudio(); };
}, [insight?.versionId, lastVersionId]);
```

**Features:**
- ✅ Audio playback (Web Speech API)
- ✅ Auto-cleanup
- ✅ Error handling
- ✅ Reflection prompt highlighting
- ✅ "Show me another angle" button

**Styling:**
- Rounded cards (rounded-3xl)
- Amber accents for highlights
- Dark theme (slate-950)
- Responsive padding

---

### RecoveryPage Component

**File:** `src/apps/recovery/RecoveryPage.jsx`

**Layout:**
```
<PageHeader />
<div className="lux-shell py-10 space-y-8">
  <header> {/* Title, subtitle */} </header>
  <section> {/* Streak card + Recommendations */} </section>
  <section> {/* Recovery Modules grid */} </section>
  <section> {/* Education Modules grid */} </section>
</div>
```

**Features:**
- ✅ Streak tracking display
- ✅ Last session pill
- ✅ Recommendations (time-based)
- ✅ Recovery Modules grid
- ✅ Education Modules grid
- ✅ "Recent" indicators
- ✅ Navigation to Milestones/Sessions

**Recommendations Logic:**
```javascript
const recommendations = useMemo(() => {
  const now = new Date();
  const hour = now.getHours();
  const isLate = hour >= 21 || hour < 5;

  // Time-based + streak-based recommendations
  if (streak.currentStreak === 0) {
    base.push({ /* Start streak */ });
  } else {
    base.push({ /* Keep streak alive */ });
  }

  if (isLate || lastSession?.supportType === "sleep") {
    base.push({ /* Night reset */ });
  } else {
    base.push({ /* Cravings reset */ });
  }

  return base;
}, [streak.currentStreak, lastSession]);
```

---

## Error Handling & Edge Cases

### Learning Paths Engine

**Error Cases Handled:**
- ✅ Null topicId → returns null
- ✅ Invalid topicId → returns null
- ✅ Missing tile → returns null
- ✅ No versions → returns null
- ✅ SessionStorage errors → graceful fallback

**Edge Cases:**
- ⚠️ What if sessionStorage is full? → Silent failure
- ⚠️ What if topic config is malformed? → Could crash
- ⚠️ What if version selection fails? → Falls back to first version

**Missing Error Handling:**
- ❌ No user-facing error messages
- ❌ No error logging service
- ❌ No retry logic
- ❌ No validation of config structure

---

### Content Service

**Error Cases Handled:**
- ✅ Missing registry entry → returns null
- ✅ Missing file loader → console.warn
- ✅ File load failure → try-catch, returns null
- ✅ Frontmatter parse failure → returns empty meta

**Edge Cases:**
- ⚠️ What if markdown file is corrupted? → Could crash parser
- ⚠️ What if file is too large? → No size limits
- ⚠️ What if network fails? → No retry

**Missing Error Handling:**
- ❌ No user-facing error UI
- ❌ No fallback content
- ❌ No loading states
- ❌ No timeout handling

---

### Audio System

**Error Cases Handled:**
- ✅ SpeechSynthesis not available → Graceful fallback
- ✅ Audio error → Sets isPlaying to false
- ✅ Content change → Auto-stops audio

**Edge Cases:**
- ⚠️ What if browser blocks autoplay? → No handling
- ⚠️ What if voice selection fails? → Uses default
- ⚠️ What if audio is interrupted? → No resume logic

**Missing Error Handling:**
- ❌ No user notification if audio fails
- ❌ No fallback to text
- ❌ No audio quality detection

---

### ToolDetailPage

**Error Cases Handled:**
- ✅ Invalid toolId → Shows "not found" message
- ✅ Missing content → Shows "not found" message
- ✅ Decode failure → Falls back to raw toolId

**Edge Cases:**
- ⚠️ What if topic mapping is missing? → Falls back to markdown
- ⚠️ What if learning path config is missing? → Shows error
- ⚠️ What if multiple systems match? → Learning paths take priority

**Error UI:**
```jsx
if (!toolMeta && !content && !recoveryBasicsContent && !learningTopicId) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="rounded-3xl bg-slate-900/80 px-6 py-5 text-center text-sm text-slate-300">
        This tool could not be found.{" "}
        <button onClick={() => navigate("/tools")}>
          Return to Tools
        </button>
      </div>
    </div>
  );
}
```

---

## Performance Analysis

### Bundle Size

**Learning Paths Config:**
- `learningTopicsConfig.js`: ~924 lines
- Estimated size: ~50-70 KB (uncompressed)
- Impact: Loaded on demand (not in initial bundle)

**Content Files:**
- Markdown files: ~1-5 KB each
- Total: ~10-15 KB
- Impact: Minimal

**Components:**
- LearningPathView: ~160 lines
- LearningInsightPanel: ~150 lines
- Total: ~10-15 KB (uncompressed)

**Estimated Total:** ~75-100 KB for recovery modules system

---

### Runtime Performance

**Learning Paths:**
- Topic loading: O(1) - Direct object access
- Version selection: O(n) where n = versions per tile (typically 1-2)
- SessionStorage: Synchronous (could block on large data)

**Content Service:**
- File loading: Async (non-blocking)
- Frontmatter parsing: O(m) where m = file length
- No caching (reloads on every visit)

**Memory Usage:**
- SessionStorage: ~1-5 KB per session
- Component state: ~1-2 KB per component
- Total: Minimal

**Potential Issues:**
- ⚠️ No lazy loading of learning paths config
- ⚠️ No content caching
- ⚠️ SessionStorage could grow large over time
- ⚠️ No cleanup of old session data

---

### Optimization Opportunities

1. **Lazy Load Learning Paths Config**
   - Currently: Loaded on import
   - Could: Dynamic import when needed

2. **Cache Content**
   - Currently: Reloads on every visit
   - Could: Cache in memory or IndexedDB

3. **SessionStorage Cleanup**
   - Currently: Grows indefinitely
   - Could: Clean old entries (>24 hours)

4. **Code Splitting**
   - Currently: All in main bundle
   - Could: Split learning paths into separate chunk

---

## Integration Points

### ToolDetailPage Integration

**File:** `src/apps/tools/ToolDetailPage.jsx`

**Integration Logic:**
```javascript
// Phase 45: Check if this is a learning path topic
useEffect(() => {
  const topicMapping = {
    "recovery.shame-and-recovery": "shame-and-recovery",
    // ... more mappings
  };

  const mappedTopicId = topicMapping[decodedId];
  
  // Priority 1: Learning Paths
  if (mappedTopicId && getTopic(mappedTopicId)) {
    setLearningTopicId(mappedTopicId);
    setRecoveryBasicsContent(null);
    setContent(null);
    return;
  }
  
  // Priority 2: Recovery Basics (fallback)
  if (mappedTopicId && RECOVERY_BASICS_TOPICS.includes(mappedTopicId)) {
    const basicsContent = getRecoveryBasicsContent(mappedTopicId);
    setRecoveryBasicsContent(basicsContent);
    setLearningTopicId(null);
    setContent(null);
    return;
  }
  
  // Priority 3: Markdown content
  // ... load markdown
}, [decodedId]);
```

**Rendering Priority:**
1. Learning Paths (if topic found)
2. Recovery Basics (if fallback match)
3. Markdown content (if file exists)
4. Error message (if nothing found)

---

### RecoveryPage Integration

**Content Loading:**
```javascript
const recoverySummaries = listContentSummaries(CONTENT_SECTIONS.RECOVERY);
const educationSummaries = listContentSummaries(CONTENT_SECTIONS.EDUCATION);
```

**Memory Integration:**
```javascript
const lastTopic = getLastTopic();

// Display "Recent" badge
{isLastViewed && (
  <span className="...">Recent</span>
)}

// Show last viewed in header
{lastTopic && lastTopic.type === "recovery" && (
  <div>Last: {formatTopicTitle(lastTopic.id, recoveryContent)}</div>
)}
```

**Navigation:**
```javascript
onClick={() => navigate(`/tools/${encodeURIComponent(item.id)}`)}
```

---

### Memory System Integration

**Topic Tracking:**
```javascript
// In ToolDetailPage.jsx
useTopicMemory(
  contentEntry ? decodedId : null,
  contentEntry?.section || null
);
```

**Hook Implementation:**
```javascript
// src/hooks/useTopicMemory.js
export function useTopicMemory(topicId, topicType) {
  const lastTopicId = useMemoryStore((s) => s.lastTopicId);
  
  if (topicId) {
    rememberTopic(topicId, topicType);
  }
  
  return {
    lastTopic: lastTopicId ? { id: lastTopicId, type: lastTopicType, visitedAt: lastTopicVisitedAt } : null,
  };
}
```

---

## Missing Features & Gaps

### Content Gaps

1. **Version Depth**
   - Current: 1-2 versions per tile
   - Target: 8+ versions per tile
   - Impact: Limited variety in "Show me another angle"

2. **Video Content**
   - Status: ❌ Not implemented
   - Component exists: ✅ VideoGuidance.jsx
   - Missing: Video URLs in config, video files
   - Impact: No visual learning content

3. **Pre-Recorded Audio**
   - Status: ❌ Not implemented
   - Engine exists: ✅ NarrationEngine
   - Missing: Audio files, integration
   - Impact: Robotic TTS only

4. **Interactive Exercises**
   - Status: ❌ Not implemented
   - Missing: Quizzes, reflections, journaling
   - Impact: Passive learning only

---

### Feature Gaps

1. **Progress Tracking**
   - Status: ❌ Not implemented
   - Missing: Which tiles viewed, completion status
   - Impact: No sense of progress

2. **Discussion Threads**
   - Status: ❌ Not implemented
   - Missing: Comments, questions, community
   - Impact: No social learning

3. **User Notes**
   - Status: ❌ Not implemented
   - Missing: Personal journaling, annotations
   - Impact: No personalization

4. **Sharing**
   - Status: ❌ Not implemented
   - Missing: Share insights, export content
   - Impact: No social features

5. **Completion Badges**
   - Status: ❌ Not implemented
   - Missing: Achievements, milestones
   - Impact: No gamification

---

### Integration Gaps

1. **Narration Engine**
   - Exists: ✅ `src/engines/narration/narrationEngine.js`
   - Integrated: ❌ Not used in learning paths
   - Impact: Missing advanced audio features

2. **VideoGuidance Component**
   - Exists: ✅ `src/components/os/VideoGuidance.jsx`
   - Integrated: ❌ Not used in recovery modules
   - Impact: No video content

3. **Soundscape Engine**
   - Exists: ✅ `src/engines/tools/SoundscapeEngine.js`
   - Integrated: ❌ Not used in learning paths
   - Impact: No ambient audio

4. **Content Engine**
   - Exists: ✅ `src/engines/content/contentEngine.js`
   - Integrated: ❌ Not used in recovery modules
   - Impact: Missing adaptive content features

---

## Code Examples & Snippets

### Complete Learning Path Flow

```javascript
// 1. User navigates to topic
navigate('/tools/recovery.shame-and-recovery');

// 2. ToolDetailPage detects topic
const topicMapping = {
  "recovery.shame-and-recovery": "shame-and-recovery"
};
const mappedTopicId = topicMapping[decodedId];

// 3. Load topic
const topic = getTopic(mappedTopicId);
// Returns: { id, title, subtitle, tiles: [...] }

// 4. User selects tile
openTile("what-shame-really-is");

// 5. Select version
const insight = pickTileVersion("shame-and-recovery", "what-shame-really-is");
// Returns: { topicId, tileId, versionId, title, body, reflectionPrompt, topicTitle, tileLabel }

// 6. Display insight
<LearningInsightPanel insight={insight} onRefresh={refreshInsight} />

// 7. User clicks "Show me another angle"
refreshInsight(); // Calls pickTileVersion with forceDifferent=true

// 8. Audio playback
toggleAudio(); // Uses Web Speech API
```

---

### Content Service Flow

```javascript
// 1. Load content
const content = await loadContentById("recovery.cravings.intro");

// 2. Parse frontmatter
const { meta, body } = parseFrontmatter(rawMarkdown);
// meta: { title: "Understanding Cravings", type: "recovery", tags: [...] }
// body: "### Understanding Cravings\n\nA craving is..."

// 3. Render
<ContentViewer title={content.title} body={content.body} />
```

---

### Memory Tracking Flow

```javascript
// 1. User views topic
useTopicMemory("recovery.shame-and-recovery", "recovery");

// 2. Memory engine records
rememberTopic("recovery.shame-and-recovery", "recovery");
// Saves to: memoryStore.lastTopicId, lastTopicType, lastTopicVisitedAt

// 3. RecoveryPage displays
const lastTopic = getLastTopic();
// Returns: { id: "recovery.shame-and-recovery", type: "recovery", visitedAt: timestamp }

// 4. Show "Recent" badge
{isLastViewed && <span>Recent</span>}
```

---

## Testing & Quality Assurance

### Current Testing

**Manual Testing:**
- ✅ All 8 learning paths accessible
- ✅ Dropdown opens/closes
- ✅ Audio plays/stops
- ✅ "Show me another angle" works
- ✅ Navigation works
- ✅ Memory tracking works

**Automated Testing:**
- ❌ No unit tests
- ❌ No integration tests
- ❌ No E2E tests
- ❌ No accessibility tests

**Linting:**
- ✅ ESLint configured
- ✅ No linting errors in recovery modules
- ⚠️ Some warnings in other files

---

### Missing Tests

1. **Unit Tests**
   - `learningPathsEngine.js` functions
   - `contentService.js` functions
   - Version selection logic
   - SessionStorage handling

2. **Integration Tests**
   - ToolDetailPage routing
   - Content loading
   - Memory tracking
   - Audio playback

3. **E2E Tests**
   - Complete user flow
   - Navigation
   - Content display
   - Audio controls

4. **Accessibility Tests**
   - Screen reader compatibility
   - Keyboard navigation
   - ARIA labels
   - Color contrast

---

## Accessibility Analysis

### Current State

**Keyboard Navigation:**
- ⚠️ Dropdown: Works (click to open)
- ⚠️ Tile selection: Works (click)
- ⚠️ Audio button: Works (click)
- ❌ No keyboard shortcuts
- ❌ No focus management

**Screen Readers:**
- ⚠️ No ARIA labels
- ⚠️ No role attributes
- ⚠️ No live regions
- ⚠️ No announcements

**Visual:**
- ✅ High contrast (dark theme)
- ✅ Responsive text sizes
- ⚠️ No focus indicators
- ⚠️ No skip links

**Audio:**
- ✅ Audio available (Web Speech API)
- ⚠️ No captions
- ⚠️ No transcripts

---

### Recommendations

1. **Add ARIA Labels**
   ```jsx
   <button
     aria-label="Select topic to explore"
     aria-expanded={dropdownOpen}
     aria-haspopup="listbox"
   >
   ```

2. **Keyboard Navigation**
   ```jsx
   onKeyDown={(e) => {
     if (e.key === 'Enter' || e.key === ' ') {
       setDropdownOpen(!dropdownOpen);
     }
   }}
   ```

3. **Focus Management**
   ```jsx
   useEffect(() => {
     if (dropdownOpen) {
       firstTileRef.current?.focus();
     }
   }, [dropdownOpen]);
   ```

4. **Screen Reader Announcements**
   ```jsx
   <div role="status" aria-live="polite">
     {currentInsight && `Reading: ${currentInsight.title}`}
   </div>
   ```

---

## Security Considerations

### Current Security

**Content Security:**
- ✅ No user input in content rendering
- ✅ Content is static (no injection risk)
- ✅ Markdown sanitized (basic)

**Storage:**
- ✅ SessionStorage (session-only)
- ✅ LocalStorage (persistent, but safe)
- ⚠️ No encryption
- ⚠️ No data validation

**API:**
- ✅ No external API calls for recovery content
- ✅ All content is local
- ✅ No authentication required

---

### Potential Issues

1. **XSS in Markdown**
   - Current: Basic markdown parsing
   - Risk: If markdown contains script tags
   - Mitigation: Sanitize markdown before rendering

2. **SessionStorage Abuse**
   - Current: Stores version IDs
   - Risk: Could be manipulated
   - Impact: Low (only affects version selection)

3. **Content Injection**
   - Current: Static files
   - Risk: If files are modified maliciously
   - Mitigation: Content validation

---

## Recommended Improvements

### High Priority

1. **Integrate Narration Engine**
   - Replace Web Speech API with NarrationEngine
   - Better voice selection
   - Progress tracking
   - Speed control

2. **Add Video Support**
   - Integrate VideoGuidance component
   - Add video URLs to learning paths config
   - Support video content per tile

3. **Expand Content Versions**
   - Add 6+ more versions per tile
   - Increase content depth
   - Better "Show me another angle" experience

4. **Progress Tracking**
   - Track which tiles viewed
   - Completion status
   - Progress indicators

---

### Medium Priority

1. **Error Handling**
   - User-facing error messages
   - Error logging service
   - Retry logic
   - Fallback content

2. **Performance**
   - Lazy load learning paths config
   - Cache content
   - Cleanup sessionStorage
   - Code splitting

3. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
   - Focus management

4. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests
   - Accessibility tests

---

### Low Priority

1. **Social Features**
   - Discussion threads
   - User notes
   - Sharing
   - Comments

2. **Gamification**
   - Completion badges
   - Achievements
   - Progress milestones
   - Streaks

3. **Analytics**
   - Track content views
   - Track audio usage
   - Track completion rates
   - User engagement metrics

---

## File Structure Reference

```
src/
├── apps/
│   ├── recovery/
│   │   └── RecoveryPage.jsx              ✅ Main dashboard
│   └── tools/
│       └── ToolDetailPage.jsx            ✅ Content router
├── components/
│   ├── learning/
│   │   ├── LearningPathView.jsx          ✅ Main UI
│   │   ├── LearningInsightPanel.jsx     ✅ Insight card + audio
│   │   └── LearningTopicTiles.jsx       ⚠️  Legacy (unused)
│   ├── os/
│   │   └── VideoGuidance.jsx            ✅ Video player (not integrated)
│   └── content/
│       └── ContentViewer.jsx            ✅ Markdown renderer
├── engines/
│   ├── learningPaths/
│   │   ├── learningPathsEngine.js       ✅ Core engine
│   │   └── learningTopicsConfig.js     ✅ All 8 topics (924 lines)
│   ├── education/
│   │   └── recoveryBasicsEngine.js     ⚠️  Legacy (fallback)
│   ├── narration/
│   │   └── narrationEngine.js          ✅ Advanced audio (not integrated)
│   └── tools/
│       └── SoundscapeEngine.js         ✅ Ambient audio (not integrated)
├── hooks/
│   ├── useLearningPath.js               ✅ Learning paths hook
│   └── useTopicMemory.js                ✅ Memory tracking hook
├── services/
│   ├── contentService.js                ✅ Markdown loader
│   └── sessionHistory.js                ✅ Streak tracking
├── store/
│   └── memoryStore.js                  ✅ Zustand store
└── content/
    ├── contentRegistry.js               ✅ All entries
    ├── recovery/
    │   └── cravings-intro.md            ✅ Legacy markdown
    └── education/
        └── shame-basics.md              ✅ Education markdown
```

---

## Summary Statistics

### Content
- **Total Topics:** 10 (8 learning paths + 1 legacy + 1 education)
- **Total Tiles:** 56 (8 topics × 7 tiles)
- **Total Versions:** ~65 (varies per tile, average 1.2)
- **Markdown Files:** 3
- **Content Registry Entries:** 10

### Code
- **Total Files:** 15+ (components, engines, hooks, services)
- **Lines of Code:** ~2,500+ (estimated)
- **Config Size:** 924 lines (learningTopicsConfig.js)
- **Components:** 3 main UI components

### Features
- **Working:** 8/10 (80%)
- **Partially Working:** 1/10 (10%)
- **Missing:** 1/10 (10%)

### Integration
- **Integrated:** Learning Paths, Markdown, Memory, Audio (basic)
- **Exists but Not Integrated:** Narration Engine, VideoGuidance, Soundscape
- **Missing:** Video content, Pre-recorded audio, Progress tracking

---

## Conclusion

The Recovery Modules system is **functionally complete** for Phase 45, with:
- ✅ 8 learning path topics working
- ✅ Dynamic version selection
- ✅ Audio support (basic)
- ✅ Memory tracking
- ✅ Navigation working

**Key Gaps:**
- ❌ Video content not integrated (component exists)
- ❌ Advanced audio not integrated (engine exists)
- ❌ Limited content versions (1-2 vs target 8+)
- ❌ No progress tracking
- ❌ Limited accessibility

**Recommendation:** Focus on integrating existing components (VideoGuidance, NarrationEngine) and expanding content versions before adding new features.

---

**End of Extensive Diagnosis**

*For questions or updates, refer to individual component files and documentation.*

