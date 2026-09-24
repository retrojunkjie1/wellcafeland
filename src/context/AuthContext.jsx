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
  const [loading, setLoading] = useState(true);

  // Fetch role from custom claims or Firestore user doc
  const fetchUserRole = async (firebaseUser) => {
    if (!firebaseUser || !auth || !db) {
      return null;
    }

    try {
      // First, try to get role from custom claims (set by Admin SDK)
      const tokenResult = await getIdTokenResult(firebaseUser, true);
      if (tokenResult.claims.role) {
        return tokenResult.claims.role;
      }

      // Fallback: check Firestore user document
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return userData.role || "client";
      }

      // Default role for new users
      return "client";
    } catch (err) {
      console.error("Error fetching user role:", err);
      return "client"; // Default fallback
    }
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
        const userRole = await fetchUserRole(firebaseUser);
        setRole(userRole);
        await ensureUserDoc(firebaseUser, userRole);
      } else {
        setUser(null);
        setRole(null);
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
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const value = {
    user,
    role,
    loading,
    isAuthenticated: !!user,
    isAdmin: role === "admin" || role === "superadmin",
    isProvider: role === "provider" || role === "admin" || role === "superadmin",
    isClient: role === "client" || !role, // Default to client if no role
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
