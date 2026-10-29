import { useSyncExternalStore } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getMyAdminAccess } from "@/services/adminAuthorization";

const EMPTY_STATE = Object.freeze({ adminReady: false, isAdmin: false, claims: null, accessError: null });
let state = EMPTY_STATE;
let authListener = null;
let requestVersion = 0;
let pendingRequest = null;
const subscribers = new Set();

function publish(nextState) {
  state = nextState;
  subscribers.forEach((subscriber) => subscriber());
}

function subscribe(subscriber) {
  subscribers.add(subscriber);
  if (!authListener) {
    try {
      authListener = onAuthStateChanged(getAuth(), (user) => {
        // Refresh the ID token so recently assigned Alpha claims are visible
        // immediately after sign-in and when the app first opens.
        void loadAccess(user, true, Boolean(user));
      }, () => {
        requestVersion += 1;
        pendingRequest = null;
        publish({ adminReady: true, isAdmin: false, claims: null, accessError: "auth-state-unavailable" });
      });
    } catch {
      publish({ adminReady: true, isAdmin: false, claims: null, accessError: "auth-state-unavailable" });
    }
  }
  return () => subscribers.delete(subscriber);
}

function getSnapshot() {
  return state;
}

async function loadAccess(user, force = false, forceTokenRefresh = false) {
  if (!user) {
    requestVersion += 1;
    pendingRequest = null;
    publish({ adminReady: true, isAdmin: false, claims: null, accessError: null });
    return;
  }

  const uid = user.uid;
  if (!force && state.adminReady && state.claims?.uid === uid) return;
  if (!forceTokenRefresh && pendingRequest?.uid === uid) return pendingRequest.promise;

  const version = ++requestVersion;
  publish({ adminReady: false, isAdmin: false, claims: null, accessError: null });

  const promise = (async () => {
    let tokenClaims = {};
    let localAppCheckUnavailable = false;
    try {
      const tokenResult = await user.getIdTokenResult(forceTokenRefresh);
      tokenClaims = tokenResult?.claims || {};

      let access;
      try {
        access = await getMyAdminAccess();
      } catch (accessError) {
        const isLocalhost = typeof window !== "undefined"
          && ["localhost", "127.0.0.1"].includes(window.location.hostname);
        // A Vite production preview on localhost still skips App Check. Keep
        // the signed Alpha claim visible for workspace navigation, while
        // making the unavailable server check explicit in the UI. This does
        // not authorize callable functions or Firestore access.
        if (!isLocalhost || tokenClaims.godAdmin !== true) throw accessError;
        localAppCheckUnavailable = true;
        access = {
          isAdmin: true,
          isGodAdmin: true,
          scopes: [],
          regionalScopes: {},
        };
      }

      if (version !== requestVersion || getAuth().currentUser?.uid !== uid) return;
      const claims = {
        ...tokenClaims,
        uid,
        admin: access.isAdmin === true,
        godAdmin: access.isGodAdmin === true,
        adminScopes: access.scopes || [],
        adminRegionalScopes: access.regionalScopes || {},
        adminRegions: access.regions || [],
      };
      publish({
        adminReady: true,
        isAdmin: access.isAdmin === true,
        claims,
        accessError: localAppCheckUnavailable ? "local-app-check-unavailable" : null,
      });
    } catch (error) {
      if (version !== requestVersion) return;
      if (import.meta.env.DEV) console.error("Failed to load admin access:", error);
      const isLocalhost = typeof window !== "undefined"
        && ["localhost", "127.0.0.1"].includes(window.location.hostname);
      publish({
        adminReady: true,
        isAdmin: false,
        claims: { ...tokenClaims, uid, admin: false },
        accessError: isLocalhost ? "local-app-check-unavailable" : error?.code || "access-check-failed",
      });
    }
  })();

  pendingRequest = { uid, promise };
  try {
    await promise;
  } finally {
    if (pendingRequest?.promise === promise) pendingRequest = null;
  }
}

export function refreshAdminAccess() {
  return loadAccess(getAuth().currentUser, true, true);
}

export function useAdminClaim() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { ...current, refreshClaims: refreshAdminAccess };
}
