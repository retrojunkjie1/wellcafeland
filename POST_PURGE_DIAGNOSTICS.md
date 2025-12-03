# WellnessCafe OS Post-Purge Diagnostics
Generated: Tue Dec  2 12:33:34 MST 2025

## 📝 Build Output
```

> wellnesscafe-os@0.0.0 build
> vite build

vite v7.2.2 building client environment for production...
transforming...
The glob option "as" has been deprecated in favour of "query". Please update `as: 'raw'` to `query: '?raw', import: 'default'`.
✓ 1978 modules transformed.
rendering chunks...
[plugin vite:reporter] 
(!) /Users/mouthcouture/wellnesscafe-os/src/services/multimodalClient.js is dynamically imported by /Users/mouthcouture/wellnesscafe-os/src/apps/tools/VoiceJournal.jsx but also statically imported by /Users/mouthcouture/wellnesscafe-os/src/apps/guide/GuidePage.jsx, /Users/mouthcouture/wellnesscafe-os/src/apps/tools/VoiceCheckIn.jsx, /Users/mouthcouture/wellnesscafe-os/src/apps/tools/VoiceJournal.jsx, /Users/mouthcouture/wellnesscafe-os/src/apps/tools/modules/EducationModule.jsx, /Users/mouthcouture/wellnesscafe-os/src/apps/workspace/VoiceSessionWorkspace.jsx, /Users/mouthcouture/wellnesscafe-os/src/components/os/ChatPanel.jsx, /Users/mouthcouture/wellnesscafe-os/src/components/os/VoiceResponse.jsx, /Users/mouthcouture/wellnesscafe-os/src/services/aiModeration.js, dynamic import will not move module into another chunk.

[plugin vite:reporter] 
(!) /Users/mouthcouture/wellnesscafe-os/src/services/resourceSearch.js is dynamically imported by /Users/mouthcouture/wellnesscafe-os/src/services/directoryService.js but also statically imported by /Users/mouthcouture/wellnesscafe-os/src/apps/directory/DirectoryWorkspace.jsx, /Users/mouthcouture/wellnesscafe-os/src/apps/workspace/RealHelpWorkspace.jsx, /Users/mouthcouture/wellnesscafe-os/src/components/interaction/modules/SupportSearchModule.jsx, /Users/mouthcouture/wellnesscafe-os/src/components/os/ChatPanel.jsx, dynamic import will not move module into another chunk.

[plugin vite:reporter] 
(!) /Users/mouthcouture/wellnesscafe-os/src/ai/human/identityModel.js is dynamically imported by /Users/mouthcouture/wellnesscafe-os/src/components/os/ChatPanel.jsx, /Users/mouthcouture/wellnesscafe-os/src/components/os/ChatPanel.jsx but also statically imported by /Users/mouthcouture/wellnesscafe-os/src/core/system/intelligenceEngine.js, dynamic import will not move module into another chunk.

[plugin vite:reporter] 
(!) /Users/mouthcouture/wellnesscafe-os/src/core/system/intelligenceEngine.js is dynamically imported by /Users/mouthcouture/wellnesscafe-os/src/services/multimodalClient.js, /Users/mouthcouture/wellnesscafe-os/src/services/multimodalClient.js, /Users/mouthcouture/wellnesscafe-os/src/services/multimodalClient.js, /Users/mouthcouture/wellnesscafe-os/src/services/resourceSearch.js, /Users/mouthcouture/wellnesscafe-os/src/services/resourceSearch.js but also statically imported by /Users/mouthcouture/wellnesscafe-os/src/ai/fusion/fusionEngine.js, /Users/mouthcouture/wellnesscafe-os/src/components/os/ChatPanel.jsx, /Users/mouthcouture/wellnesscafe-os/src/core/system/patternEngine.js, dynamic import will not move module into another chunk.

[plugin vite:reporter] 
(!) /Users/mouthcouture/wellnesscafe-os/src/services/housingService.js is dynamically imported by /Users/mouthcouture/wellnesscafe-os/src/services/directoryService.js but also statically imported by /Users/mouthcouture/wellnesscafe-os/src/apps/workspace/RealHelpWorkspace.jsx, dynamic import will not move module into another chunk.

[plugin vite:reporter] 
(!) /Users/mouthcouture/wellnesscafe-os/src/services/grantsService.js is dynamically imported by /Users/mouthcouture/wellnesscafe-os/src/services/directoryService.js but also statically imported by /Users/mouthcouture/wellnesscafe-os/src/apps/workspace/RealHelpWorkspace.jsx, dynamic import will not move module into another chunk.

[plugin vite:reporter] 
(!) /Users/mouthcouture/wellnesscafe-os/src/services/supportProgramsService.js is dynamically imported by /Users/mouthcouture/wellnesscafe-os/src/services/directoryService.js but also statically imported by /Users/mouthcouture/wellnesscafe-os/src/apps/workspace/RealHelpWorkspace.jsx, dynamic import will not move module into another chunk.

[plugin vite:reporter] 
(!) /Users/mouthcouture/wellnesscafe-os/src/services/circlesService.js is dynamically imported by /Users/mouthcouture/wellnesscafe-os/src/services/directoryService.js but also statically imported by /Users/mouthcouture/wellnesscafe-os/src/apps/circles/CircleDetailPage.jsx, /Users/mouthcouture/wellnesscafe-os/src/apps/circles/CircleThreadCreation.jsx, /Users/mouthcouture/wellnesscafe-os/src/apps/circles/CircleThreadPage.jsx, /Users/mouthcouture/wellnesscafe-os/src/apps/circles/CirclesPage.jsx, /Users/mouthcouture/wellnesscafe-os/src/apps/provider/ProviderSocialInsights.jsx, /Users/mouthcouture/wellnesscafe-os/src/apps/workspace/RealHelpWorkspace.jsx, dynamic import will not move module into another chunk.

[plugin vite:reporter] 
(!) /Users/mouthcouture/wellnesscafe-os/src/apps/circles/CircleThreadPage.jsx is dynamically imported by /Users/mouthcouture/wellnesscafe-os/src/apps/workspace/WorkspacePage.jsx but also statically imported by /Users/mouthcouture/wellnesscafe-os/src/App.jsx, dynamic import will not move module into another chunk.

[plugin vite:reporter] 
(!) /Users/mouthcouture/wellnesscafe-os/src/apps/social/SocialFeedPage.jsx is dynamically imported by /Users/mouthcouture/wellnesscafe-os/src/apps/workspace/WorkspacePage.jsx but also statically imported by /Users/mouthcouture/wellnesscafe-os/src/App.jsx, dynamic import will not move module into another chunk.

[plugin vite:reporter] 
(!) /Users/mouthcouture/wellnesscafe-os/src/apps/social/DirectMessagePage.jsx is dynamically imported by /Users/mouthcouture/wellnesscafe-os/src/apps/workspace/WorkspacePage.jsx but also statically imported by /Users/mouthcouture/wellnesscafe-os/src/App.jsx, dynamic import will not move module into another chunk.

computing gzip size...
dist/index.html                                    0.40 kB │ gzip:   0.27 kB
dist/assets/index-CLivYpdY.css                    63.08 kB │ gzip:  11.41 kB
dist/assets/cravings-intro-Do7N32jy.js             0.34 kB │ gzip:   0.24 kB
dist/assets/shame-basics-B-fG0506.js               0.36 kB │ gzip:   0.26 kB
dist/assets/grounding-54321-BYSIMRtG.js            0.46 kB │ gzip:   0.29 kB
dist/assets/realhelp-start-n_AvWMbJ.js             0.50 kB │ gzip:   0.34 kB
dist/assets/breathing-basic1-DQAgdbYw.js           0.65 kB │ gzip:   0.41 kB
dist/assets/profileService-BxwF3MWM.js             1.08 kB │ gzip:   0.51 kB
dist/assets/aiModeration-BPYHwt0b.js               1.73 kB │ gzip:   0.87 kB
dist/assets/systemMemory-BsRTgL_U.js               2.23 kB │ gzip:   0.66 kB
dist/assets/emotionSensor-CgK0Lwnx.js              2.63 kB │ gzip:   1.15 kB
dist/assets/VoiceSessionWorkspace-DlnHwzY_.js      7.50 kB │ gzip:   2.60 kB
dist/assets/index-GgEwLAm-.js                  1,309.69 kB │ gzip: 364.20 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 7.87s
```

## 🧹 Lint Output
```
(node:3205) ESLintIgnoreWarning: The ".eslintignore" file is no longer supported. Switch to using the "ignores" property in "eslint.config.js": https://eslint.org/docs/latest/use/configure/migration-guide#ignoring-files
(Use `node --trace-warnings ...` to show where the warning was created)

/Users/mouthcouture/wellnesscafe-os/src/apps/providers/ProviderDashboardPage.jsx
  35:5  warning  Unused eslint-disable directive (no problems were reported from 'react-hooks/exhaustive-deps')

/Users/mouthcouture/wellnesscafe-os/src/apps/social/ConnectionsPage.jsx
  21:6  warning  React Hook useEffect has a missing dependency: 'loadConnections'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/mouthcouture/wellnesscafe-os/src/apps/social/DirectMessagePage.jsx
  24:6  warning  React Hook useEffect has a missing dependency: 'loadThreads'. Either include it or remove the dependency array   react-hooks/exhaustive-deps
  33:6  warning  React Hook useEffect has a missing dependency: 'loadMessages'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/mouthcouture/wellnesscafe-os/src/apps/tools/ToolDetailPage.jsx
  41:7  error  Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
* Update external systems with the latest state from React.
* Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

  39 |   useEffect(() => {
  40 |     if (isContentId) {
> 41 |       setContentLoading(true);
     |       ^^^^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect
  42 |       loadContentById(decodedToolId).then((loaded) => {
  43 |         setContent(loaded);
  44 |         setContentLoading(false);  react-hooks/set-state-in-effect

/Users/mouthcouture/wellnesscafe-os/src/apps/tools/ToolsPage.jsx
  21:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
* Update external systems with the latest state from React.
* Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

  19 |     trackPageView("tools");
  20 |     const summaries = listContentSummaries(CONTENT_SECTIONS.TOOLS);
> 21 |     setToolContent(summaries);
     |     ^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect
  22 |   }, []);
  23 |
  24 |   const filteredTools = useMemo(  react-hooks/set-state-in-effect

/Users/mouthcouture/wellnesscafe-os/src/apps/tools/VoiceJournal.jsx
  14:10  error  'audioBlob' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars

/Users/mouthcouture/wellnesscafe-os/src/apps/tools/modules/BodyScanTool.jsx
  68:27  error  'maxTension' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars
  77:26  error  'minTension' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars

/Users/mouthcouture/wellnesscafe-os/src/apps/tools/modules/BreathingTool.jsx
  8:10  error  'useSessionIdentity' is defined but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars

/Users/mouthcouture/wellnesscafe-os/src/apps/tools/modules/JournalingTool.jsx
  4:27  error  'useEffect' is defined but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars
  6:30  error  'query' is defined but never used. Allowed unused vars must match /^[A-Z_]/u      no-unused-vars
  6:37  error  'where' is defined but never used. Allowed unused vars must match /^[A-Z_]/u      no-unused-vars
  6:44  error  'getDocs' is defined but never used. Allowed unused vars must match /^[A-Z_]/u    no-unused-vars
  6:53  error  'orderBy' is defined but never used. Allowed unused vars must match /^[A-Z_]/u    no-unused-vars
  6:62  error  'limit' is defined but never used. Allowed unused vars must match /^[A-Z_]/u      no-unused-vars

/Users/mouthcouture/wellnesscafe-os/src/apps/workspace/RealHelpWorkspace.jsx
  21:11  error    'closeWorkspace' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u               no-unused-vars
  37:6   warning  React Hook useEffect has a missing dependency: 'loadData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/mouthcouture/wellnesscafe-os/src/apps/workspace/VoiceSessionWorkspace.jsx
  36:6  warning  React Hook useEffect has a missing dependency: 'handleProcessAudio'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/Users/mouthcouture/wellnesscafe-os/src/core/architecture/osAlignment.js
  141:17  error  Unreachable code  no-unreachable
  164:17  error  Unreachable code  no-unreachable

/Users/mouthcouture/wellnesscafe-os/src/core/system/behavioralDriftEngine.js
  169:11  error  'heavyModes' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars

/Users/mouthcouture/wellnesscafe-os/src/core/system/faceSignal.js
  177:11  error  'eyeAvgBrightness' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars
  243:9   error  'avgContrast' is assigned a value but never used. Allowed unused vars must match /^[A-Z_]/u       no-unused-vars

/Users/mouthcouture/wellnesscafe-os/src/core/system/intelligenceEngine.js
   6:33  error  'analyzeMessageEmotion' is defined but never used. Allowed unused vars must match /^[A-Z_]/u      no-unused-vars
   6:56  error  'detectTriggerDomains' is defined but never used. Allowed unused vars must match /^[A-Z_]/u       no-unused-vars
   9:10  error  'evaluateMessageRisk' is defined but never used. Allowed unused vars must match /^[A-Z_]/u        no-unused-vars
  11:34  error  'buildIdentitySnapshot' is defined but never used. Allowed unused vars must match /^[A-Z_]/u      no-unused-vars
  12:38  error  'buildRelationshipSnapshot' is defined but never used. Allowed unused vars must match /^[A-Z_]/u  no-unused-vars

/Users/mouthcouture/wellnesscafe-os/src/firebase/firebaseConfig.js
   6:11  error  'process' is not defined  no-undef
   7:15  error  'process' is not defined  no-undef
   8:14  error  'process' is not defined  no-undef
   9:18  error  'process' is not defined  no-undef
  10:22  error  'process' is not defined  no-undef
  11:10  error  'process' is not defined  no-undef
  12:18  error  'process' is not defined  no-undef

✖ 36 problems (30 errors, 6 warnings)
  0 errors and 1 warning potentially fixable with the `--fix` option.

```
