# RapidAPI Key Setup

The RapidAPI key is used for **global resource search** (RealHelp workspace, directory search). Every environment that needs it must have access.

## Environments

| Environment | Where to set | How |
|-------------|--------------|-----|
| **Production (Firebase Functions)** | Firebase Secret Manager | `firebase functions:secrets:set RAPIDAPI_KEY` |
| **Local emulator (Functions)** | `functions/.env` | `RAPIDAPI_KEY=your-key` |
| **Client (Vite dev)** | Root `.env` | `VITE_RAPIDAPI_KEY=your-key` |

## Production

```bash
firebase functions:secrets:set RAPIDAPI_KEY
# Enter your key when prompted
```

Deployed functions read from Secret Manager automatically.

## Local Emulator

1. Copy `functions/.env.example` to `functions/.env`
2. Add: `RAPIDAPI_KEY=your-rapidapi-key-here`
3. Optional: `RAPIDAPI_HOST=real-time-web-search.p.rapidapi.com` (default if omitted)
4. If Secret Manager fetch fails (e.g. no `gcloud auth`), the emulator falls back to `process.env.RAPIDAPI_KEY` from `functions/.env`

## Client (dev fallback + health checks)

The client uses `VITE_RAPIDAPI_KEY` for:
- Fallback when the Firebase Function fails (e.g. emulator down)
- Health check (`checkRapidAPI`)
- System status panel

1. Copy `/.env.example` to `/.env`
2. Add: `VITE_RAPIDAPI_KEY=your-rapidapi-key-here`

**Note:** In production, the primary path is the Firebase Function (server-side). The client fallback is mainly for local dev when the Function may not be running.

## Quick setup (all environments)

```bash
# 1. Production (one-time)
firebase functions:secrets:set RAPIDAPI_KEY

# 2. functions/.env (for emulator)
echo "RAPIDAPI_KEY=your-key" >> functions/.env
echo "RAPIDAPI_HOST=real-time-web-search.p.rapidapi.com" >> functions/.env

# 3. Root .env (for client dev)
echo "VITE_RAPIDAPI_KEY=your-key" >> .env
```
