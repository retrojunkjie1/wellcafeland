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
    isGiver: false,
    providerId: null,
    providerType: null,
    orgId: null,
    role: "client", // "client" | "provider" | "org_admin"
    roles: [],
    workspaceIntent: "client",
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
          isGiver: false,
          providerId: null,
          providerType: null,
          orgId: null,
          role: "client",
          roles: [],
          workspaceIntent: "client",
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
        isGiver: false,
        providerId: null,
        providerType: null,
        orgId: null,
        role: "client",
        roles: [],
        workspaceIntent: "client",
      });
    }

    let identityRequestVersion = 0;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const requestVersion = ++identityRequestVersion;
      if (user) {
        // Clear the previous account's permissions while the new account's
        // claims and profile are being resolved. This prevents stale role
        // navigation from surviving an account switch.
        setIdentity({
          mode: "account",
          userId: user.uid,
          isLoading: true,
          isProvider: false,
          isAdmin: false,
          isGiver: false,
          providerId: null,
          providerType: null,
          orgId: null,
          role: "client",
          roles: [],
          workspaceIntent: "client",
        });

        // Check for custom claims first (if available)
        const tokenResult = await user.getIdTokenResult().catch(() => null);
        if (requestVersion !== identityRequestVersion) return;
        const customClaims = tokenResult?.claims || {};
        
        let roles = Array.isArray(customClaims.roles) ? customClaims.roles : (customClaims.roles ? [customClaims.roles] : []);
        if (customClaims.role) roles.push(customClaims.role);
        if (customClaims.provider === true) roles.push("provider");
        if (customClaims.admin === true) roles.push("admin");
        roles = [...new Set(roles)];
        let isProvider = customClaims.provider === true || roles.includes("provider") || roles.includes("provider_admin");
        let isAdmin = customClaims.admin === true || roles.some((item) => ["admin", "superadmin", "org_admin", "provider_admin"].includes(item));
        let isGiver = roles.includes("giver") || roles.includes("community_giver");
        
        let providerId = null;
        let providerType = typeof customClaims.providerType === "string" ? customClaims.providerType : null;
        let orgId = null;
        let role = "client";
        let workspaceIntent = "client";

        // Combine trusted approval claims with the account's selected spaces.
        // This preserves a client's space when a practitioner claim is added.
        if (db) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (requestVersion !== identityRequestVersion) return;
            if (userDoc.exists()) {
              const userData = userDoc.data();
              providerType = providerType || userData.providerType || null;
              workspaceIntent = userData.workspaceIntent || "client";
              const storedRoles = Array.isArray(userData.roles) ? userData.roles : (userData.role ? [userData.role] : []);
              roles = [...new Set([...roles, ...storedRoles])];
              isProvider = isProvider || roles.includes("provider") || roles.includes("provider_admin");
              isAdmin = isAdmin || roles.some((item) => ["admin", "superadmin", "org_admin", "provider_admin"].includes(item));
              isGiver = isGiver || roles.includes("giver") || roles.includes("community_giver");
              if (isProvider) providerId = userData.providerId || user.uid;
              orgId = userData.orgId || null;
              providerId = userData.providerId || providerId;
            }
          } catch (err) {
            console.warn("Failed to check user role in Firestore:", err);
          }
        }

        if (isProvider) {
          role = "provider";
          providerId = user.uid;
        }
        if (isAdmin && !isProvider) role = roles.includes("org_admin") ? "org_admin" : "admin";
        else if (!isProvider && roles.includes("client")) role = "client";

        if (isProvider && db) {
          try {
            const providerDoc = await getDoc(doc(db, "providers", user.uid));
            if (requestVersion !== identityRequestVersion) return;
            if (providerDoc.exists()) {
              const providerData = providerDoc.data();
              providerId = providerDoc.id;
              orgId = providerData.orgId || orgId;
              providerType = providerType || providerData.category || providerData.type || null;
            }
          } catch (err) {
            console.warn("Failed to load provider profile:", err);
          }
        }
        
        setIdentity({
          mode: "account",
          userId: user.uid,
          isLoading: false,
          isProvider,
          isAdmin,
          isGiver,
          providerId,
          providerType,
          orgId,
          role,
          roles: Array.isArray(roles) ? roles : (roles ? [roles] : []),
          workspaceIntent,
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
          isGiver: false,
          providerId: null,
          providerType: null,
          orgId: null,
          role: "client",
          roles: [],
          workspaceIntent: "client",
        });
      }
    });

    return () => {
      identityRequestVersion += 1;
      unsubscribe();
    };
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
