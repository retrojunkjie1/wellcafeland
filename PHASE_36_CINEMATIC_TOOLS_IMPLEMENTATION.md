# Phase 36: Cinematic Tools Engine - Implementation Guide
**WellnessCafe OS - Hybrid Cinematic Aesthetic**

Generated: Tuesday December 3, 2025

---

## 🎬 System Overview

The Cinematic Tools Engine transforms the entire WellnessCafe tools experience with:
- **3D Breathing Orb** with synchronized animations
- **Ambient Soundscapes** with smooth audio fading
- **Voice Guidance** for breath coaching
- **Metrics Tracking** with wellness analytics
- **Glassmorphism UI** with cinematic aesthetics
- **Floating Particles** and gradient backgrounds

---

## ✅ Phase 1: Engine Modules COMPLETE

### 1. OrbEngine.js ✓
**Location**: `src/apps/tools/engine/OrbEngine.js`

**Features**:
- `OrbAnimationController` class for managing orb state
- Synchronized breath animations (inhale/hold/exhale/pause)
- Easing curves (ease-in-out-quart)
- Multiple themes (Calm, Focus, Release, Peace)
- CSS keyframes generation
- Real-time scale calculations
- Phase transition callbacks

**Key Classes**:
```javascript
OrbAnimationController
- start() / stop() / pause() / resume()
- advancePhase()
- setCallbacks({ onPhaseChange, onCycleComplete, onProgressUpdate })
- getState() // Returns current animation state
```

### 2. SoundscapeEngine.js ✓
**Location**: `src/apps/tools/engine/SoundscapeEngine.js`

**Features**:
- 6 soundscapes (Wind, Ocean, Bowl, Hum, Rain, Silence)
- Audio preloading with caching
- Smooth fade in/out (configurable duration)
- Volume control (0-1 range)
- Loop management
- No UI lag with async loading

**Key Classes**:
```javascript
SoundscapeEngine
- preload(soundscapes)
- play(soundscapeId, fadeDuration)
- stop(fadeDuration)
- pause() / resume()
- setVolume(volume)
- fadeVolume(from, to, duration)
```

**Usage**:
```javascript
import { getSoundscapeEngine } from '@/apps/tools/engine/SoundscapeEngine';

const audio = getSoundscapeEngine();
await audio.initialize();
await audio.play('wind', 2000); // Fade in over 2s
```

### 3. VoiceEngine.js ✓
**Location**: `src/apps/tools/engine/VoiceEngine.js`

**Features**:
- Browser speech synthesis integration
- Natural voice selection (prefers calming voices)
- Phase-specific guidance phrases
- Randomized phrase selection
- Volume, rate, pitch controls
- Begin/complete messages

**Breath Patterns**:
- `CALM_478` - 4-7-8 breathing
- `BOX` - Box breathing
- `CALM` - Gentle relaxation
- `IKUKU_WIND` - Flowing breath
- `COHERENCE` - Heart-mind alignment

**Key Classes**:
```javascript
VoiceEngine
- initialize()
- speak(text, options)
- speakPhaseGuidance(phase, pattern)
- speakBegin() / speakComplete()
- setEnabled(boolean)
- setVolume(volume)
```

### 4. MetricsEngine.js ✓
**Location**: `src/apps/tools/engine/MetricsEngine.js`

**Features**:
- Breath count tracking
- Coherence score calculation (consistency)
- Session duration tracking
- Calm effect score (weighted formula)
- Cycle completion tracking
- LocalStorage persistence
- Aggregate statistics

**Key Metrics**:
```javascript
{
  breathCount: number,
  coherenceScore: 0-100,
  sessionDuration: ms,
  calmEffectScore: 0-100,
  consistency: 0-100,
  completionRate: percentage,
  cyclesCompleted: number
}
```

**Key Classes**:
```javascript
MetricsEngine
- startSession(targetCycles)
- endSession()
- recordBreath(phaseType)
- recordCycle()
- getMetrics()
- saveSession(userId)
- static loadSessions(toolId, limit)
- static getAggregateStats(toolId)
```

---

## 📋 Phase 2: UI Components (TO IMPLEMENT)

### Required Components

#### 1. CinematicContainer.jsx
**Purpose**: Main container with cinematic backdrop

**Features**:
- Gradient background (amber/teal/purple blend)
- Floating particle animation
- Responsive layout
- Smooth transitions
- Theme-aware colors

**Structure**:
```jsx
<CinematicContainer theme="calm">
  <div className="gradient-backdrop" />
  <FloatingParticles count={30} />
  <div className="content-layer">
    {children}
  </div>
</CinematicContainer>
```

#### 2. GlassPanel.jsx
**Purpose**: Glassmorphism UI panels

**Features**:
- Blur backdrop (`backdrop-filter`)
- Subtle border glow
- Rounded corners
- Shadow layers
- Hover effects

**Variants**:
- Bottom sheet (mobile)
- Floating panel (desktop)
- Minimal header
- Control bar

#### 3. BeginScreen.jsx
**Purpose**: Pre-session configuration screen

**Features**:
- Pattern selector
- Soundscape selector
- Voice toggle
- Cycle count slider
- "Begin Session" CTA
- Fade-in animation

**Structure**:
```jsx
<BeginScreen
  onBegin={(config) => startSession(config)}
  patterns={BreathPatterns}
  soundscapes={Soundscapes}
/>
```

#### 4. OrbDisplay.jsx
**Purpose**: Animated 3D orb visualization

**Features**:
- Synchronized with breath pattern
- Multi-layer glow effects
- Light sweep animation
- Rotation effect
- Scale transitions
- Theme-based colors

**CSS Properties**:
```css
.orb {
  animation: 
    orbPulse ${duration}s cubic-bezier(0.77, 0, 0.175, 1) infinite,
    orbGlow ${duration}s ease-in-out infinite,
    orbRotate 60s linear infinite;
  background: radial-gradient(circle, var(--orb-primary), var(--orb-secondary));
  box-shadow: 0 0 60px var(--orb-glow);
  backdrop-filter: blur(40px);
}
```

#### 5. ControlBar.jsx
**Purpose**: Session controls

**Features**:
- Play/pause button
- Stop button
- Volume sliders (soundscape, voice)
- Breath pattern switcher
- Metrics display

#### 6. SessionSummary.jsx
**Purpose**: Post-session metrics display

**Features**:
- Animated metric cards
- Coherence visualization
- Calm effect badge
- Save to history button
- Share/export options

---

## 🎨 Cinematic Aesthetic Guidelines

### Color System

**Amber/Teal Hybrid** (Primary):
```css
--amber-400: #fbbf24;
--amber-500: #f59e0b;
--teal-400: #2dd4bf;
--teal-500: #14b8a6;
```

**Gradients**:
```css
/* Calm gradient */
background: linear-gradient(135deg, 
  rgba(251, 191, 36, 0.15) 0%, 
  rgba(20, 184, 166, 0.15) 50%,
  rgba(99, 102, 241, 0.15) 100%);

/* Orb gradient */
background: radial-gradient(circle, 
  rgba(251, 191, 36, 0.8), 
  rgba(20, 184, 166, 0.6));
```

### Typography

**Serif (Luxury)**:
```css
font-family: 'Playfair Display', 'Georgia', serif;
font-weight: 300-600;
letter-spacing: 0.02em;
```

**Sans-Serif (Geometric)**:
```css
font-family: 'Inter', 'SF Pro', system-ui;
font-weight: 400-700;
letter-spacing: 0.01em;
```

### Glassmorphism

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
```

### Animations

**Easing Curves**:
```css
--ease-in-out-quart: cubic-bezier(0.77, 0, 0.175, 1);
--ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1);
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
```

**Floating Particles**:
```css
@keyframes float {
  0%, 100% { 
    transform: translate(0, 0) scale(1); 
    opacity: 0.3;
  }
  50% { 
    transform: translate(20px, -30px) scale(1.2); 
    opacity: 0.6;
  }
}
```

---

## 🔧 Implementation Roadmap

### Step 1: Create UI Components (Next)
- [ ] CinematicContainer.jsx
- [ ] GlassPanel.jsx
- [ ] BeginScreen.jsx
- [ ] OrbDisplay.jsx
- [ ] ControlBar.jsx
- [ ] SessionSummary.jsx

### Step 2: Refactor Breathing Tool
- [ ] Import all engines
- [ ] Replace old UI with cinematic components
- [ ] Integrate orb animation
- [ ] Add soundscape controls
- [ ] Add voice guidance
- [ ] Add metrics tracking
- [ ] Test full experience

### Step 3: Apply to All Tools
- [ ] Grounding Tool
- [ ] Journaling Tool
- [ ] Urge Surfing Tool
- [ ] Body Scan Tool
- [ ] Cravings Tool
- [ ] Panic Reset Tool
- [ ] Emotion Regulator Tool
- [ ] Shame Release Tool
- [ ] Sleep Reset Tool

### Step 4: Unified Export
- [ ] Create `LuxuryToolsEngine` export
- [ ] Document all APIs
- [ ] Create developer guide
- [ ] Add usage examples

---

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│              CinematicContainer (UI Shell)               │
│  - Gradient backdrop + floating particles               │
│  - Responsive layout + theme management                 │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌──────────────────┐    ┌──────────────────┐
│   BeginScreen    │    │   Tool Session   │
│  - Config form   │───→│   - OrbDisplay   │
│  - Pattern sel.  │    │   - ControlBar   │
│  - Audio sel.    │    │   - GlassPanel   │
└──────────────────┘    └────────┬─────────┘
                                 │
                     ┌───────────┴───────────┐
                     ▼                       ▼
              ┌─────────────┐         ┌─────────────┐
              │   Engines   │         │   Metrics   │
              └─────────────┘         └─────────────┘
                     │                       │
      ┌──────────────┼──────────────┐       │
      ▼              ▼              ▼       ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│   Orb    │  │  Sound   │  │  Voice   │  │ Session  │
│ Engine   │  │ Engine   │  │ Engine   │  │   Data   │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## 💡 Usage Examples

### Basic Breathing Tool Integration

```javascript
import { OrbAnimationController, OrbThemes } from '@/apps/tools/engine/OrbEngine';
import { getSoundscapeEngine } from '@/apps/tools/engine/SoundscapeEngine';
import { getVoiceEngine } from '@/apps/tools/engine/VoiceEngine';
import { MetricsEngine } from '@/apps/tools/engine/MetricsEngine';

function CinematicBreathingTool() {
  const [orb, setOrb] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const audio = getSoundscapeEngine();
  const voice = getVoiceEngine();

  useEffect(() => {
    // Initialize orb
    const pattern = { inhale: 4, hold: 7, exhale: 8, pause: 0 };
    const orbController = new OrbAnimationController(pattern, OrbThemes.CALM);
    
    orbController.setCallbacks({
      onPhaseChange: (phase) => {
        voice.speakPhaseGuidance(phase, pattern);
        metrics.recordBreath(phase);
      },
      onCycleComplete: (count) => {
        metrics.recordCycle();
      },
    });

    setOrb(orbController);
    setMetrics(new MetricsEngine('breathing'));

    return () => {
      orbController.stop();
      audio.dispose();
      voice.dispose();
    };
  }, []);

  const handleBegin = async () => {
    await audio.play('wind', 2000);
    await voice.initialize();
    voice.speakBegin();
    metrics.startSession(5);
    orb.start();
  };

  return (
    <CinematicContainer theme="calm">
      <OrbDisplay controller={orb} />
      <ControlBar 
        onPlay={handleBegin}
        onPause={() => orb.pause()}
        onStop={() => orb.stop()}
      />
    </CinematicContainer>
  );
}
```

---

## ✅ Current Status

**Phase 36 Progress: 40%**

✅ **COMPLETE**:
- OrbEngine.js (410 lines)
- SoundscapeEngine.js (280 lines)
- VoiceEngine.js (235 lines)
- MetricsEngine.js (310 lines)

⏳ **IN PROGRESS**:
- UI Components (0/6)
- Tool Refactoring (0/9)

📋 **PENDING**:
- Integration testing
- Performance optimization
- Documentation completion

---

## 🎯 Success Criteria

- [ ] All 4 engines implemented ✅
- [ ] All 6 UI components created
- [ ] All 9 tools refactored
- [ ] Unified API exported
- [ ] Documentation complete
- [ ] Performance validated (<60fps)
- [ ] Accessibility tested
- [ ] Mobile responsive verified

---

*WellnessCafe OS - Cinematic Tools Engine*  
*Built for healing at scale with luxury aesthetics* 🏛️✨

