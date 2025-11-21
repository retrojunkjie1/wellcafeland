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

