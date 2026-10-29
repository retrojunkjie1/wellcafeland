import { useContext } from "react";
import { SheetContext } from "./SheetContextValue.js";

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
