// src/App.jsx

import React from "react";

import {BrowserRouter, Routes, Route} from "react-router-dom";

import {useThemeEngine} from "./hooks/useThemeEngine";

import OSLayout from "./layouts/OSLayout";

import HomePage from "./apps/core/HomePage";

import RecoveryPage from "./apps/recovery/RecoveryPage";

import ToolsPage from "./apps/tools/ToolsPage";

import ProvidersPage from "./apps/providers/ProvidersPage";

import DashboardPage from "./apps/dashboard/DashboardPage";

import SessionsTemplatesPage from "./apps/ai/SessionsTemplatesPage";
import SessionTemplateDetailPage from "./apps/ai/SessionTemplateDetailPage";
import SessionPlayerPage from "./apps/ai/SessionPlayerPage";
import SessionViewerPage from "./apps/ai/SessionViewerPage";
import SessionComposerPage from "./apps/ai/SessionComposerPage";
import SessionPreviewPage from "./apps/ai/SessionPreviewPage";
import SessionsAdminPage from "./apps/dashboard/SessionsAdminPage";

import LoginPage from "./apps/auth/LoginPage";

import SignupPage from "./apps/auth/SignupPage";

import AdminConsolePage from "./apps/dashboard/AdminConsolePage";

import ThemeControlPanel from "./admin/ThemeControlPanel";
import TemplatesManagerPage from "./apps/admin/TemplatesManagerPage";
import AccessDeniedPage from "./apps/auth/AccessDeniedPage";

const App = () => {
  // Initialize theme engine globally - this controls <html> theme classes
  useThemeEngine();

  return (
    <BrowserRouter>
      <Routes>
        {/* Preview - Standalone page, no layout */}
        <Route path="/preview/:token" element={<SessionPreviewPage />} />
        
        <Route element={<OSLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/recovery" element={<RecoveryPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/providers" element={<ProvidersPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Sessions */}
          <Route path="/sessions/templates" element={<SessionsTemplatesPage />} />
          <Route
            path="/sessions/templates/:id"
            element={<SessionTemplateDetailPage />}
          />
          <Route path="/sessions/view/:id" element={<SessionViewerPage />} />
          <Route path="/sessions/templates/new" element={<SessionComposerPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Admin - Protected Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminConsolePage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/theme"
            element={
              <AdminRoute>
                <ThemeControlPanel />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/templates"
            element={
              <AdminRoute>
                <TemplatesManagerPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/sessions"
            element={
              <AdminRoute>
                <SessionsAdminPage />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
