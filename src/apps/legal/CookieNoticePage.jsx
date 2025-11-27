// src/apps/legal/CookieNoticePage.jsx

import React, { useEffect } from "react";

const content = [
  "🔵 3. WELLNESSCAFE COOKIE NOTICE",
  "Effective: 2025",
  "WellnessCafe uses minimal cookies and local storage to offer a smooth experience.",
  "1. What We Use Cookies For",
  "We use cookies/local storage for:",
  "Keeping you logged in",
  "Saving your theme preference",
  "Remembering onboarding completion",
  "Supporting Guest Mode",
  "Basic analytics (anonymous)",
  "We do not use:",
  "Advertising cookies",
  "Tracking cookies",
  "Third-party marketing cookies",
  "2. Types of Cookies",
  "Essential cookies: required for login/session",
  "Preference cookies: theme, language",
  "Anonymous analytics cookies: improve performance",
  "3. Managing Cookies",
  "You may clear cookies anytime using your browser settings.",
  "If you disable cookies completely, some features may not work (e.g., staying logged in).",
  "4. Contact",
  "For more info:",
  "support@wellnesscafe.net",
];

const CookieNoticePage = () => {
  useEffect(() => {
    document.title = "Cookie Notice - WellnessCafe";
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="lux-shell py-10 space-y-8">
        <header className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            WellnessCafe
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Cookie Notice</h1>
          <p className="text-sm text-muted-foreground">Effective: 2025</p>
        </header>

        <div className="lux-card p-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
          {content.map((paragraph, index) => (
            <p key={index} className="text-foreground/80">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CookieNoticePage;

