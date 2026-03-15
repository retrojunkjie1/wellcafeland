Architecture Overview

High-level boundaries
- `src/apps/`: Feature modules and page-level flows.
- `src/components/`: Reusable UI and composition components.
- `src/hooks/`: Custom React hooks.
- `src/layouts/`: Layout shells (OS layout and routing outlets).
- `src/lib/`: Shared utilities and API clients.
- `src/services/`: Service layer for data access and side effects.
- `src/stores/`: Zustand stores and global state.
- `src/context/`: React context providers.
- `src/telemetry/`: Telemetry utilities and tracking.
- `src/admin/`: Admin console UI and tooling.
- `src/agents/`: AI agent wrappers.

Major modules
- AI: `src/apps/ai/`, `src/ai/`, `src/agents/`
- Admin: `src/admin/`, `src/services/adminAccess.js`
- Auth: `src/apps/auth/`, `src/context/AuthContext.jsx`
- Telemetry: `src/telemetry/`, `src/services/telemetry.js`
- Theme: `src/hooks/useThemeEngine.js`, `src/config/`
