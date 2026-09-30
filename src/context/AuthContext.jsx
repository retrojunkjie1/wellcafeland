// src/context/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  getIdTokenResult,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { logTelemetry, trackAuthStateChange } from "@/telemetry/telemetry";

const AuthContext = createContext(null);

const ADMIN_ROLES = ["admin", "superadmin", "org_admin", "provider_admin"];

function getRolesFromClaims(claims = {}) {
  const roles = new Set([
    ...(Array.isArray(claims.roles) ? claims.roles : claims.roles ? [claims.roles] : []),
    ...(typeof claims.role === "string" ? [claims.role] : []),
  ]);
  if (claims.admin === true) roles.add("admin");
  if (claims.provider === true) roles.add("provider");
  return [...roles];
}

function getRoleFromClaims(claims = {}) {
  const roles = new Set(getRolesFromClaims(claims));
  if (claims.admin === true || [...roles].some((value) => ADMIN_ROLES.includes(value))) {
    return "admin";
  }
  if (roles.has("provider")) return "provider";
  return typeof claims.role === "string" ? claims.role : null;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [roles, setRoles] = useState([]);
  const [workspaceIntent, setWorkspaceIntent] = useState("client");
  const [loading, setLoading] = useState(true);

  // Preserve all granted spaces; `role` remains the primary route role.
  const fetchUserAccess = async (firebaseUser) => {
    if (!firebaseUser || !auth || !db) {
      return { role: null, roles: [], workspaceIntent: "client" };
    }

    let claims = {};
    try {
      const tokenResult = await getIdTokenResult(firebaseUser, true);
      claims = tokenResult.claims || {};
    } catch (err) {
      console.error("Error fetching user access claims:", err);
    }

    let userData = {};
    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) userData = userDoc.data();
    } catch (err) {
      console.error("Error fetching user profile access:", err);
    }

    const storedRoles = Array.isArray(userData.roles) ? userData.roles : (userData.role ? [userData.role] : []);
    const allRoles = [...new Set([...getRolesFromClaims(claims), ...storedRoles])];
    return {
      role: getRoleFromClaims(claims) || userData.role || "client",
      roles: allRoles,
      workspaceIntent: userData.workspaceIntent || "client",
    };
  };

  // Create or update user document in Firestore
  const ensureUserDoc = async (firebaseUser, userRole = "client") => {
    if (!firebaseUser || !db) return;

    try {
      // Get latest token claims
      let adminClaim = false;
      try {
        const tokenResult = await getIdTokenResult(firebaseUser, true);
        adminClaim = !!tokenResult?.claims?.admin;
      } catch {
        // Fallback to role check
      }

      const userRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userRef);
      const now = new Date();

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || null,
          role: userRole,
          isAdmin: adminClaim || userRole === "admin",
          createdAt: now,
          updatedAt: now,
          lastSignInAt: now,
        });
        
        // Log user creation
        try {
          logTelemetry("user_created", {
            level: "info",
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: userRole,
            admin: adminClaim,
          });
        } catch {
          // Telemetry not critical
        }
      } else {
        // Update existing document (sync role and admin status)
        const existingData = userDoc.data();
        const needsUpdate = 
          existingData.role !== userRole || 
          existingData.isAdmin !== adminClaim ||
          !existingData.lastSignInAt;
        
        if (needsUpdate) {
          await setDoc(
            userRef,
            {
              ...existingData,
              email: firebaseUser.email, // Sync email in case it changed
              role: userRole,
              isAdmin: adminClaim || userRole === "admin",
              updatedAt: now,
              lastSignInAt: now,
            },
            { merge: true }
          );
        }
      }
    } catch (err) {
      console.error("[AuthContext] Error ensuring user document:", err);
    }
  };

  useEffect(() => {
    if (!auth) {
      // Use setTimeout to avoid setState in effect warning
      setTimeout(() => setLoading(false), 0);
      return;
    }

    // GOD-EYE V2: Track auth state changes
    let previousUser = null;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Track auth state change
      try {
        const state = firebaseUser ? "signed_in" : "signed_out";
        trackAuthStateChange(state, {
          uid: firebaseUser?.uid || null,
          email: firebaseUser?.email || null,
          previousUid: previousUser?.uid || null,
        });
      } catch {
        // Telemetry not critical
      }
      previousUser = firebaseUser;
      
      if (firebaseUser) {
        // Force refresh ID token to get latest claims
        try {
          const tokenResult = await getIdTokenResult(firebaseUser, true);
          const claims = tokenResult?.claims || {};
          const isAdminClaim = !!claims.admin;
          
          // Log decoded claims for debugging
          console.log("[AuthContext] User authenticated:", {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            admin: isAdminClaim,
            claims: Object.keys(claims),
          });
          
          // Log telemetry for admin access
          if (isAdminClaim) {
            try {
              logTelemetry("admin_access", {
                level: "info",
                action: "auth_state_change",
                uid: firebaseUser.uid,
                email: firebaseUser.email,
              });
            } catch {
              // Telemetry not critical
            }
          }
        } catch (tokenError) {
          console.error("[AuthContext] Failed to refresh token:", tokenError);
        }
        
        setUser(firebaseUser);
        const access = await fetchUserAccess(firebaseUser);
        setRole(access.role);
        setRoles(access.roles);
        setWorkspaceIntent(access.workspaceIntent);
        await ensureUserDoc(firebaseUser, access.role);
      } else {
        setUser(null);
        setRole(null);
        setRoles([]);
        setWorkspaceIntent("client");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    if (!auth) return;
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setRole(null);
      setRoles([]);
      setWorkspaceIntent("client");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const value = {
    user,
    role,
    roles,
    workspaceIntent,
    loading,
    isAuthenticated: !!user,
    isAdmin: roles.some((value) => ADMIN_ROLES.includes(value)) || role === "admin" || role === "superadmin",
    isProvider: roles.includes("provider") || roles.includes("provider_admin") || role === "provider" || role === "provider_admin",
    isClient: roles.includes("client") || (!roles.length && role === "client" && workspaceIntent !== "practitioner"),
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
