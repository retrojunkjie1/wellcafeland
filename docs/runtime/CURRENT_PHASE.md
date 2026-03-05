# WELLNESSCAFE — CURRENT PHASE

Status: Active Development  
Current Phase: **55A.2 — Control Surface Cleanup**  
Day: **Day 1**

--------------------------------------------------

## Today's focus
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

## Notes
- This file is the only daily edit point. Generator renders CURRENT_PHASE.md.

END OF FILE
