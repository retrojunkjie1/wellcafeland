/**
 * DEV-only: ensure a user is signed in for Firestore emulator.
 * Auth emulator is connected in firebase.js when VITE_USE_EMULATORS=true.
 * Uses bootstrapAnonymousAuth for consistent anonymous auth.
 * Returns Promise<boolean>: true if signed-in, false otherwise. Never throws.
 */
import { bootstrapAnonymousAuth } from "@/services/authBootstrap"

let _resolved = null

export function ensureDevAuth() {
  if (import.meta.env.PROD) return Promise.resolve(true)
  if (import.meta.env.VITE_USE_EMULATORS !== "true") return Promise.resolve(true)
  if (typeof window === "undefined") return Promise.resolve(true)

  if (_resolved !== null) return _resolved

  _resolved = bootstrapAnonymousAuth()
    .then((user) => !!user)
    .catch((err) => {
      console.warn("[ensureDevAuth] Anonymous sign-in failed:", err?.message)
      return false
    })
  return _resolved
}
