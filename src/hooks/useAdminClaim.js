// src/hooks/useAdminClaim.js
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getMyAdminAccess } from "@/services/adminAuthorization";

export function useAdminClaim() {
  const [state, setState] = useState({
    adminReady: false,
    isAdmin: false,
    claims: null,
  });

  const refreshClaims = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setState({
          adminReady: true,
          isAdmin: false,
          claims: null,
        });
        return;
      }

      try {
        const tokenResult = await user.getIdTokenResult(false);
        const tokenClaims = tokenResult?.claims || {};
        let access;
        try {
          access = await getMyAdminAccess();
        } catch (accessError) {
          // Local development may run a newer UI against Functions that have
          // not yet been deployed. This fallback is UI-only; callable and
          // Firestore authorization remain server enforced.
          if (!import.meta.env.DEV) throw accessError;
          access = {
            // The UI may recognize a trusted root token during local Functions
            // development, but legacy admin labels never confer access.
            isAdmin: tokenClaims.godAdmin === true,
            isGodAdmin: tokenClaims.godAdmin === true,
            scopes: [],
            regionalScopes: {},
            regions: [],
          };
        }
        const claims = {
          ...tokenClaims,
          admin: access.isAdmin === true,
          godAdmin: access.isGodAdmin === true,
          adminScopes: access.scopes || [],
          adminRegionalScopes: access.regionalScopes || {},
          adminRegions: access.regions || [],
        };

        setState({
          adminReady: true,
          isAdmin: access.isAdmin === true,
          claims,
        });
      } catch (tokenErr) {
        console.error("Failed to get token result:", tokenErr);
        setState({
          adminReady: true,
          isAdmin: false,
          claims: null,
        });
      }
    } catch (err) {
      console.error("Failed to get admin claims:", err);
      setState({
        adminReady: true,
        isAdmin: false,
        claims: null,
      });
    }
  };

  useEffect(() => {
    refreshClaims();
    
    // Listen to auth state changes to refresh claims
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(() => {
      refreshClaims();
    });
    
    return () => unsubscribe();
  }, []);

  return {
    adminReady: state.adminReady,
    isAdmin: state.isAdmin,
    claims: state.claims,
    refreshClaims,
  };
}
