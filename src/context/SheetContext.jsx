// SheetContext — single calm layer: when any sheet is open, dock/composer dim
// Used by OSLayout, AppDock, ChatComposerBar, EmulatorStatusPill, and sheet components

import React, { useState, useCallback } from "react";
import { SheetContext } from "./SheetContextValue.js";

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
