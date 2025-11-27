// src/components/navigation/PageHeader.jsx
// Reusable page header with back button and page title

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PageHeader = ({ 
  title, 
  subtitle, 
  backTo = null, 
  showBack = true,
  className = "" 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to go back to
  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to chat or dashboard
      navigate("/chat");
    }
  };

  // Don't show back button on home/chat pages
  const isHomePage = location.pathname === "/" || location.pathname === "/chat";
  const shouldShowBack = showBack && !isHomePage;

  return (
    <div className={`border-b border-white/10 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-30 ${className}`}>
      <div className="flex items-center gap-4 px-4 sm:px-6 py-4">
        {shouldShowBack && (
          <button
            type="button"
            onClick={handleBack}
            className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h1 className="text-lg sm:text-xl font-medium text-white truncate">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-white/50 mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;

