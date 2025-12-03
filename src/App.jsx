// src/App.jsx

import React from "react";

import {BrowserRouter, Routes, Route} from "react-router-dom";

import {useThemeEngine} from "./hooks/useThemeEngine";

import OSLayout from "./layouts/OSLayout";

import HomePage from "./apps/core/HomePage";
import ChatPage from "./apps/chat/ChatPage";
import ExplorePage from "./apps/explore/ExplorePage";
// Assistance Hub (real-world help)
import AssistanceHubPage from "./apps/assistance/AssistanceHubPage";
import CommandConsolePage from "./apps/command/CommandConsolePage";
import WorkspacePage from "./apps/workspace/WorkspacePage";
import RealHelpWorkspace from "./apps/workspace/RealHelpWorkspace";
import GuidePage from "./apps/guide/GuidePage";
import DirectoryWorkspace from "./apps/directory/DirectoryWorkspace";
import DirectoryDetailWorkspace from "./apps/directory/DirectoryDetailWorkspace";

import RecoveryPage from "./apps/recovery/RecoveryPage";
import MilestonesPage from "./apps/milestones/MilestonesPage";
import AgentsPage from "./apps/agents/AgentsPage";

import ToolsPage from "./apps/tools/ToolsPage";
import ToolDetailPage from "./apps/tools/ToolDetailPage";
import VoiceJournal from "./apps/tools/VoiceJournal";
import VoiceCheckIn from "./apps/tools/VoiceCheckIn";

import ProvidersPage from "./apps/providers/ProvidersPage";
import ProviderDashboardPage from "./apps/provider/ProviderDashboardPage";
import ProviderClientsPage from "./apps/provider/ProviderClientsPage";
import ClientListPage from "./apps/provider/ClientListPage";
import ClientDetailPage from "./apps/provider/ClientDetailPage";
import ProviderMessagesPage from "./apps/provider/ProviderMessagesPage";
import ProviderSchedulePage from "./apps/provider/ProviderSchedulePage";
import ClinicalNoteEditor from "./apps/provider/ClinicalNoteEditor";
import CarePlanEditor from "./apps/provider/CarePlanEditor";
import ClientTimelinePage from "./apps/providers/ClientTimelinePage";

import DashboardPage from "./apps/dashboard/DashboardPage";
import ProfilePage from "./apps/profile/ProfilePage";
import SupportHubPage from "./apps/support/SupportHubPage";
import PreferencesPage from "./apps/settings/PreferencesPage";
import WellnessSettingsPage from "./apps/settings/WellnessSettingsPage";
import NotificationsSettingsPage from "./apps/settings/NotificationsSettingsPage";
import PrivacySettingsPage from "./apps/settings/PrivacySettingsPage";
import PrivacyPolicyPage from "./apps/legal/PrivacyPolicyPage";
import TermsOfServicePage from "./apps/legal/TermsOfServicePage";
import CookieNoticePage from "./apps/legal/CookieNoticePage";

import SessionsTemplatesPage from "./apps/ai/SessionsTemplatesPage";
import SessionTemplateDetailPage from "./apps/ai/SessionTemplateDetailPage";
import SessionPlayerPage from "./apps/ai/SessionPlayerPage";
import SessionViewerPage from "./apps/ai/SessionViewerPage";
import SessionComposerPage from "./apps/ai/SessionComposerPage";
import SessionPreviewPage from "./apps/ai/SessionPreviewPage";
import SessionsAdminPage from "./apps/dashboard/SessionsAdminPage";

import LoginPage from "./apps/auth/LoginPage";

import SignupPage from "./apps/auth/SignupPage";

import OnboardingPage from "./apps/onboarding/OnboardingPage";

import AdminConsolePage from "./apps/dashboard/AdminConsolePage";

import ThemeControlPanel from "./admin/ThemeControlPanel";
import TemplatesManagerPage from "./apps/admin/TemplatesManagerPage";
import OverseerConsolePage from "./apps/admin/OverseerConsolePage";
import ContentStudioPage from "./apps/admin/ContentStudioPage";
import AdminRoute from "./components/AdminRoute";
import RequireAuth from "./components/routing/RequireAuth";
import RequireRole, { RequireAdmin } from "./components/routing/RequireRole";
import UnauthorizedPage from "./components/routing/UnauthorizedPage";

// Phase 13: Social & Circles imports
import CirclesPage from "./apps/circles/CirclesPage";
import CircleDetailPage from "./apps/circles/CircleDetailPage";
import CircleThreadPage from "./apps/circles/CircleThreadPage";
import CircleThreadCreation from "./apps/circles/CircleThreadCreation";
import SocialFeedPage from "./apps/social/SocialFeedPage";
import DirectMessagePage from "./apps/social/DirectMessagePage";
import ConnectionsPage from "./apps/social/ConnectionsPage";

const App = () => {
  // Initialize theme engine globally - this controls <html> theme classes
  useThemeEngine();

  return (
    <BrowserRouter>
      <Routes>
        {/* Preview - Standalone page, no layout */}
        <Route path="/preview/:token" element={<SessionPreviewPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        <Route element={<OSLayout />}>
          {/* OS Routes */}
          <Route path="/" element={<ChatPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/explore/:section" element={<ExplorePage />} />
          {/* Assistance Hub - Real-world help directory */}
          <Route path="/assistance" element={<AssistanceHubPage />} />
          <Route path="/command" element={<CommandConsolePage />} />
          <Route path="/workspace/:id" element={<WorkspacePage />} />
          <Route path="/workspace/real-help" element={<RealHelpWorkspace />} />
          <Route path="/directory" element={<DirectoryWorkspace />} />
          <Route path="/directory/:domain" element={<DirectoryWorkspace />} />
          <Route path="/directory/:domain/:id" element={<DirectoryDetailWorkspace />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Public Routes - Accessible in guest mode */}
          <Route path="/recovery" element={<RecoveryPage />} />
          <Route path="/milestones" element={<MilestonesPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/:toolId" element={<ToolDetailPage />} />
          <Route path="/tools/voice-journal" element={<VoiceJournal />} />
          <Route path="/tools/voice-checkin" element={<VoiceCheckIn />} />
          <Route path="/support" element={<SupportHubPage />} />
          <Route path="/circles" element={<CirclesPage />} />
          <Route path="/circles/:circleId" element={<CircleDetailPage />} />
          <Route path="/circles/:circleId/threads/new" element={<CircleThreadCreation />} />
          <Route path="/circles/:circleId/threads/:threadId" element={<CircleThreadPage />} />
          <Route path="/social/feed" element={<SocialFeedPage />} />
          <Route path="/social/dm" element={<DirectMessagePage />} />
          <Route path="/social/dm/:threadId" element={<DirectMessagePage />} />
          <Route path="/connections/friends" element={<ConnectionsPage type="friends" />} />
          <Route path="/connections/trusted" element={<ConnectionsPage type="trusted" />} />
          <Route path="/connections/blocked" element={<ConnectionsPage type="blocked" />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/cookies" element={<CookieNoticePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* User Settings Hub */}
          <Route path="/settings/preferences" element={<PreferencesPage />} />
          <Route path="/settings/wellness" element={<WellnessSettingsPage />} />
          <Route path="/settings/notifications" element={<NotificationsSettingsPage />} />
          <Route path="/settings/privacy" element={<PrivacySettingsPage />} />

          {/* Provider Routes - Phase 15 */}
          <Route
            path="/provider"
            element={
              <RequireRole allowedRoles={["provider", "admin"]}>
                <ProviderDashboardPage />
              </RequireRole>
            }
          />
          <Route
            path="/provider/dashboard"
            element={
              <RequireRole allowedRoles={["provider", "admin"]}>
                <ProviderDashboardPage />
              </RequireRole>
            }
          />
          <Route
            path="/provider/clients"
            element={
              <RequireRole allowedRoles={["provider", "admin"]}>
                <ProviderClientsPage />
              </RequireRole>
            }
          />
          <Route
            path="/provider/clients/:clientId"
            element={
              <RequireRole allowedRoles={["provider", "admin"]}>
                <ClientDetailPage />
              </RequireRole>
            }
          />
          <Route
            path="/provider/clients/:clientId/notes/new"
            element={
              <RequireRole allowedRoles={["provider", "admin"]}>
                <ClinicalNoteEditor />
              </RequireRole>
            }
          />
          <Route
            path="/provider/clients/:clientId/notes/:noteId"
            element={
              <RequireRole allowedRoles={["provider", "admin"]}>
                <ClinicalNoteEditor />
              </RequireRole>
            }
          />
          <Route
            path="/provider/clients/:clientId/care-plan/new"
            element={
              <RequireRole allowedRoles={["provider", "admin"]}>
                <CarePlanEditor />
              </RequireRole>
            }
          />
          <Route
            path="/provider/clients/:clientId/care-plan/:planId"
            element={
              <RequireRole allowedRoles={["provider", "admin"]}>
                <CarePlanEditor />
              </RequireRole>
            }
          />
          <Route
            path="/provider/messages"
            element={
              <RequireRole allowedRoles={["provider", "admin"]}>
                <ProviderMessagesPage />
              </RequireRole>
            }
          />
          <Route
            path="/provider/schedule"
            element={
              <RequireRole allowedRoles={["provider", "admin"]}>
                <ProviderSchedulePage />
              </RequireRole>
            }
          />

          {/* Provider/Admin Routes - Hidden from public nav, accessible via direct URL */}
          <Route
            path="/providers"
            element={
              <RequireAuth>
                <RequireRole allowedRoles={["provider", "admin", "superadmin"]}>
                  <ProvidersPage />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/provider/clients/:clientId/timeline"
            element={
              <RequireAuth>
                <ClientTimelinePage />
              </RequireAuth>
            }
          />
          <Route
            path="/providers/dashboard"
            element={
              <RequireAuth>
                <RequireRole allowedRoles={["provider", "admin", "superadmin"]}>
                  <ProviderDashboardPage />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/providers/clients/:clientId"
            element={
              <RequireAuth>
                <RequireRole allowedRoles={["provider", "admin", "superadmin"]}>
                  <ClientDetailPage />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/sessions/templates"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <SessionsTemplatesPage />
                </RequireAdmin>
              </RequireAuth>
            }
          />
          <Route
            path="/sessions/templates/:id"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <SessionTemplateDetailPage />
                </RequireAdmin>
              </RequireAuth>
            }
          />
          <Route
            path="/sessions/view/:id"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <SessionViewerPage />
                </RequireAdmin>
              </RequireAuth>
            }
          />
          <Route
            path="/sessions/templates/new"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <SessionComposerPage />
                </RequireAdmin>
              </RequireAuth>
            }
          />

          {/* Admin/Superadmin Routes - Hidden from public nav, accessible via direct URL */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <AdminRoute>
                    <AdminConsolePage />
                  </AdminRoute>
                </RequireAdmin>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/theme"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <AdminRoute>
                    <ThemeControlPanel />
                  </AdminRoute>
                </RequireAdmin>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/templates"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <AdminRoute>
                    <TemplatesManagerPage />
                  </AdminRoute>
                </RequireAdmin>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/sessions"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <AdminRoute>
                    <SessionsAdminPage />
                  </AdminRoute>
                </RequireAdmin>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/overseer"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <AdminRoute>
                    <OverseerConsolePage />
                  </AdminRoute>
                </RequireAdmin>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/content"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <AdminRoute>
                    <ContentStudioPage />
                  </AdminRoute>
                </RequireAdmin>
              </RequireAuth>
            }
          />
        </Route>

        <Route path="*" element={<UnauthorizedPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
