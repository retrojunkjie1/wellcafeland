// src/admin/useIsAdmin.js
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminReady, setAdminReady] = useState(false);
  const [source, setSource] = useState("unknown");

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          if (!alive) return;
          setIsAdmin(false);
          setSource("no-user");
          setAdminReady(true);
          return;
        }

        // 1) Custom claims
        try {
          const token = await user.getIdTokenResult(true);
          const claims = token?.claims || {};
          const claimAdmin = claims.admin === true || claims.role === "admin";
          if (claimAdmin) {
            if (!alive) return;
            setIsAdmin(true);
            setSource("claims");
            setAdminReady(true);
            return;
          }
        } catch {
          // ignore, proceed to firestore fallback
        }

        // 2) Firestore user role
        try {
          const uref = doc(db, "users", user.uid);
          const usnap = await getDoc(uref);
          const u = usnap.exists() ? usnap.data() : null;
          const roleAdmin = u?.role === "admin" || u?.isAdmin === true;
          if (roleAdmin) {
            if (!alive) return;
            setIsAdmin(true);
            setSource("users-doc");
            setAdminReady(true);
            return;
          }
        } catch {
          // ignore
        }

        // 3) roles doc fallback
        try {
          const rref = doc(db, "roles", user.uid);
          const rsnap = await getDoc(rref);
          const r = rsnap.exists() ? rsnap.data() : null;
          const rAdmin = r?.admin === true || r?.role === "admin";
          if (rAdmin) {
            if (!alive) return;
            setIsAdmin(true);
            setSource("roles-doc");
            setAdminReady(true);
            return;
          }
        } catch {
          // ignore
        }

        if (!alive) return;
        setIsAdmin(false);
        setSource("none");
        setAdminReady(true);
      } catch {
        if (!alive) return;
        setIsAdmin(false);
        setSource("error");
        setAdminReady(true);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, []);

  return { isAdmin, adminReady, source };
}

