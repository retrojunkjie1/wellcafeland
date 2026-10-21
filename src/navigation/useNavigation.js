import { useContext } from "react";
import { NavigationContext } from "./NavigationContextValue.js";

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error("useNavigation must be used within NavigationProvider");
  return ctx;
}
