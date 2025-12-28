// src/theme/themeStore.js

const KEY = "wc_theme";
const EVENT = "wc_theme_change";

export function getTheme() {
  const saved = localStorage.getItem(KEY);
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

function applyThemeToDom(next) {
  const root = document.documentElement;

  // Tailwind uses `dark` class. Keep `light` optional for any custom selectors.
  if (next === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
  }

  // Also set attribute for debugging / future theming rules
  root.setAttribute("data-theme", next);
}

export function setTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  localStorage.setItem(KEY, next);
  applyThemeToDom(next);

  // Same-tab + app-wide sync (ProfilePage, listeners, etc.)
  try {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { theme: next } }));
  } catch {
    // ignore
  }

  return next;
}

export function initTheme() {
  const theme = getTheme();
  applyThemeToDom(theme);
}
