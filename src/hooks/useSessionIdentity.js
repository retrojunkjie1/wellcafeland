// src/hooks/useSessionIdentity.js

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { safeUUID } from "../utils/uuid";

const GUEST_ID_KEY = "wc_guest_id";

function getOrCreateGuestId() {
  if (typeof window === "undefined") return null;
  
  let guestId = sessionStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = safeUUID();
    sessionStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

export function useSessionIdentity() {
  const [identity, setIdentity] = useState({
    mode: "loading", // "guest" | "account" | "loading"
    userId: null,
    isLoading: true,
    isProvider: false,
    isAdmin: false,
    providerId: null,
    orgId: null,
    role: "client", // "client" | "provider" | "org_admin"
    roles: [],
  });

  useEffect(() => {
    if (!auth) {
      // Firebase not configured, use guest mode
      setTimeout(() => {
        const guestId = getOrCreateGuestId();
        setIdentity({
          mode: "guest",
          userId: guestId,
          isLoading: false,
          isProvider: false,
          isAdmin: false,
          providerId: null,
          orgId: null,
          role: "client",
          roles: [],
        });
      }, 0);
      return;
    }

    // Auth state is source of truth - sync immediately on mount
    const currentUser = auth.currentUser;
    if (currentUser) {
      // User exists, set to account mode immediately (will be updated by onAuthStateChanged)
      setIdentity((prev) => ({
        ...prev,
        mode: "account",
        userId: currentUser.uid,
        isLoading: true, // Still loading role details
      }));
    } else {
      // No user, set to guest mode immediately
      const guestId = getOrCreateGuestId();
      setIdentity({
        mode: "guest",
        userId: guestId,
        isLoading: false,
        isProvider: false,
        isAdmin: false,
        providerId: null,
        orgId: null,
        role: "client",
        roles: [],
      });
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check for custom claims first (if available)
        const tokenResult = await user.getIdTokenResult().catch(() => null);
        const customClaims = tokenResult?.claims || {};
        
        let isProvider = customClaims.provider === true || customClaims.role === "provider" || customClaims.role === "provider_admin";
        let isAdmin = customClaims.admin === true || customClaims.role === "admin" || customClaims.role === "provider_admin";
        let roles = customClaims.roles || [];
        
        let providerId = null;
        let orgId = null;
        let role = "client";
        
        // If no custom claims, check Firestore
        if (!isProvider && !isAdmin && db) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const userRole = userData.role || userData.roles?.[0];
              
              if (userRole === "provider" || userRole === "provider_admin") {
                isProvider = true;
                role = "provider";
                providerId = user.uid;
              }
              if (userRole === "admin" || userRole === "provider_admin" || userRole === "org_admin") {
                isAdmin = true;
                role = userRole === "org_admin" ? "org_admin" : "admin";
              }
              
              roles = userData.roles || (userRole ? [userRole] : []);
              orgId = userData.orgId || null;
              providerId = userData.providerId || providerId;
            }
            
            // Check provider profile if provider
            if (isProvider && db) {
              try {
                const providerDoc = await getDoc(doc(db, "providers", user.uid));
                if (providerDoc.exists()) {
                  const providerData = providerDoc.data();
                  providerId = providerDoc.id;
                  orgId = providerData.orgId || orgId;
                }
              } catch (err) {
                console.warn("Failed to load provider profile:", err);
              }
            }
          } catch (err) {
            console.warn("Failed to check user role in Firestore:", err);
          }
        } else if (isProvider) {
          role = "provider";
          providerId = user.uid;
        } else if (isAdmin) {
          role = customClaims.org_admin ? "org_admin" : "admin";
        }
        
        setIdentity({
          mode: "account",
          userId: user.uid,
          isLoading: false,
          isProvider,
          isAdmin,
          providerId,
          orgId,
          role,
          roles: Array.isArray(roles) ? roles : (roles ? [roles] : []),
        });
      } else {
        // Guest mode - generate or retrieve session guestId
        // Auth state is source of truth: if user is null, we are in guest mode
        const guestId = getOrCreateGuestId();
        setIdentity({
          mode: "guest",
          userId: guestId,
          isLoading: false,
          isProvider: false,
          isAdmin: false,
          providerId: null,
          orgId: null,
          role: "client",
          roles: [],
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Debug logging (dev only)
  useEffect(() => {
    if (import.meta.env.DEV && !identity.isLoading) {
      console.debug("[useSessionIdentity] Identity state:", {
        mode: identity.mode,
        userId: identity.userId?.substring(0, 8) + "...",
        isProvider: identity.isProvider,
        isAdmin: identity.isAdmin,
      });
    }
  }, [identity.mode, identity.userId, identity.isProvider, identity.isAdmin, identity.isLoading]);

  return identity;
}

/**
 * Helper functions for role checking
 */
export function isClient(identity) {
  return !identity.isProvider && !identity.isAdmin && identity.role === "client";
}

export function isProvider(identity) {
  return identity.isProvider || identity.role === "provider";
}

export function isOrgAdmin(identity) {
  return identity.role === "org_admin" || (identity.isAdmin && identity.orgId);
}
