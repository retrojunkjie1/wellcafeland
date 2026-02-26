# AGENTS.md

Guidance for autonomous and human-assisted coding agents working in this repository.

## Mission

WellnessCafe OS is a healing-first platform. Every change should support:

- Emotional safety and non-judgmental user experience
- Clinical-quality clarity in recovery-focused features
- Stability, predictability, and low-regression engineering
- Compassionate language that avoids shame-inducing phrasing

Treat the product as a wellness sanctuary, not just an app. Preserve trust in every UI, data, and AI-related decision.

## Project Snapshot

- Framework: React 19 + Vite 7
- Language: JavaScript (ES modules; some TS files exist)
- Styling: Tailwind CSS v3.4.18 + PostCSS classic stack
- Router: React Router DOM v7
- State: Zustand
- Backend: Firebase (Firestore + Cloud Functions)

## Architecture Map

Primary app code lives in `src/`:

- `src/apps/` feature pages and flows
- `src/components/` reusable UI
- `src/hooks/` custom hooks
- `src/layouts/` layout scaffolding
- `src/lib/` utilities and API client
- `src/services/` service-layer logic
- `src/admin/` admin-only views
- `src/agents/` AI agent wrappers
- `functions/src/` Firebase Cloud Functions

## Required Coding Conventions

1. Use `@/` alias for `src/` imports.
2. Use functional React components and hooks.
3. Use `className`, never `class`.
4. Prefer Tailwind utility classes over ad-hoc CSS.
5. Use theme tokens (`bg-background`, `text-foreground`, `border-border`, etc.).
6. Keep dark mode compatibility via `dark:` variants and shared tokens.
7. Use named exports for hooks/utilities and default exports for components.
8. Keep components focused and single-purpose.

## Tailwind and Theme Rules

- This repo uses Tailwind v3 (not v4).
- Keep Tailwind config in CommonJS format (`module.exports`).
- Keep token definitions in `src/index.css` using CSS variables.
- Use opacity like `bg-white/[0.08]` rather than shorthand numeric opacity classes.

## Recovery-Sensitive Product Rules

When implementing copy, workflows, nudges, reminders, or AI responses:

- Use trauma-informed language (calm, supportive, non-accusatory).
- Avoid wording that implies blame, failure, or personal deficiency.
- Prefer "next best step" framing over binary success/failure framing.
- Assume users may be in acute stress; keep UI flows simple and low-friction.
- Guard against abrupt behavior changes that may break user trust.

## Safety and Reliability Expectations

- Handle async operations with `try/catch`.
- Show useful user-facing fallbacks on errors.
- Log technical context for debugging without leaking sensitive data.
- Preserve existing behavior unless a change is explicitly required.
- Minimize surface area of edits; avoid unrelated refactors.

## Agent Workflow Checklist

Before coding:

1. Read `.cursorrules` and this file.
2. Identify impacted modules and potential user risk.
3. Prefer smallest safe change that solves the task.

During coding:

1. Follow existing patterns in nearby files.
2. Add brief comments only where logic is non-obvious.
3. Keep naming clear and domain-appropriate.

Before finishing:

1. Run `npm run lint`.
2. Run targeted tests if present.
3. Verify key UX paths affected by the change.
4. Summarize risk, edge cases, and follow-ups in your handoff.

## Git Hygiene

- Use clear, scoped commit messages.
- Never commit build artifacts or secrets.
- Keep changes focused to the requested task.

## Priority When Rules Conflict

1. Direct user instruction
2. Repository-level rules in `.cursorrules`
3. This `AGENTS.md`
4. Local file conventions near edited code

