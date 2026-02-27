// src/services/authBootstrap.js
// Ensures a Firebase user session (anonymous) in emulator mode so aiSession has a valid token.

import { getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth";

/**
 * Bootstrap anonymous auth when no user exists.
 * Used in emulator mode so aiSession always has a valid token.
 * @returns {Promise<import("firebase/auth").User|null>} The current or newly created user
 */
export const bootstrapAnonymousAuth = async () => {
  const auth = getAuth();
  if (auth.currentUser) return auth.currentUser;

  const user = await new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u || null);
    });
  });

  if (user) return user;

  const cred = await signInAnonymously(auth);
  return cred.user;
};
