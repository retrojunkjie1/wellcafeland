// src/components/AdminRoute.jsx

import React, { useState } from "react";
import { getAdminStatus } from "../services/adminAccess";
import AccessDeniedPage from "../apps/auth/AccessDeniedPage";

/**
 * Wrapper component that protects admin routes
 * Shows AccessDeniedPage if user is not admin
 */
const AdminRoute = ({ children }) => {
  const [isAdmin] = useState(() => getAdminStatus());

  if (!isAdmin) {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
};

export default AdminRoute;

