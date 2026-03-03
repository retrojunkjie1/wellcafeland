// SheetContext — single calm layer: when any sheet is open, dock/composer dim
// Used by OSLayout, AppDock, ChatComposerBar, EmulatorStatusPill, and sheet components

import React, { createContext, useContext, useState, useCallback } from "react";

const SheetContext = createContext(null);

export function SheetProvider({ children }) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const openSheet = useCallback(() => setSheetOpen(true), []);
  const closeSheet = useCallback(() => setSheetOpen(false), []);

  return (
    <SheetContext.Provider value={{ sheetOpen, openSheet, closeSheet }}>
      {children}
    </SheetContext.Provider>
  );
}

export function useSheet() {
  const ctx = useContext(SheetContext);
  if (!ctx) {
    return {
      sheetOpen: false,
      openSheet: () => {},
      closeSheet: () => {},
    };
  }
  return ctx;
}
