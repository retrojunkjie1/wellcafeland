import React from "react";
import {Link, NavLink, Outlet} from "react-router-dom";
import { useThemeEngine } from "@/hooks/useThemeEngine";
import {Home, HeartPulse, Wrench, Users, LayoutDashboard, Calendar, LogIn, UserPlus, Moon, Sun, MessageCircle, Settings} from "lucide-react";
import AssistantConsole from "../apps/ai/AssistantConsole";
import { useAIStore } from "../apps/ai/useAIStore";
import { useUIStore } from "../stores/uiStore";

const navItems = [
  {to: "/", label: "Home", icon: Home},
  {to: "/recovery", label: "Recovery", icon: HeartPulse},
  {to: "/tools", label: "Tools", icon: Wrench},
  {to: "/providers", label: "Providers", icon: Users},
  {to: "/dashboard", label: "Dashboard", icon: LayoutDashboard},
  {to: "/sessions/templates", label: "Sessions", icon: Calendar},
  {to: "/admin", label: "Admin", icon: Settings},
];

const OSLayout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(() => {
    const saved = localStorage.getItem('wc-sidebar-open');
    return saved !== null ? saved === 'true' : true;
  });
  const [sidebarWidth, setSidebarWidth] = React.useState(() => {
    const saved = localStorage.getItem('wc-sidebar-width');
    return saved ? parseInt(saved, 10) : 256; // 256px = w-64
  });
  const [isResizing, setIsResizing] = React.useState(false);
  const { theme, toggleTheme } = useThemeEngine();
  const { isConsoleOpen, toggleConsole } = useAIStore();
  const { viewMode } = useUIStore();

  // Save sidebar state
  React.useEffect(() => {
    localStorage.setItem('wc-sidebar-open', String(sidebarOpen));
  }, [sidebarOpen]);

  React.useEffect(() => {
    localStorage.setItem('wc-sidebar-width', String(sidebarWidth));
  }, [sidebarWidth]);

  // Handle resize
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      if (newWidth >= 64 && newWidth <= 384) { // Min 64px (w-16), Max 384px (w-96)
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="wc-shell flex h-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <aside 
        className={`
          flex-shrink-0 
          border-r border-border/50 
          bg-card/40 backdrop-blur-sm
          transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          flex flex-col
          relative
          z-50
        `}
        style={{ 
          width: sidebarOpen ? `${sidebarWidth}px` : '64px',
          opacity: isConsoleOpen ? 0.92 : 1,
          filter: isConsoleOpen ? 'brightness(0.95)' : 'brightness(1)',
        }}
      >
        {/* Brand & Theme Toggle */}
        <div 
          className="p-4 border-b border-border/50 relative pr-12 transition-all duration-500"
          style={{
            borderColor: isConsoleOpen ? 'hsl(var(--border) / 0.3)' : 'hsl(var(--border) / 0.5)',
          }}
        >
          <Link to="/" className="flex items-center gap-3">
            {sidebarOpen ? (
              <div className="flex flex-col leading-tight flex-1">
                <span 
                  className="text-sm font-bold tracking-[0.2em] uppercase transition-all duration-500"
                  style={{
                    color: isConsoleOpen ? 'hsl(var(--foreground) / 0.85)' : 'hsl(var(--foreground))',
                  }}
                >
                  WellnessCafe
                </span>
                <span 
                  className="text-[10px] uppercase tracking-[0.22em] font-medium transition-all duration-500"
                  style={{
                    color: isConsoleOpen ? 'hsl(var(--muted-foreground) / 0.7)' : 'hsl(var(--muted-foreground))',
                  }}
                >
                  Built For Serious Recovery
                </span>
              </div>
            ) : (
              <div className="flex flex-col leading-tight">
                <span 
                  className="text-xs font-bold tracking-[0.2em] uppercase transition-all duration-500"
                  style={{
                    color: isConsoleOpen ? 'hsl(var(--foreground) / 0.85)' : 'hsl(var(--foreground))',
                  }}
                >
                  WC
                </span>
              </div>
            )}
          </Link>
          
          {/* Theme Toggle + Admin Preview Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
            {/* Admin Preview Badge */}
            {viewMode === "adminPreview" && (
              <span className="hidden md:inline-flex items-center rounded-full border border-amber-400/60 bg-amber-400/10 px-2.5 py-1 text-[10px] font-medium text-amber-300 uppercase tracking-[0.12em]">
                Admin preview
              </span>
            )}
            
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleTheme();
              }}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="h-7 w-7 rounded-full border-2 border-foreground/30 bg-background/90 shadow-lg flex items-center justify-center text-foreground hover:text-amber-400 hover:border-amber-400 hover:bg-amber-400/10 transition-all"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* Resize Handle */}
        {sidebarOpen && (
          <div
            onMouseDown={handleMouseDown}
            className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize transition-colors z-10 ${
              isResizing ? 'bg-amber-400/50' : 'hover:bg-amber-400/30'
            }`}
            title="Drag to resize sidebar"
          />
        )}

        {/* Sidebar Toggle Button - Positioned below header to avoid overlap */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSidebar();
          }}
          className="absolute -right-3 top-20 z-[100] h-7 w-7 rounded-full bg-card border-2 border-foreground/30 shadow-2xl flex items-center justify-center text-foreground hover:text-amber-400 hover:border-amber-400 hover:bg-amber-400/10 transition-all backdrop-blur-sm"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          style={{ 
            pointerEvents: 'auto',
            position: 'absolute'
          }}
        >
          {sidebarOpen ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>

        {/* Navigation Items */}
        <nav 
          className="flex-1 overflow-y-auto py-4 px-2 space-y-1 transition-all duration-500 wc-infinite-scroll"
          style={{
            opacity: isConsoleOpen ? 0.9 : 1,
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({isActive}) =>
                  [
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                    "hover:bg-foreground/5 hover:text-foreground",
                    isActive
                      ? "bg-amber-400/10 text-amber-400 border-l-2 border-amber-400"
                      : "text-muted-foreground",
                    isConsoleOpen && !isActive ? "opacity-80" : "",
                  ].join(" ")
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
          
          {/* Wellness Guide Toggle - Matches other nav items */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleConsole();
            }}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
              hover:bg-foreground/5 hover:text-foreground
              ${isConsoleOpen
                ? "bg-amber-400/15 text-amber-400 border-l-2 border-amber-400 shadow-lg shadow-amber-400/20"
                : "text-muted-foreground"
              }
            `}
          >
            <MessageCircle className={`h-5 w-5 flex-shrink-0 transition-all duration-300 ${isConsoleOpen ? 'text-amber-400 scale-110' : 'text-muted-foreground'}`} />
            {sidebarOpen && (
              <span className={`truncate transition-all duration-300 ${isConsoleOpen ? 'font-semibold text-amber-300' : 'text-muted-foreground'}`}>
                Your Wellness Guide
              </span>
            )}
          </button>
        </nav>

        {/* Bottom Actions - Footer aligned */}
        <div 
          className="border-t border-border/50 p-3 space-y-2 flex-shrink-0 transition-all duration-500 mt-auto"
          style={{
            opacity: isConsoleOpen ? 0.85 : 1,
            borderColor: isConsoleOpen ? 'hsl(var(--border) / 0.3)' : 'hsl(var(--border) / 0.5)',
          }}
        >
          <Link
            to="/login"
            className={`
              flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm 
              text-muted-foreground hover:bg-foreground/5 hover:text-foreground 
              transition-all w-full min-w-0
              ${!sidebarOpen ? 'px-2 justify-center' : ''}
            `}
            title={!sidebarOpen ? "Login" : undefined}
          >
            <LogIn className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            {sidebarOpen && <span className="truncate text-muted-foreground">Login</span>}
          </Link>
          <Link
            to="/signup"
            className={`
              flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium 
              bg-amber-500 text-slate-950 hover:bg-amber-400 
              transition-colors w-full min-w-0
              ${!sidebarOpen ? 'px-2 justify-center' : ''}
            `}
            title={!sidebarOpen ? "Get Started" : undefined}
          >
            <UserPlus className="h-4 w-4 flex-shrink-0" />
            {sidebarOpen && <span className="truncate">Get Started</span>}
          </Link>
          
          {/* Footer copyright - aligned at bottom */}
          <div className="pt-2 border-t border-border/30">
            <div className="flex flex-col items-center gap-1 text-[9px] text-muted-foreground">
              {sidebarOpen ? (
                <>
                  <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-foreground/80">
                    WellnessCafe
                  </span>
                  <span className="text-[8px]">
                    © {new Date().getFullYear()} All rights reserved
                  </span>
                </>
              ) : (
                <span className="text-[8px] font-semibold tracking-wide text-foreground/60">
                  WC
                </span>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Main content - Adapts when chat opens with smart transitions */}
        <main 
          className={`
            flex-1 overflow-y-auto wc-content-adapt wc-infinite-scroll
            transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
            relative z-10
            ${isConsoleOpen 
              ? 'pb-[50vh] sm:pb-[60vh]' 
              : 'pb-14'
            }
          `}
          style={{
            opacity: isConsoleOpen ? 0.88 : 1,
            transform: isConsoleOpen ? 'scale(0.98) translateY(-8px)' : 'scale(1) translateY(0)',
            filter: isConsoleOpen ? 'blur(0.4px) brightness(0.92)' : 'blur(0) brightness(1)',
          }}
        >
          <div 
            className={`
              wc-max wc-fade-slide 
              transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
              relative z-10
              ${isConsoleOpen ? 'py-4 sm:py-5' : 'py-6 sm:py-8'}
            `}
          >
            <Outlet />
          </div>
        </main>

        {/* Subtle gradient overlay when chat is open - adds living depth */}
        {isConsoleOpen && (
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-0"
            style={{ 
              background: 'linear-gradient(to top, hsl(var(--background) / 0.15) 0%, transparent 30%, transparent 100%)',
              opacity: 1,
            }}
          />
        )}

        {/* Chat Console - Positioned inside main content area, respects sidebar boundaries */}
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <AssistantConsole />
        </div>
      </div>

    </div>
  );
};

export default OSLayout;
