// src/theme/themeStore.js

const KEY = "wc_theme";

export function getTheme() {
  const saved = localStorage.getItem(KEY);
  if (saved === "light" || saved === "dark") return saved;
  return "dark"; // default
}

export function setTheme(theme) {
  const next = theme === "light" ? "light" : "dark";
  localStorage.setItem(KEY, next);

  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(next);

  return next;
}

export function initTheme() {
  const theme = getTheme();
  setTheme(theme);
}

