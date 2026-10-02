import { useSyncExternalStore } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getMyAdminAccess } from "@/services/adminAuthorization";

const EMPTY_STATE = Object.freeze({ adminReady: false, isAdmin: false, claims: null });
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
        void loadAccess(user, true);
      }, () => {
        requestVersion += 1;
        pendingRequest = null;
        publish({ adminReady: true, isAdmin: false, claims: null });
      });
    } catch {
      publish({ adminReady: true, isAdmin: false, claims: null });
    }
  }
  return () => subscribers.delete(subscriber);
}

function getSnapshot() {
  return state;
}

async function loadAccess(user, force = false) {
  if (!user) {
    requestVersion += 1;
    pendingRequest = null;
    publish({ adminReady: true, isAdmin: false, claims: null });
    return;
  }

  const uid = user.uid;
  if (!force && state.adminReady && state.claims?.uid === uid) return;
  if (pendingRequest?.uid === uid) return pendingRequest.promise;

  const version = ++requestVersion;
  publish({ adminReady: false, isAdmin: false, claims: null });

  const promise = (async () => {
    let tokenClaims = {};
    try {
      const tokenResult = await user.getIdTokenResult(false);
      tokenClaims = tokenResult?.claims || {};

      let access;
      try {
        access = await getMyAdminAccess();
      } catch (accessError) {
        // Local development may run a newer UI against Functions that have
        // not yet been deployed. This fallback affects navigation only; server
        // callables and Firestore rules remain the authorization boundary.
        if (!import.meta.env.DEV) throw accessError;
        access = {
          isAdmin: tokenClaims.godAdmin === true,
          isGodAdmin: tokenClaims.godAdmin === true,
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
      publish({ adminReady: true, isAdmin: access.isAdmin === true, claims });
    } catch (error) {
      if (version !== requestVersion) return;
      if (import.meta.env.DEV) console.error("Failed to load admin access:", error);
      publish({ adminReady: true, isAdmin: false, claims: null });
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
  return loadAccess(getAuth().currentUser, true);
}

export function useAdminClaim() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { ...current, refreshClaims: refreshAdminAccess };
}
