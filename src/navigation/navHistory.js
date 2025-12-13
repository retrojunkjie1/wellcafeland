// src/navigation/navHistory.js

export const NAV_ROOTS = ["/", "/home", "/login", "/signup"];

const KEY = "wc_nav_stack_v1";

function safeRead() {
  try {
    const raw = sessionStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function safeWrite(arr) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(arr));
  } catch {
    // ignore
  }
}

export function navPush(pathname) {
  if (!pathname || NAV_ROOTS.includes(pathname)) return;
  const stack = safeRead();
  const last = stack[stack.length - 1];
  if (last === pathname) return;

  const next = [...stack, pathname].slice(-50);
  safeWrite(next);
}

export function navPeekPrev(currentPathname) {
  const stack = safeRead();
  if (!stack.length) return null;

  const last = stack[stack.length - 1];
  if (last === currentPathname) {
    return stack.length >= 2 ? stack[stack.length - 2] : null;
  }
  return last;
}

export function navPopToPrev(currentPathname) {
  const stack = safeRead();
  if (!stack.length) return null;

  let next = [...stack];
  const last = next[next.length - 1];

  if (last === currentPathname) {
    next.pop();
  }

  const prev = next[next.length - 1] || null;
  safeWrite(next);
  return prev;
}

export function navClear() {
  safeWrite([]);
}

