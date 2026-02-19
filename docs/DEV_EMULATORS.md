# DEV: Firebase Emulators

## 1. Start Functions Emulator (functions only)

```bash
firebase emulators:start --only functions
```

## 2. Run Model Verify Script

```bash
cd functions && npm run verify:fireworks
```

## 3. Curl Test to aiSession

```bash
curl -s -X POST http://127.0.0.1:5001/wellnesscafelanding/us-central1/aiSession \
  -H "Content-Type: application/json" \
  -d '{"mode":"chat","messages":[{"role":"user","content":"Say hello in one sentence."}]}' | head -c 1200 && echo
```

## 4. See Which URL Frontend Is Using (browser console one-liner)

```javascript
import("/src/services/aiClient.js").then((m) => console.log(m.getResolvedFunctionsBaseUrl()));
```

## 5. What "MODEL_NOT_AVAILABLE" Means (plain English)

The model ID in your config is wrong or you don't have access to it. Either:
- The model doesn't exist (typo, deprecated, or wrong format)
- Your Fireworks account doesn't have access to that model
- Fix: Run `npm run verify:fireworks` in `functions/` and use model IDs from the closest matches

---

## Confirm Emulator Running

```bash
lsof -nP -iTCP:5001 -sTCP:LISTEN
```

## Note

`firebase emulators:status` is not a valid command.

## Models used

- **chat:** `FIREWORKS_MODEL_CHAT` / `fireworks.model_chat` — default: `accounts/fireworks/models/llama-v3-70b-instruct`
- **reasoning:** `FIREWORKS_MODEL_REASONING` / `fireworks.model_reasoning` — default: `accounts/fireworks/models/deepseek-r1`
- **format:** `accounts/fireworks/models/<name>`
