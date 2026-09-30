import React from "react";
import { RequireAdmin } from "@/components/routing/RequireRole";

/**
 * Keep legacy God-Eye sections on the same auth restore and custom-claim check
 * as the primary admin routes. Checking Firebase currentUser before AuthContext
 * finishes restoring a session can incorrectly reject an administrator.
 */
export function AdminGuard({ children }) {
  return <RequireAdmin redirectTo="/admin/access">{children}</RequireAdmin>;
}
