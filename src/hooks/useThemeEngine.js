/**
 * @deprecated LEGACY - DO NOT USE
 * 
 * This hook uses a conflicting localStorage key ("wc-theme") and creates race conditions.
 * 
 * Use themeStore.js instead:
 * - getTheme() - read current theme
 * - setTheme(theme) - set theme and update DOM
 * - initTheme() - initialize on app startup
 * 
 * This file is kept for reference only. All usage has been removed.
 */

import { useEffect, useState } from "react";

export function useThemeEngine() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";

    return localStorage.getItem("wc-theme") || "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("wc-theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  return { theme, toggleTheme };
}

