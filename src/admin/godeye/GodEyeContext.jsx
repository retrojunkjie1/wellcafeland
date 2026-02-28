// src/admin/godeye/GodEyeContext.jsx
// Phase 53C: God-Eye drawer open state — available app-wide for admins

import React, { createContext, useContext, useState, useCallback } from "react";

const GodEyeContext = createContext({
  isOpen: false,
  toggle: () => {},
});

export function useGodEye() {
  const ctx = useContext(GodEyeContext);
  return ctx || { isOpen: false, toggle: () => {} };
}

export function GodEyeProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  return (
    <GodEyeContext.Provider value={{ isOpen, toggle }}>
      {children}
    </GodEyeContext.Provider>
  );
}
