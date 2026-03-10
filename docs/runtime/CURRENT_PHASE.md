# WELLNESSCAFE — CURRENT PHASE

Active phase: **Phase 55 — Stabilization**  
Status: **55A.2 complete**; stabilization ongoing  
Current objective: Harden chat, voice, and experience surfaces; no regressions.

--------------------------------------------------

## Allowed work
- Bug fixes and stability for Phase 55A/B scope
- Voice/audio feedback and spoken guidance (Phase 56 Day 3 style)
- Verification script and manual checklist alignment
- Documentation and runbook updates

## Prohibited work
- New docks or duplicate bottom bars
- Auth gating for crisis/support access
- Large new features outside CURRENT_PHASE focus
- Removing or bypassing verification gates

--------------------------------------------------

## Verification expectations
- Phase verification scripts (e.g. phase55a:chatActions:verify, phase56.verify) must pass
- npm run dev must run without error
- Manual UI checklist in this file must pass before phase closeout

--------------------------------------------------

## Today's focus (reference)
- Enforce One Surface Rule across app routes
- Remove duplicate mic/tools/real-help surfaces
- Fix stacked docks / overlap and z-index order

--------------------------------------------------

## Verification
- npm run phase55a:chatActions:verify
- npm run dev

--------------------------------------------------

## Manual UI checklist
- Chat: only one mic surface; no duplicated Speak/Tools/Real Help controls
- Home/Explore/Daily/Directory/Tools/Crisis/Account: no duplicated action bars; nav does not stack with composer
- Tool overlays (breathing knob etc): close/back works and UI stack is correct

--------------------------------------------------

## Completion Evidence (Phase 55A.2 closeout)
- **Verification scripts:** `npm run phase55a:chatActions:verify` — PASS (all 11 checks: verify_script_exists, messagebubble_safe_handlers, truthful_thinking_timing_and_no_placeholders, safeLocalStorage_exists, grounding_suppression_storage_exists, support_fallback_exists, grounding_modal_exists, no_duplicate_dock, composer_presence_controls_present, experience_signal_parser_present, message_meta_video_referenced).
- **Manual checklist:** Confirmed in code: `/` and `/chat` use single bottom card (composer + nav), no UnifiedInteractionDock; `/home`, `/explore`, `/tools` show BottomRail with dock + nav aligned; `/tools/:toolId` has toolDetailRoute → no rail/nav/dock; Support routes to `/assistance` with no auth requirement.
- **Routes validated:** ExperienceShell gating (chatRoute, toolDetailRoute, showUnifiedDock, showBottomNav) and App.jsx routes for assistance, tools list, and tool detail.

--------------------------------------------------

## Notes
- Phase 55A.2 closed out. Tag: phase-55a2-complete.
- BottomRail slot-aware (Dock + Nav); chat = Nav only with single card (composer + nav).

END OF FILE
