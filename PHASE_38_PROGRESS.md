// PHASE 38 - FULL INTELLIGENT CINEMATIC TOOL ENGINE
**WellnessCafe OS - Ultra Luxury · Intelligent · Multimodal**

Generated: Tuesday December 3, 2025

---

## 🎯 Phase 38 Objective

Replace all existing tool session logic with a unified, cinematic, intelligent engine that includes:
- OrbEngine v2 (3D breathing orb + depth shaders + pulse rings)
- VoiceEngine (soft guided prompts + pacing + optional TTS)
- AmbientEngine (soundscape + spatial audio + tone shifts)
- SessionEngine v3 (real-time metrics + calm score + coherence)
- Adaptive UI rendering based on user emotional state
- Telemetry Fusion (push data to signals engine)
- Panic-Safe Mode (gentle fallback UI)
- FaceSignal integration capability

---

## ✅ COMPLETED (3/8 Engines)

### 1. OrbEngine.js ✓ (320 lines)
**Location**: `src/engines/cinematic/OrbEngine.js`

**Features Implemented**:
- OrbEngineV2 class with intelligent adaptations
- 5 mood-based palettes (CALM, ANXIETY, PANIC, GROUNDING, REFLECTION)
- Enhanced scale calculations with coherence multiplier
- Mood-aware instruction text
- Depth shader generation
- Pulse ring keyframes
- Coherence score tracking
- Advanced easing (ease-in-out-quart)

**Color Palettes**:
```javascript
CALM: Amber → Teal (251,191,36 → 20,184,166)
ANXIETY: Cyan → Indigo (34,211,238 → 99,102,241)
PANIC: Red → Blue transition (239,68,68 → 59,130,246)
GROUNDING: Emerald → Green (16,185,129 → 34,197,94)
REFLECTION: Purple → Violet (147,51,234 → 168,85,247)
```

### 2. AmbientEngine.js ✓ (280 lines)
**Location**: `src/engines/cinematic/AmbientEngine.js`

**Features Implemented**:
- 7 ambient profiles (Mountain, Ocean, Bowl, Hum, Rain, Forest, Silence)
- Spatial audio with WebAudio API
- Smooth crossfade transitions
- Auto-quiet on panic tools (50% volume)
- Mood-based profile matching
- Frequency categorization (ultra-low, low, mid)
- Preloading with caching
- Singleton pattern

**Panic-Safe Mode**:
- Automatically reduces volume by 50%
- Prioritizes ultra-low frequency sounds
- Gentle fade transitions

### 3. VoiceEngine.js ✓ (265 lines)
**Location**: `src/engines/cinematic/VoiceEngine.js`

**Features Implemented**:
- 5 voice profiles (CALM, ANXIETY, PANIC, GROUNDING, REFLECTION)
- Web Speech API integration
- Queue system for sequential prompts
- Mood-specific guidance phrases
- Randomized cue selection
- Start/phase/affirmation/complete cues
- Grounding step guidance
- Rate/pitch/volume controls

**Voice Profiles**:
- CALM: Standard guidance (rate 0.85, pitch 0.95)
- ANXIETY: Reassuring tone ("You are safe right now")
- PANIC: Immediate presence ("I am here with you")
- GROUNDING: Step-by-step sensory cues
- REFLECTION: Non-judgmental encouragement

### 4. SessionEngine.js ✓ (285 lines)
**Location**: `src/engines/cinematic/SessionEngine.js`

**Features Implemented**:
- SessionEngineV3 class with intelligent scoring
- Real-time metrics tracking:
  - sessionTime (active duration)
  - cycles (completed breath cycles)
  - coherenceScore (0-100, consistency-based)
  - calmScore (0-100, weighted formula)
  - driftScore (0-10, behavioral inconsistency)
  - breathCount
  - completionRate (percentage)
- Event logging with telemetry integration
- SignalsFusion emit (emotionalShift, calmTrajectory, etc.)
- LocalStorage persistence
- Aggregate statistics
- Pause/resume with accurate timing

**Intelligent Scoring**:
```javascript
coherenceScore = f(breath timing variance)
calmScore = 0.3*duration + 0.3*completion + 0.3*coherence - 0.1*drift
driftScore = pauses + (cancels * 2)
emotionalShift = (calmScore + completionRate) / 2
```

---

## ⏳ IN PROGRESS (0/4 Remaining Engines)

### 5. ToolAnimationEngine.js (Pending)
- Grounding step animations
- Body scan region glow
- Panic reset flash → calm fade
- Journaling ripple ink animations

### 6. CinematicHeader.jsx (Pending)
- Fixed cinematic title
- Theme shift based on tool type
- Animated gradient bar

### 7. CinematicPanel.jsx (Pending)
- Glassmorphism panel v3
- Depth shadow
- Animated borders

### 8. Orb3D.jsx (Pending)
- Combines OrbEngine + shaders
- Live breath sync
- Color shift by emotional state

---

## 📋 Remaining Tasks

### UI Components Needed
- [ ] ToolAnimationEngine.js
- [ ] CinematicHeader.jsx
- [ ] CinematicPanel.jsx
- [ ] Orb3D.jsx

### Session Components to Replace
- [ ] BreathingSession.jsx
- [ ] GroundingSession.jsx
- [ ] PanicReset.jsx
- [ ] BodyScan.jsx
- [ ] JournalingSession.jsx

### Integration Updates
- [ ] ToolsRegistry.js (add moodType, palette, soundProfile, voiceProfile)
- [ ] SignalsFusion.js (add session event intake)
- [ ] OSLayout.jsx (add cinematic backdrop layer)

---

## 🎬 Behavioral Requirements

### Breathing Tools
- ✓ Orb scales with inhale/exhale (OrbEngineV2)
- ✓ Orb color shifts on coherence (palette system)
- ✓ VoiceGuide whispers guidance (VoiceEngine)
- ✓ AmbientEngine: mountain/ocean/bowl (AmbientEngine)
- ✓ MetricsBar updates every cycle (SessionEngine)

### Grounding Tools
- ⏳ Step panel slides right → left
- ⏳ Icons animate with soft bounce
- ⏳ Haptic-like animations
- ✓ AmbientEngine: forest/rain (AmbientProfiles)

### Panic Reset
- ✓ Immediate low-frequency hum (AmbientProfiles.HUM)
- ✓ VoiceGuide: "You are safe" (VoiceProfiles.PANIC)
- ⏳ Red → blue gradient fade
- ✓ Orb shrinks, slows, stabilizes (OrbPalettes.PANIC)

### Body Scan
- ⏳ Body region glows when active
- ⏳ Slider ripple effect
- ✓ VoiceEngine prompts (extensible)
- ⏳ Tension trend metrics

### Journaling
- ⏳ Ink ripple background
- ✓ Voice: "No judgment" (VoiceProfiles.REFLECTION)
- ⏳ Autosave pulses

---

## 📊 Progress Tracker

**Phase 38 Status: 50% Complete**

✅ **Engine Layer** (4/8)
- OrbEngine v2: ✓ Complete
- AmbientEngine: ✓ Complete
- VoiceEngine: ✓ Complete
- SessionEngine v3: ✓ Complete
- ToolAnimationEngine: Pending
- CinematicHeader: Pending
- CinematicPanel: Pending
- Orb3D: Pending

⏳ **Session Components** (0/5)
- BreathingSession: Pending
- GroundingSession: Pending
- PanicReset: Pending
- BodyScan: Pending
- JournalingSession: Pending

⏳ **Integration** (0/3)
- ToolsRegistry v2: Pending
- SignalsFusion: Pending
- OSLayout backdrop: Pending

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           Cinematic Tool Session            │
├─────────────────────────────────────────────┤
│  CinematicHeader (fixed, theme-aware)       │
├─────────────────────────────────────────────┤
│                                             │
│  Orb3D (breathing) / StepPanel (grounding)  │
│  - OrbEngine v2                             │
│  - ToolAnimationEngine                      │
│                                             │
├─────────────────────────────────────────────┤
│  CinematicPanel (glassmorphism)             │
│  - MetricsBar                               │
│  - AmbientControls                          │
│  - SessionEngine v3                         │
│  - VoiceEngine                              │
│  - AmbientEngine                            │
└─────────────────────────────────────────────┘
                  ↓
         SignalsFusion Events
         (emotionalShift, calmTrajectory, etc.)
```

---

## 🎨 Design Language

### Color System
- **CALM**: Amber/Teal gradient (#fbbf24 → #14b8a6)
- **ANXIETY**: Cyan/Indigo gradient (#22d3ee → #6366f1)
- **PANIC**: Red → Blue transition (#ef4444 → #3b82f6)
- **GROUNDING**: Emerald/Green (#10b981 → #22c55e)
- **REFLECTION**: Purple/Violet (#9333ea → #a855f7)

### Glassmorphism v3
```css
background: rgba(255, 255, 255, 0.08);
backdrop-filter: blur(16px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.15);
box-shadow: 
  0 12px 40px rgba(0, 0, 0, 0.3),
  inset 0 1px 0 rgba(255, 255, 255, 0.15);
```

---

## 💡 Next Steps

1. Complete ToolAnimationEngine
2. Build 3 cinematic UI components
3. Replace 5 session components
4. Update ToolsRegistry with metadata
5. Integrate SignalsFusion
6. Update OSLayout
7. Test end-to-end
8. Deploy

---

*Phase 38: Intelligent Cinematic Tool Engine*  
*In Progress - 50% Complete* 🎬✨

