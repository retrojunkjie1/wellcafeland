// src/App.jsx

import React, { useEffect, Suspense, lazy } from "react";

import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import Loading from "./components/Loading";
import { RouteTracker } from "./components/routing/RouteTracker";

import { bootstrapMemory } from "./engines/memory/memoryOrchestrator";

import OSLayout from "./layouts/OSLayout";

import HomePage from "./apps/core/HomePage";
import StabilizationEntryPage from "./apps/core/StabilizationEntryPage";
import ChatPage from "./apps/chat/ChatPage";
import LivingGuidePage from "./apps/living/LivingGuidePage";
// Phase 70: Route LivingGuidePageV3
import { LivingGuidePageV3 } from "./apps/living/LivingGuidePageV3";
import SequencePage from "./apps/sequences/SequencePage";
// Unified Assistance (real-world help — one page, action-first)
// Phase 70: Route unrouted pages
import AssistancePage from "./apps/assistance/AssistancePage";
import CommandConsolePage from "./apps/command/CommandConsolePage";
import WorkspacePage from "./apps/workspace/WorkspacePage";
import RealHelpWorkspace from "./apps/workspace/RealHelpWorkspace";
import GuidePage from "./apps/guide/GuidePage";
import ResourcesListPage from "./apps/resources/ResourcesListPage";
import ResourcesDetailPage from "./apps/resources/ResourcesDetailPage";

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

import RecoveryPage from "./apps/recovery/RecoveryPage";
import MilestonesPage from "./apps/milestones/MilestonesPage";
import AgentsPage from "./apps/agents/AgentsPage";

import ToolsPage from "./apps/tools/ToolsPageCinematic";
// Phase 70: Route classic ToolsPage
import ToolsPageClassic from "./apps/tools/ToolsPage";
// Phase 61: Lazy-load luxury pages for better initial load performance
const ToolDetailPage = lazy(() => import("./apps/tools/ToolDetailPage"));
const ExplorePage = lazy(() => 
  import("./apps/explore/ExplorePage").then(module => ({ 
    default: module.ExplorePage 
  }))
);
import VoiceJournal from "./apps/tools/VoiceJournal";
import VoiceCheckIn from "./apps/tools/VoiceCheckIn";
import BreathingToolPage from "./apps/tools/BreathingToolPage";

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
import PlanStartPage from "./apps/plan/PlanStartPage";

import AdminConsolePage from "./apps/dashboard/AdminConsolePage";

import ThemeControlPanel from "./admin/ThemeControlPanel";
import TemplatesManagerPage from "./apps/admin/TemplatesManagerPage";
import OverseerConsolePage from "./apps/admin/OverseerConsolePage";
import { OverseerConsoleUltra } from "./apps/overseer/OverseerConsoleUltra";
import ContentStudioPage from "./apps/admin/ContentStudioPage";
import SeedDataPage from "./apps/admin/SeedDataPage";
import AdminRoute from "./components/AdminRoute";
import RequireAuth from "./components/routing/RequireAuth";
import RequireRole, { RequireAdmin } from "./components/routing/RequireRole";
import AdminHubPage from "./apps/admin/AdminHubPage";
import UnauthorizedPage from "./components/routing/UnauthorizedPage";
import { RouteGuard } from "./os/RouteGuard";
import NotFound from "./os/NotFound";
import { AdminGuard } from "./admin/AdminGuard";
import { AdminShell } from "./admin/AdminShell";
import { AdminPage } from "./admin/AdminPage";

// Phase 13: Social & Circles imports
import CirclesPage from "./apps/circles/CirclesPage";
import CircleDetailPage from "./apps/circles/CircleDetailPage";
import CircleThreadPage from "./apps/circles/CircleThreadPage";
import CircleThreadCreation from "./apps/circles/CircleThreadCreation";
import SocialFeedPage from "./apps/social/SocialFeedPage";
import DirectMessagePage from "./apps/social/DirectMessagePage";
import ConnectionsPage from "./apps/social/ConnectionsPage";

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
          
          <Route element={<OSLayout />}>
            {/* OS Routes */}
            <Route path="/" element={<StabilizationEntryPage />} />
            <Route path="/chat" element={<RouteGuard routeKey="route:/chat"><ChatPage /></RouteGuard>} />
            <Route path="/home" element={<RouteGuard routeKey="route:/home"><HomePage /></RouteGuard>} />
            <Route path="/explore" element={<RouteGuard routeKey="route:/explore"><ExplorePage /></RouteGuard>} />
          <Route path="/sequence/:id" element={<SequencePage />} />
          {/* Assistance — unified Find Help (housing, food, funding, programs, crisis) */}
          <Route path="/assistance" element={<RouteGuard routeKey="route:/assistance"><RealHelpWorkspace /></RouteGuard>} />
          {/* Phase 70: Route unrouted AssistancePage */}
          <Route path="/assistance/request" element={<RouteGuard routeKey="route:/assistance/request"><AssistancePage /></RouteGuard>} />
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
          <Route path="/onboarding" element={<RouteGuard routeKey="route:/onboarding"><OnboardingPage /></RouteGuard>} />
          <Route path="/plan/start" element={<PlanStartPage />} />

          {/* Public Routes - Accessible in guest mode */}
          <Route path="/recovery" element={<RecoveryPage />} />
          <Route path="/milestones" element={<MilestonesPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          {/* Phase 52: Calm Reset breathing MVP */}
          <Route path="/tools/breathing" element={<RouteGuard routeKey="route:/tools/breathing"><BreathingToolPage /></RouteGuard>} />
          {/* Phase 70: Route classic ToolsPage */}
          <Route path="/tools/classic" element={<ToolsPageClassic />} />
          <Route path="/tools/:toolId" element={<RouteGuard routeKey="route:/tools/:toolId"><ToolDetailPage /></RouteGuard>} />
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

          {/* Phase 53C: Admin Hub — God-Eye, Overseer, Templates, Theme, Seed */}
          <Route path="/admin" element={<RequireAuth><RequireAdmin><AdminHubPage /></RequireAdmin></RequireAuth>} />
          {/* Admin sections (overview, warroom, etc.) */}
          <Route path="/admin/:section" element={<AdminPage />} />
        </Route>

          <Route path="*" element={<RouteGuard routeKey="route:*"><NotFound /></RouteGuard>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
