// src/components/CookieConsentBanner.jsx

import React, { useState } from "react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "wc_cookie_consent";

const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(() => {
    try {
      const accepted = localStorage.getItem(STORAGE_KEY);
      return !accepted;
    } catch {
      return false;
    }
  });

  const acceptCookies = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore write errors
    }
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border/40 bg-white/95 text-slate-900 shadow-xl shadow-black/10 backdrop-blur-sm dark:bg-slate-900/85 dark:text-slate-100 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-200">
          We use essential cookies to improve your experience. By continuing, you agree to our cookie policy.
        </p>
        <div className="flex items-center gap-3">
          <Link
            to="/cookies"
            className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
          >
            Learn More
          </Link>
          <button
            type="button"
            onClick={acceptCookies}
            className="inline-flex items-center rounded-full border border-foreground/40 bg-foreground text-background px-4 py-1.5 text-xs font-semibold hover:bg-background hover:text-foreground transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;

