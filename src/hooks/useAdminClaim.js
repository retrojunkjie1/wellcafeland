// src/hooks/useAdminClaim.js
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

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
        const tokenResult = await user.getIdTokenResult(true);
        const claims = tokenResult?.claims || {};
        const isAdmin = !!claims.admin;

        setState({
          adminReady: true,
          isAdmin,
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

