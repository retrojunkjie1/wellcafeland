# CURSOR MEMORY — WELLNESSCAFE SYSTEM CONTEXT

## Project
- **Name:** WellnessCafe
- **Repo:** `/Users/mouthcouture/wellnesscafe-os`
- **Domain:** `wellnesscafe.net`
- **Internal architecture name:** WellnessCafe OS
- **User-facing name:** **Your Guide**
- **Rule:** The term **"OS" must never appear in the user UI**.

## System purpose
WellnessCafe is a **voice-guided recovery sanctuary and crisis navigation network** for:
- emotional overwhelm, panic, trauma, isolation
- addiction recovery and relapse disruption
- real-world help routing (housing, shelter, food, treatment)
- provider connection (therapists, coaches, peers, community orgs)
- community support response (CSR)
- optional spiritual reflection (opt-in, non-coercive)

## Core UX rules
- **Not a text chatbot.** Must feel like a calm intelligent presence.
- **Primary:** voice + audio guidance + video guidance.
- **Secondary:** minimal text.
- Must remain usable even if **auth fails**, **AI fails**, or **connectivity is weak**.
- **Crisis/support must never be blocked by login.**

## Content depth tiers
Audio/video guidance supports multiple levels:
- **Level 1:** stabilization (30s–3min)
- **Level 2:** guided sessions (5–15min)
- **Level 3:** learning content (10–30min)
- **Level 4:** deep programs (30–60min)

## Compassion Engine (tone controller)
A policy/state machine controls tone and pacing.
Modes:
- Stabilize / Contain / Rebuild / Learn / Navigate
Guardrails:
- no shame/blame language
- no long explanations during distress
- stabilization action first when distress is high

## Recovery Timeline Engine (continuity over days)
Tracks signals across time:
- mood check-ins, cravings, sleep, tool usage, stress, relapse events
Builds a timeline that informs daily guidance and risk prevention.

## Experience Engine (action orchestration)
Interprets user input and attaches:
- tools + protocols
- audio/video guidance
- escalation/routing to providers or resources

## System architecture (major subsystems)
- User Sanctuary
- Experience Engine
- Compassion Engine
- Recovery Timeline Engine
- Context Memory Engine
- Provider Network
- CSR Response System
- Resource Intelligence Graph
- Governance Layer (Admin)
- Infrastructure

## User sanctuary sections
- Guide
- Daily Practice
- Recovery Tools
- Explore
- Directory
- Crisis Support
- Providers
- Account
- Spiritual Reflection (optional)

## Provider network
- provider signup + verification tiers
- profiles, booking, secure messaging, client routing

## CSR response system
- tickets for housing/food/transport/detox/community referrals
- case routing + follow-up + outreach workflows

## Governance layer (Admin / God view)
- **Command Center** (system health, alerts, active sessions)
- **Sentinel** (risk detection: suicide/overdose/panic crisis)
- **Seer** (pattern intelligence: relapse/sleep/stress trends)
- **Oracle** (AI orchestration policies + routing)
- **Spiritual Council** (opt-in content governance)

## Infrastructure
- React
- Firebase
- AI APIs (OpenAI)
- Voice APIs
- Video CDN / storage

## Development rules (locked phases)
Work proceeds in locked phases with:
- objective → tasks → verification script → manual test → pass gate
Avoid:
- duplicated UI controls
- architectural loops
- repeated implementations
Always move forward after verification passes.

## Current phase
- **Phase 55A — Chat Action Stabilization**
Goals:
- fix action handlers
- remove fake thinking messages
- grounding controls work
- support works without login
Next:
- 55A.2 Surface cleanup
- 55B Voice-first interaction
- 55C Video micro-guidance
- 55D Experience spine across pages
- 56 Experience Engine
- 57 Provider network
- 58 CSR system
- 59 Guide memory
- 60 Production hardening

## Coding style
- parentheses in arrow functions
- minimal spaces inside object braces
