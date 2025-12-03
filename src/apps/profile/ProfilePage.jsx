// src/apps/profile/ProfilePage.jsx
// Profile page with guest mode support

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import { useThemeEngine } from "../../hooks/useThemeEngine";
import { Moon, Sun, LogOut, User, Mail, Sparkles } from "lucide-react";
import { trackPageView } from "../../services/telemetry";
import PageHeader from "@/components/navigation/PageHeader";

const ProfilePage = () => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const identity = useSessionIdentity();
  const { theme, toggleTheme } = useThemeEngine();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Profile - WellnessCafe";
    trackPageView("profile");
  }, []);

  const handleCreateAccount = () => {
    navigate("/signup");
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Profile" 
        subtitle="Manage your account and preferences"
      />
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-light tracking-wide text-white">Profile</h1>
        <p className="text-sm text-white/60">
          Manage your account and preferences
        </p>
      </header>

      {/* Guest Mode Notice */}
      {identity.mode === "guest" && (
        <div className="glass-panel border-wcGold/30 bg-wcGold/5 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-wcGold/20 p-2">
              <Sparkles className="h-5 w-5 text-wcGold" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-medium text-white mb-2">
                You're using WellnessCafe in guest mode
              </h3>
              <p className="text-sm text-white/70 mb-4">
                Your progress is saved locally in this session. When you close the tab, this data will be lost.
              </p>
              <p className="text-sm text-white/70 mb-6">
                Create a free account to save your journey across devices and never lose your progress.
              </p>
              <button
                type="button"
                onClick={handleCreateAccount}
                className="rounded-full bg-wcGold px-6 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-amber-400"
              >
                Create a free account to save your journey
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Information */}
      {identity.mode === "account" && isAuthenticated && (
        <div className="glass-panel p-6 space-y-4">
          <h2 className="text-xs uppercase tracking-[0.3em] text-white/50">
            Account Information
          </h2>
          <div className="space-y-4">
            {user?.displayName && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-white/50" />
                <div>
                  <p className="text-xs text-white/50">Name</p>
                  <p className="text-sm font-medium text-white">{user.displayName}</p>
                </div>
              </div>
            )}
            {user?.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-white/50" />
                <div>
                  <p className="text-xs text-white/50">Email</p>
                  <p className="text-sm font-medium text-white">{user.email}</p>
                </div>
              </div>
            )}
            {role && (
              <div className="flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-white/50" />
                <div>
                  <p className="text-xs text-white/50">Account Type</p>
                  <p className="text-sm font-medium text-white capitalize">{role}</p>
                </div>
              </div>
            )}
            <div className="pt-2">
              <p className="text-xs text-white/50">
                Your progress is being saved to your account.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* My Wellness Settings */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
        <h2 className="text-sm sm:text-base font-medium text-white mb-1">
          My Wellness Settings
        </h2>
        <p className="text-xs sm:text-sm text-white/60 mb-4">
          How fast we move, how deep we go, and how spiritual or clinical you want your experience to feel.
        </p>
        {/* Settings controls can be wired later to store */}
        <p className="text-xs text-white/50">
          (Controls coming online as we wire the store values. For now, you can simply know this is the home of your
          personal OS tuning.)
        </p>
      </section>

      {/* Preferences */}
      <div className="glass-panel p-6 space-y-4">
        <h2 className="text-xs uppercase tracking-[0.3em] text-white/50">
          Preferences
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Theme</p>
            <p className="text-xs text-white/60">
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className={`
              relative inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all
              ${theme === "dark"
                ? "border-amber-400/40 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20"
                : "border-white/20 bg-white/10 text-white hover:bg-white/20"
              }
            `}
          >
            {theme === "dark" ? (
              <>
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Actions */}
      {identity.mode === "account" && isAuthenticated && (
        <div className="glass-panel p-6">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-full border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
          >
            <LogOut className="h-4 w-4 inline mr-2" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
