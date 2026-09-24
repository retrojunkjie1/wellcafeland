// src/App.jsx

import React, { useEffect, Suspense, lazy } from "react";

import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import Loading from "./components/Loading";
import { RouteTracker } from "./components/routing/RouteTracker";

import { bootstrapMemory } from "./engines/memory/memoryOrchestrator";

import ExperienceShell from "./system/ExperienceShell";

const HomePage = lazy(() => import("./apps/core/HomePage"));
const DailyCheckInPage = lazy(() => import("./apps/core/DailyCheckInPage"));
const GuidedEntrySessionPage = lazy(() => import("./apps/core/GuidedEntrySessionPage"));
const ChatPage = lazy(() => import("./apps/chat/ChatPage"));
const LivingGuidePage = lazy(() => import("./apps/living/LivingGuidePage"));
const LivingGuidePageV3 = lazy(() => import("./apps/living/LivingGuidePageV3").then((module) => ({ default: module.LivingGuidePageV3 })));
const SequencePage = lazy(() => import("./apps/sequences/SequencePage"));
const AssistancePage = lazy(() => import("./apps/assistance/AssistancePage"));
const CommandConsolePage = lazy(() => import("./apps/command/CommandConsolePage"));
const WorkspacePage = lazy(() => import("./apps/workspace/WorkspacePage"));
const RealHelpWorkspace = lazy(() => import("./apps/workspace/RealHelpWorkspace"));
const GuidePage = lazy(() => import("./apps/guide/GuidePage"));
const ResourcesListPage = lazy(() => import("./apps/resources/ResourcesListPage"));
const ResourcesDetailPage = lazy(() => import("./apps/resources/ResourcesDetailPage"));

const RealHelpRedirect = () => {
  const { search } = useLocation();
  return <Navigate to={`/assistance${search || ""}`} replace />;
};

const DirectoryRedirect = () => {
  const { domain, id } = useParams();
  const { search } = useLocation();
  const q = new URLSearchParams(search);
  const domainFromQuery = q.get("domain");
  const typeParam = domain || domainFromQuery;
  const to = id ? `/resources/${encodeURIComponent(id)}` : (typeParam ? `/resources?type=${typeParam}` : "/resources");
  return <Navigate to={to} replace />;
};

const RecoveryPage = lazy(() => import("./apps/recovery/RecoveryPage"));
const MilestonesPage = lazy(() => import("./apps/milestones/MilestonesPage"));
const AgentsPage = lazy(() => import("./apps/agents/AgentsPage"));

const ToolsPage = lazy(() => import("./apps/tools/ToolsPageCinematic"));
const ToolsPageClassic = lazy(() => import("./apps/tools/ToolsPage"));
// Phase 61: Lazy-load luxury pages for better initial load performance
const ToolDetailPage = lazy(() => import("./apps/tools/ToolDetailPage"));
const ExplorePage = lazy(() => 
  import("./apps/explore/ExplorePage").then(module => ({ 
    default: module.ExplorePage 
  }))
);
const VoiceJournal = lazy(() => import("./apps/tools/VoiceJournal"));
const VoiceCheckIn = lazy(() => import("./apps/tools/VoiceCheckIn"));
const Grounding54321 = lazy(() => import("./apps/tools/Grounding54321"));

const ProvidersPage = lazy(() => import("./apps/providers/ProvidersPage"));
const ProviderDashboardPage = lazy(() => import("./apps/provider/ProviderDashboardPage"));
const ProviderClientsPage = lazy(() => import("./apps/provider/ProviderClientsPage"));
const ClientListPage = lazy(() => import("./apps/provider/ClientListPage"));
const ClientDetailPage = lazy(() => import("./apps/provider/ClientDetailPage"));
const ProviderMessagesPage = lazy(() => import("./apps/provider/ProviderMessagesPage"));
const ProviderSchedulePage = lazy(() => import("./apps/provider/ProviderSchedulePage"));
const ClinicalNoteEditor = lazy(() => import("./apps/provider/ClinicalNoteEditor"));
const CarePlanEditor = lazy(() => import("./apps/provider/CarePlanEditor"));
const ClientTimelinePage = lazy(() => import("./apps/providers/ClientTimelinePage"));

const DashboardPage = lazy(() => import("./apps/dashboard/DashboardPage"));
const ProfilePage = lazy(() => import("./apps/profile/ProfilePage"));
const SupportHubPage = lazy(() => import("./apps/support/SupportHubPage"));
const PreferencesPage = lazy(() => import("./apps/settings/PreferencesPage"));
const WellnessSettingsPage = lazy(() => import("./apps/settings/WellnessSettingsPage"));
const NotificationsSettingsPage = lazy(() => import("./apps/settings/NotificationsSettingsPage"));
const PrivacySettingsPage = lazy(() => import("./apps/settings/PrivacySettingsPage"));
const PrivacyPolicyPage = lazy(() => import("./apps/legal/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./apps/legal/TermsOfServicePage"));
const CookieNoticePage = lazy(() => import("./apps/legal/CookieNoticePage"));

const SessionsTemplatesPage = lazy(() => import("./apps/ai/SessionsTemplatesPage"));
const SessionTemplateDetailPage = lazy(() => import("./apps/ai/SessionTemplateDetailPage"));
const SessionPlayerPage = lazy(() => import("./apps/ai/SessionPlayerPage"));
const SessionViewerPage = lazy(() => import("./apps/ai/SessionViewerPage"));
const SessionComposerPage = lazy(() => import("./apps/ai/SessionComposerPage"));
const SessionPreviewPage = lazy(() => import("./apps/ai/SessionPreviewPage"));
const SessionsAdminPage = lazy(() => import("./apps/dashboard/SessionsAdminPage"));

const LoginPage = lazy(() => import("./apps/auth/LoginPage"));
const SignupPage = lazy(() => import("./apps/auth/SignupPage"));

const OnboardingPage = lazy(() => import("./apps/onboarding/OnboardingPage"));
const PlanStartPage = lazy(() => import("./apps/plan/PlanStartPage"));

const AdminConsolePage = lazy(() => import("./apps/dashboard/AdminConsolePage"));

const ThemeControlPanel = lazy(() => import("./admin/ThemeControlPanel"));
const TemplatesManagerPage = lazy(() => import("./apps/admin/TemplatesManagerPage"));
const OverseerConsoleUltra = lazy(() => import("./apps/overseer/OverseerConsoleUltra").then((module) => ({ default: module.OverseerConsoleUltra })));
const ContentStudioPage = lazy(() => import("./apps/admin/ContentStudioPage"));
const SeedDataPage = lazy(() => import("./apps/admin/SeedDataPage"));
import AdminRoute from "./components/AdminRoute";
import ToolRouteBoundary from "./components/system/ToolRouteBoundary";
import RequireAuth from "./components/routing/RequireAuth";
import RequireRole, { RequireAdmin } from "./components/routing/RequireRole";
import UnauthorizedPage from "./components/routing/UnauthorizedPage";
import { AdminGuard } from "./admin/AdminGuard";
import { AdminShell } from "./admin/AdminShell";
import { AdminPage } from "./admin/AdminPage";

// Phase 13: Social & Circles imports
const CirclesPage = lazy(() => import("./apps/circles/CirclesPage"));
const CircleDetailPage = lazy(() => import("./apps/circles/CircleDetailPage"));
const CircleThreadPage = lazy(() => import("./apps/circles/CircleThreadPage"));
const CircleThreadCreation = lazy(() => import("./apps/circles/CircleThreadCreation"));
const SocialFeedPage = lazy(() => import("./apps/social/SocialFeedPage"));
const DirectMessagePage = lazy(() => import("./apps/social/DirectMessagePage"));
const ConnectionsPage = lazy(() => import("./apps/social/ConnectionsPage"));

const App = () => {
  // Initialize memory system (PHASE 44)
  useEffect(() => {
    bootstrapMemory();
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950"><Loading message="Loading…" /></div>}>
        <RouteTracker />
        <Routes>
          {/* Preview - Standalone page, no layout */}
          <Route path="/preview/:token" element={<SessionPreviewPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          <Route element={<ExperienceShell />}>
            {/* OS Routes */}
            <Route path="/" element={<ChatPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/check-in" element={<DailyCheckInPage />} />
          <Route path="/session/:mode" element={<GuidedEntrySessionPage />} />
            <Route path="/explore" element={<ExplorePage />} />
          <Route path="/sequence/:id" element={<SequencePage />} />
          {/* Assistance — unified Find Help (housing, food, funding, programs, crisis) */}
          <Route path="/assistance" element={<RealHelpWorkspace />} />
          {/* Phase 70: Route unrouted AssistancePage */}
          <Route path="/assistance/request" element={<AssistancePage />} />
          <Route path="/command" element={<CommandConsolePage />} />
          <Route path="/workspace/real-help" element={<RealHelpRedirect />} />
          <Route path="/workspace/:id" element={<WorkspacePage />} />
          <Route path="/directory" element={<DirectoryRedirect />} />
          <Route path="/directory/:domain" element={<DirectoryRedirect />} />
          <Route path="/directory/:domain/:id" element={<DirectoryRedirect />} />
          <Route path="/resources" element={<ResourcesListPage />} />
          <Route path="/resources/:id" element={<ResourcesDetailPage />} />
          <Route path="/guide" element={<GuidePage />} />
          {/* Phase A1: Canonical /living route */}
          <Route path="/living" element={<LivingGuidePageV3 />} />
          <Route path="/living/v3" element={<Navigate to="/living" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/plan/start" element={<PlanStartPage />} />

          {/* Public Routes - Accessible in guest mode */}
          <Route path="/recovery" element={<RecoveryPage />} />
          <Route path="/milestones" element={<MilestonesPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/tools" element={<ToolRouteBoundary><ToolsPage /></ToolRouteBoundary>} />
          {/* Phase 70: Route classic ToolsPage */}
          <Route path="/tools/classic" element={<ToolRouteBoundary><ToolsPageClassic /></ToolRouteBoundary>} />
          <Route path="/tools/:toolId" element={<ToolRouteBoundary><ToolDetailPage /></ToolRouteBoundary>} />
          <Route path="/tools/voice-journal" element={<ToolRouteBoundary><VoiceJournal /></ToolRouteBoundary>} />
          <Route path="/tools/voice-checkin" element={<ToolRouteBoundary><VoiceCheckIn /></ToolRouteBoundary>} />
          <Route path="/tools/grounding/54321" element={<ToolRouteBoundary><Grounding54321 /></ToolRouteBoundary>} />
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
          {/* Phase 70: Route ClientListPage */}
          <Route
            path="/provider/clients/list"
            element={
              <RequireRole allowedRoles={["provider", "admin"]}>
                <ClientListPage />
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

          {/* Phase A1: Redirect /providers/* to canonical /provider/* */}
          <Route
            path="/providers"
            element={<Navigate to="/provider" replace />}
          />
          <Route
            path="/providers/dashboard"
            element={<Navigate to="/provider/dashboard" replace />}
          />
          <Route
            path="/providers/clients/:clientId"
            element={<Navigate to="/provider/clients/:clientId" replace />}
          />
          {/* Phase A1: Ensure timeline is under /provider, not /providers */}
          <Route
            path="/provider/clients/:clientId/timeline"
            element={
              <RequireAuth>
                <ClientTimelinePage />
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
            path="/admin/console"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <AdminConsolePage />
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
                  <Navigate to="/admin/console" replace />
                </RequireAdmin>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/overseer-ultra"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <AdminRoute>
                    <OverseerConsoleUltra />
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
          <Route
            path="/admin/seed"
            element={
              <RequireAuth>
                <RequireAdmin>
                  <AdminRoute>
                    <SeedDataPage />
                  </AdminRoute>
                </RequireAdmin>
              </RequireAuth>
            }
          />

          {/* Phase I: God-Eye Admin Dashboard - Parameterized routes must come LAST */}
          <Route path="/admin/:section" element={<AdminPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>

          <Route path="*" element={<UnauthorizedPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
