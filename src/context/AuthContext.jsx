// src/context/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  getIdTokenResult,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

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
      const userRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || null,
          role: userRole,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        // Update existing document (sync role if needed)
        const existingData = userDoc.data();
        if (existingData.role !== userRole) {
          await setDoc(
            userRef,
            {
              ...existingData,
              role: userRole,
              updatedAt: new Date(),
            },
            { merge: true }
          );
        }
      }
    } catch (err) {
      console.error("Error ensuring user document:", err);
    }
  };

  useEffect(() => {
    if (!auth) {
      // Use setTimeout to avoid setState in effect warning
      setTimeout(() => setLoading(false), 0);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
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

