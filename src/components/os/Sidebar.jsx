// src/components/os/Sidebar.jsx
// ChatGPT + VS Code style collapsible sidebar with folders

import React, { useState } from "react";
import {
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Compass,
  Folder,
  FolderOpen,
  Clock,
  User,
  X,
  Menu,
  Trophy,
  Sparkles,
  UserCheck,
  ClipboardList,
  AlertTriangle,
  Users,
  Mic,
  Video,
  Calendar,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useOSStore, MODES } from "@/stores/useOSStore";
import { useSessionIdentity } from "@/hooks/useSessionIdentity";
import clsx from "clsx";
import logoImage from "@/assets/LogoWC.png";

const Sidebar = ({ isMobile = false, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isProvider, isAdmin } = useSessionIdentity();
  const {
    sidebarCollapsed,
    toggleSidebar,
    chats,
    currentChatId,
    openChat,
    createChat,
    workspaces,
    currentWorkspaceId,
    exploreOpen,
    openExplore,
    mode,
  } = useOSStore();

  const [expandedFolders, setExpandedFolders] = useState({
    chats: true,
    explore: false,
    directory: false,
    workspaces: false,
    recovery: false,
    provider: false,
    social: true, // Expanded by default so users see social features
    connections: true, // Expanded by default so users see connections
    tools: false,
  });

  const toggleFolder = (folder) => {
    setExpandedFolders((prev) => ({ ...prev, [folder]: !prev[folder] }));
  };

  const handleChatClick = (chatId) => {
    openChat(chatId);
    navigate("/chat");
    if (isMobile) onClose?.();
  };

  const handleNewChat = () => {
    createChat();
    navigate("/chat");
    if (isMobile) onClose?.();
  };

  const [isHovered, setIsHovered] = useState(false);

  // On mobile, always show full content regardless of collapsed state
  // On desktop, show content when expanded OR when hovering over collapsed sidebar
  const showContent = isMobile || !sidebarCollapsed || (sidebarCollapsed && isHovered);
  const width = sidebarCollapsed && !isMobile && !isHovered ? "w-16" : "w-64";

  return (
    <div
      data-sidebar-container
      className={clsx(
        "flex h-full flex-col border-r border-white/10 bg-slate-950 transition-all duration-300 relative z-50",
        width,
        isMobile && "w-full"
      )}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        {(!sidebarCollapsed || isMobile) && (
          <div className="flex items-center gap-2">
            <img
              src={logoImage}
              alt="WellnessCafe"
              className="h-6 w-6 object-contain drop-shadow-sm"
            />
            <span className="text-xs font-medium text-white">
              WELLNESSCAFE
            </span>
          </div>
        )}
        {/* Show icon only when collapsed (desktop) */}
        {sidebarCollapsed && !isMobile && (
          <div className="flex items-center justify-center">
            <img
              src={logoImage}
              alt="WellnessCafe"
              className="h-6 w-6 object-contain drop-shadow-sm"
            />
          </div>
        )}
        <div className="flex items-center gap-1">
          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded hover:bg-white/5 text-white/60 hover:text-white transition"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          {!isMobile && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1.5 rounded hover:bg-white/5 text-white/60 hover:text-white transition"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Chats Section */}
        <div className="mb-2">
          <button
            type="button"
            onClick={() => toggleFolder("chats")}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            {expandedFolders.chats ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            {expandedFolders.chats ? (
              <FolderOpen className="h-3.5 w-3.5" />
            ) : (
              <Folder className="h-3.5 w-3.5" />
            )}
            {(!sidebarCollapsed || isMobile) && <span>Chats</span>}
          </button>
          {expandedFolders.chats && showContent && (
            <div className="pl-8 space-y-0.5">
              <button
                type="button"
                onClick={handleNewChat}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/5 rounded transition"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span className="truncate">New Chat</span>
              </button>
              {chats
                .filter((chat) => chat.hasUserMessages !== false) // Only show chats with user messages
                .slice(0, 10)
                .map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => handleChatClick(chat.id)}
                    className={clsx(
                      "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition truncate",
                      currentChatId === chat.id
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">
                      {chat.title || `Chat ${new Date(chat.createdAt).toLocaleDateString()}`}
                    </span>
                  </button>
                ))}
              {chats.filter((chat) => chat.hasUserMessages !== false).length === 0 && (
                <p className="px-3 py-2 text-xs text-white/40 italic">
                  No chat history yet
                </p>
              )}
            </div>
          )}
        </div>

        {/* Explore Section */}
        <div className="mb-2">
          <button
            type="button"
            onClick={() => {
              toggleFolder("explore");
              if (!exploreOpen) {
                openExplore();
                navigate("/explore");
                if (isMobile) onClose?.();
              }
            }}
            className={clsx(
              "w-full flex items-center gap-2 px-4 py-2 text-xs font-medium transition",
              mode === MODES.EXPLORE
                ? "text-wcGold bg-wcGold/10"
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            {expandedFolders.explore ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            <Compass className="h-3.5 w-3.5" />
            {(!sidebarCollapsed || isMobile) && <span>Explore</span>}
          </button>
          {expandedFolders.explore && showContent && (
            <div className="pl-8 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  openExplore("tools");
                  navigate("/tools");
                  if (isMobile) onClose?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition"
              >
                <Folder className="h-3.5 w-3.5" />
                <span>Tools</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  openExplore("providers");
                  navigate("/resources?type=providers");
                  if (isMobile) onClose?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition"
              >
                <Folder className="h-3.5 w-3.5" />
                <span>Providers</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  openExplore("support");
                  navigate("/explore/support");
                  if (isMobile) onClose?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition"
              >
                <Folder className="h-3.5 w-3.5" />
                <span>Support</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/assistance");
                  if (isMobile) onClose?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition"
              >
                <Folder className="h-3.5 w-3.5" />
                <span>Real Help</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/circles");
                  if (isMobile) onClose?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition"
              >
                <Folder className="h-3.5 w-3.5" />
                <span>Circles</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  openExplore("education");
                  navigate("/guide");
                  if (isMobile) onClose?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition"
              >
                <Folder className="h-3.5 w-3.5" />
                <span>Education</span>
              </button>
            </div>
          )}
        </div>

        {/* Tools Section - Phase 14 Voice Features */}
        <div className="mb-2">
          <button
            type="button"
            onClick={() => toggleFolder("tools")}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            {expandedFolders.tools ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            <Folder className="h-3.5 w-3.5" />
            {(!sidebarCollapsed || isMobile) && <span>Tools</span>}
          </button>
          {expandedFolders.tools && showContent && (
            <div className="pl-8 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  navigate("/tools");
                  if (isMobile) onClose?.();
                }}
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition",
                  location.pathname === "/tools" || location.pathname.startsWith("/tools/")
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Folder className="h-3.5 w-3.5" />
                <span>All Tools</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/tools/voice-journal");
                  if (isMobile) onClose?.();
                }}
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition",
                  location.pathname === "/tools/voice-journal"
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Mic className="h-3.5 w-3.5" />
                <span>Voice Journal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/tools/voice-checkin");
                  if (isMobile) onClose?.();
                }}
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition",
                  location.pathname === "/tools/voice-checkin"
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Mic className="h-3.5 w-3.5" />
                <span>Voice Check-In</span>
              </button>
            </div>
          )}
        </div>

        {/* Recovery & Milestones Section */}
        <div className="mb-2">
          <button
            type="button"
            onClick={() => toggleFolder("recovery")}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            {expandedFolders.recovery ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            <Folder className="h-3.5 w-3.5" />
            {(!sidebarCollapsed || isMobile) && <span>Recovery</span>}
          </button>
          {expandedFolders.recovery && showContent && (
            <div className="pl-8 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  navigate("/recovery");
                  if (isMobile) onClose?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Track Progress</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/milestones");
                  if (isMobile) onClose?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition"
              >
                <Trophy className="h-3.5 w-3.5" />
                <span>Milestones</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/agents");
                  if (isMobile) onClose?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Agents</span>
              </button>
            </div>
          )}
        </div>

        {/* Global Directory Section */}
        <div className="mb-2">
          <button
            type="button"
            onClick={() => toggleFolder("directory")}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            {expandedFolders.directory ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            <Folder className="h-3.5 w-3.5" />
            {(!sidebarCollapsed || isMobile) && <span>Global Directory</span>}
          </button>
          {expandedFolders.directory && showContent && (
            <div className="pl-8 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  navigate("/resources?type=providers");
                  if (isMobile) onClose?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition"
              >
                <Folder className="h-3.5 w-3.5" />
                <span>Providers</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/resources?type=housing");
                  if (isMobile) onClose?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition"
              >
                <Folder className="h-3.5 w-3.5" />
                <span>Housing</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/resources?type=grants");
                  if (isMobile) onClose?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition"
              >
                <Folder className="h-3.5 w-3.5" />
                <span>Grants & Funding</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/resources?type=assistance");
                  if (isMobile) onClose?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition"
              >
                <Folder className="h-3.5 w-3.5" />
                <span>Government Assistance</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/resources?type=hotlines");
                  if (isMobile) onClose?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition"
              >
                <Folder className="h-3.5 w-3.5" />
                <span>Hotlines & Crisis</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/resources?type=programs");
                  if (isMobile) onClose?.();
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/60 hover:text-white hover:bg-white/5 rounded transition"
              >
                <Folder className="h-3.5 w-3.5" />
                <span>Programs & Groups</span>
              </button>
            </div>
          )}
        </div>

        {/* Workspaces Section */}
        {workspaces.length > 0 && (
          <div className="mb-2">
            <button
              type="button"
              onClick={() => toggleFolder("workspaces")}
              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition"
            >
              {expandedFolders.workspaces ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              {expandedFolders.workspaces ? (
                <FolderOpen className="h-3.5 w-3.5" />
              ) : (
                <Folder className="h-3.5 w-3.5" />
              )}
              {(!sidebarCollapsed || isMobile) && <span>Workspaces</span>}
            </button>
            {expandedFolders.workspaces && showContent && (
              <div className="pl-8 space-y-0.5">
                {workspaces.slice(0, 10).map((workspace) => (
                  <button
                    key={workspace.id}
                    type="button"
                    onClick={() => {
                      navigate(`/workspace/${workspace.id}`);
                      if (isMobile) onClose?.();
                    }}
                    className={clsx(
                      "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition truncate",
                      currentWorkspaceId === workspace.id
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Folder className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{workspace.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Social Section - Phase 13 */}
        <div className="mb-2 border-t border-white/5 pt-2">
          <button
            type="button"
            onClick={() => toggleFolder("social")}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            {expandedFolders.social ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            <MessageSquare className="h-3.5 w-3.5" />
            {(!sidebarCollapsed || isMobile) && <span>Social</span>}
          </button>
          {expandedFolders.social && showContent && (
            <div className="pl-8 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  navigate("/social/feed");
                  if (isMobile) onClose?.();
                }}
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition",
                  location.pathname === "/social/feed"
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Feed</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/social/dm");
                  if (isMobile) onClose?.();
                }}
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition",
                  location.pathname.startsWith("/social/dm")
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Direct Messages</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/circles");
                  if (isMobile) onClose?.();
                }}
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition",
                  location.pathname.startsWith("/circles")
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Circles</span>
              </button>
            </div>
          )}
        </div>

        {/* Connections Section - Phase 13 */}
        <div className="mb-2">
          <button
            type="button"
            onClick={() => toggleFolder("connections")}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition"
          >
            {expandedFolders.connections ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
            <UserCheck className="h-3.5 w-3.5" />
            {(!sidebarCollapsed || isMobile) && <span>Connections</span>}
          </button>
          {expandedFolders.connections && showContent && (
            <div className="pl-8 space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  navigate("/connections/friends");
                  if (isMobile) onClose?.();
                }}
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition",
                  location.pathname === "/connections/friends"
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Friends</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/connections/trusted");
                  if (isMobile) onClose?.();
                }}
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition",
                  location.pathname === "/connections/trusted"
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Trusted Partners</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/connections/blocked");
                  if (isMobile) onClose?.();
                }}
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition",
                  location.pathname === "/connections/blocked"
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Blocked</span>
              </button>
            </div>
          )}
        </div>

        {/* Provider Section - Phase 15 - Only visible to providers/admins */}
        {(isProvider || isAdmin) && (
          <div className="mb-2 border-t border-white/5 pt-2">
            <button
              type="button"
              onClick={() => toggleFolder("provider")}
              className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition"
            >
              {expandedFolders.provider ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              <UserCheck className="h-3.5 w-3.5" />
              {(!sidebarCollapsed || isMobile) && <span>Provider</span>}
            </button>
            {expandedFolders.provider && showContent && (
              <div className="pl-8 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/provider/dashboard");
                    if (isMobile) onClose?.();
                  }}
                  className={clsx(
                    "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition",
                    location.pathname === "/provider" || location.pathname === "/provider/dashboard"
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/provider/clients");
                    if (isMobile) onClose?.();
                  }}
                  className={clsx(
                    "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition",
                    location.pathname.startsWith("/provider/clients")
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>Clients</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/provider/messages");
                    if (isMobile) onClose?.();
                  }}
                  className={clsx(
                    "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition",
                    location.pathname.startsWith("/provider/messages")
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Messages</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/provider/schedule");
                    if (isMobile) onClose?.();
                  }}
                  className={clsx(
                    "w-full flex items-center gap-2 px-3 py-1.5 text-xs rounded transition",
                    location.pathname.startsWith("/provider/schedule")
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Schedule</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Profile Section */}
        {showContent && (
          <div className="mt-auto border-t border-white/5 pt-2">
            <button
              type="button"
              onClick={() => {
                navigate("/profile");
                if (isMobile) onClose?.();
              }}
              className={clsx(
                "w-full flex items-center gap-2 px-4 py-2 text-xs transition",
                location.pathname === "/profile"
                  ? "text-wcGold bg-wcGold/10"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <User className="h-3.5 w-3.5" />
              <span>Profile</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

