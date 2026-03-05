# Emulator Safety

## Non-Negotiable

**When emulators show "Non-emulated services will affect production", do not call non-emulated services.**

## What We Emulate

- **Functions** (port 5001)
- **Firestore** (port 8080)
- **Auth** (port 9099) — used for dev anonymous sign-in so /resources reads succeed

## Local Verify

1. **Start emulators:**
   ```bash
   firebase emulators:start --only functions,firestore,auth
   ```

2. **Start frontend:**
   ```bash
   npm run dev
   ```

3. **Emulator UI:** http://127.0.0.1:4000/

4. **Verify:**
   - `aiSession` should show in emulator UI
   - Firestore should be connected via emulator
   - "Connection issue" banners disappear when emulators are running and `VITE_USE_EMULATORS=true`
   - `/resources` no longer shows "Missing or insufficient permissions" when user is authenticated (signed-out users will see permissions error—expected)
   - `aiSession` returns a real response when `OPENAI_API_KEY` is set in `functions/.env`
   - `globalResourceSearch` uses RapidAPI when `RAPIDAPI_KEY` is in `functions/.env` (or Secret Manager in production)
