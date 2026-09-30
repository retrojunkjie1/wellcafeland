// src/App.jsx

import React, { useEffect, Suspense, lazy } from "react";

import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import Loading from "./components/Loading";
import { RouteTracker } from "./components/routing/RouteTracker";

import { bootstrapMemory } from "./engines/memory/memoryOrchestrator";
import { getAssistanceEntry } from "./apps/assistance/assistanceRoute";

import ExperienceShell from "./system/ExperienceShell";

const HomePage = lazy(() => import("./apps/core/HomePage"));
const ClientSessionsPage = lazy(() => import("./apps/core/ClientSessionsPage"));
const VideoSessionRoomPage = lazy(() => import("./apps/core/VideoSessionRoomPage"));
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
const RecoveryMeetingsPage = lazy(() => import("./apps/assistance/RecoveryMeetingsPage"));
const RecoveryMeetingSourcePage = lazy(() => import("./apps/recovery/RecoveryMeetingSourcePage"));
const RecoveryMeetingSourcesAdminPage = lazy(() => import("./apps/admin/RecoveryMeetingSourcesPage"));
const HelpDirectoryAdminPage = lazy(() => import("./apps/admin/HelpDirectoryPage"));
const MeetingDirectoryPolicyPage = lazy(() => import("./apps/legal/MeetingDirectoryPolicyPage"));
const CommunityGivingPage = lazy(() => import("./apps/assistance/CommunityGivingPage"));
const AssistanceHubPage = lazy(() => import("./apps/assistance/AssistanceHubPage"));
const GuidePage = lazy(() => import("./apps/guide/GuidePage"));
const ResourcesListPage = lazy(() => import("./apps/resources/ResourcesListPage"));
const ResourcesDetailPage = lazy(() => import("./apps/resources/ResourcesDetailPage"));

const RealHelpRedirect = () => {
  const { search } = useLocation();
  return <Navigate to={`/assistance${search || ""}`} replace />;
};

const AssistanceRoute = () => {
  const { search } = useLocation();
  const entry = getAssistanceEntry(search);
  if (entry === "meetings") {
    return <Navigate to="/recovery/meetings" replace />;
  }
  // A general “find help” entry should let the person choose a need first.
  // Only open the results workspace directly when the link carries intent.
  if (entry === "hub") {
    return <AssistanceHubPage />;
  }
  return <RealHelpWorkspace />;
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

const ProviderClientRedirect = () => {
  const { clientId } = useParams();
  return <Navigate to={clientId ? `/provider/clients/${encodeURIComponent(clientId)}` : "/provider/clients"} replace />;
};

const RecoveryPage = lazy(() => import("./apps/recovery/RecoveryPage"));
const RecoveryStoriesPage = lazy(() => import("./apps/recovery/RecoveryStoriesPage"));
const MilestonesPage = lazy(() => import("./apps/milestones/MilestonesPage"));
const AgentsPage = lazy(() => import("./apps/agents/AgentsPage"));

const ToolsPage = lazy(() => import("./apps/tools/ToolsPageCinematic"));
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
const PractitionerPortalPage = lazy(() => import("./apps/provider/PractitionerPortalPage"));
const ProviderDashboardPage = lazy(() => import("./apps/provider/ProviderDashboardPage"));
const ProviderClientsPage = lazy(() => import("./apps/provider/ProviderClientsPage"));
const ClientDetailPage = lazy(() => import("./apps/provider/ClientDetailPage"));
const ProviderMessagesPage = lazy(() => import("./apps/provider/ProviderMessagesPage"));
const MyPractitionerMessagesPage = lazy(() => import("./apps/provider/MyPractitionerMessagesPage"));
const ProviderSchedulePage = lazy(() => import("./apps/provider/ProviderSchedulePage"));

const DashboardPage = lazy(() => import("./apps/dashboard/DashboardPage"));
const ProfilePage = lazy(() => import("./apps/profile/ProfilePage"));
const SupportHubPage = lazy(() => import("./apps/support/SupportHubPage"));
const PreferencesPage = lazy(() => import("./apps/settings/PreferencesPage"));
const WellnessSettingsPage = lazy(() => import("./apps/settings/WellnessSettingsPage"));
const NotificationsSettingsPage = lazy(() => import("./apps/settings/NotificationsSettingsPage"));
const PrivacySettingsPage = lazy(() => import("./apps/settings/PrivacySettingsPage"));
const PractitionerSharingPage = lazy(() => import("./apps/settings/PractitionerSharingPage"));
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
const VerifyEmailPage = lazy(() => import("./apps/auth/VerifyEmailPage"));

const OnboardingPage = lazy(() => import("./apps/onboarding/OnboardingPage"));
const PlanStartPage = lazy(() => import("./apps/plan/PlanStartPage"));

const AdminConsolePage = lazy(() => import("./apps/dashboard/AdminConsolePage"));
const AdminWorkspaceAccessPage = lazy(() => import("./apps/admin/AdminWorkspaceAccessPage"));

const ThemeControlPanel = lazy(() => import("./admin/ThemeControlPanel"));
const TemplatesManagerPage = lazy(() => import("./apps/admin/TemplatesManagerPage"));
const OverseerConsoleUltra = lazy(() => import("./apps/overseer/OverseerConsoleUltra").then((module) => ({ default: module.OverseerConsoleUltra })));
const ContentStudioPage = lazy(() => import("./apps/admin/ContentStudioPage"));
const SeedDataPage = lazy(() => import("./apps/admin/SeedDataPage"));
import AdminRoute from "./components/AdminRoute";
import ToolRouteBoundary from "./components/system/ToolRouteBoundary";
import RequireAuth from "./components/routing/RequireAuth";
import RequireRole, { RequireAdmin } from "./components/routing/RequireRole";
import WorkspaceLandingPage from "./components/routing/WorkspaceLandingPage";
import UnauthorizedPage from "./components/routing/UnauthorizedPage";
import AdminAccessPage from "./components/routing/AdminAccessPage";
import { AdminGuard } from "./admin/AdminGuard";
import { AdminShell } from "./admin/AdminShell";
import { AdminPage } from "./admin/AdminPage";
import GodEyeConsoleEntry from "./components/routing/GodEyeConsoleEntry";

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
          <Route path="/admin/access" element={<AdminAccessPage />} />
          
          <Route element={<ExperienceShell />}>
            {/* OS Routes */}
            <Route path="/" element={<WorkspaceLandingPage guestFallback={<ChatPage />} />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/home" element={<HomePage />} />
          <Route path="/my-sessions" element={<ClientSessionsPage />} />
          <Route path="/sessions/:appointmentId/video" element={<RequireAuth><VideoSessionRoomPage /></RequireAuth>} />
            <Route path="/check-in" element={<DailyCheckInPage />} />
          <Route path="/session/:mode" element={<GuidedEntrySessionPage />} />
            <Route path="/explore" element={<ExplorePage />} />
          <Route path="/sequence/:id" element={<SequencePage />} />
          {/* Assistance — unified Find Help (housing, food, funding, programs, crisis) */}
          <Route path="/assistance" element={<AssistanceRoute />} />
          <Route path="/recovery/meetings" element={<RecoveryMeetingsPage />} />
          <Route path="/recovery/meetings/share-source" element={<RecoveryMeetingSourcePage />} />
          <Route path="/policies/meeting-directory" element={<MeetingDirectoryPolicyPage />} />
          <Route path="/assistance/community" element={<CommunityGivingPage />} />
          <Route path="/giver" element={<CommunityGivingPage initialMode="give" />} />
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
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/plan/start" element={<PlanStartPage />} />

          {/* Public Routes - Accessible in guest mode */}
          <Route path="/recovery" element={<RecoveryPage />} />
          <Route path="/recovery/stories" element={<RecoveryStoriesPage />} />
          <Route path="/milestones" element={<MilestonesPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/tools" element={<ToolRouteBoundary><ToolsPage /></ToolRouteBoundary>} />
          <Route path="/tools/classic" element={<Navigate to="/tools" replace />} />
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
          <Route path="/settings/practitioner-sharing" element={<RequireAuth><PractitionerSharingPage /></RequireAuth>} />

          {/* Provider Routes - Phase 15 */}
          <Route
            path="/provider"
            element={
              <RequireAuth><PractitionerPortalPage /></RequireAuth>
            }
          />
          <Route path="/provider/apply" element={<RequireAuth><PractitionerPortalPage /></RequireAuth>} />
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
          {/* Legacy list URLs point to the current authorized connection list. */}
          <Route
            path="/provider/clients/list"
            element={<Navigate to="/provider/clients" replace />}
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
            element={<Navigate to="/provider/clients" replace />}
          />
          <Route
            path="/provider/clients/:clientId/notes/:noteId"
            element={<Navigate to="/provider/clients" replace />}
          />
          <Route
            path="/provider/clients/:clientId/care-plan/new"
            element={<Navigate to="/provider/clients" replace />}
          />
          <Route
            path="/provider/clients/:clientId/care-plan/:planId"
            element={<Navigate to="/provider/clients" replace />}
          />
          <Route
            path="/provider/messages"
            element={
              <RequireRole allowedRoles={["provider", "admin"]}>
                <ProviderMessagesPage />
              </RequireRole>
            }
          />
          <Route path="/my-practitioner-messages" element={<RequireAuth><MyPractitionerMessagesPage /></RequireAuth>} />
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
            element={<ProvidersPage />}
          />
          <Route path="/providers/apply" element={<Navigate to="/provider" replace />} />
          <Route
            path="/providers/dashboard"
            element={<Navigate to="/provider/dashboard" replace />}
          />
          <Route
            path="/providers/clients/:clientId"
            element={<ProviderClientRedirect />}
          />
          {/* Legacy client routes now land on the consent-scoped practitioner view. */}
          <Route
            path="/provider/clients/:clientId/timeline"
            element={<RequireRole allowedRoles={["provider", "admin"]}><ProviderClientRedirect /></RequireRole>}
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
                <RequireAdmin redirectTo="/admin/access">
                  <GodEyeConsoleEntry><AdminConsolePage /></GodEyeConsoleEntry>
                </RequireAdmin>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/user-access"
            element={
              <RequireAuth>
                <RequireAdmin redirectTo="/admin/access">
                  <AdminWorkspaceAccessPage />
                </RequireAdmin>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/recovery-meeting-sources"
            element={
              <RequireAuth>
                <RequireAdmin redirectTo="/admin/access">
                  <RecoveryMeetingSourcesAdminPage />
                </RequireAdmin>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/help-directory"
            element={
              <RequireAuth>
                <RequireAdmin redirectTo="/admin/access">
                  <HelpDirectoryAdminPage />
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
