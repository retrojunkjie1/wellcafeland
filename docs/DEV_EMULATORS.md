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

### If 404 MODEL_NOT_AVAILABLE: Use Deployments Resource Name

Serverless models can return 404 if not deployed in your region. Use **on-demand deployments** instead:

1. In Fireworks Console, create a deployment for your model.
2. Copy the deployment resource name: `accounts/<account>/deployments/<id>`
3. Set in `functions/.env`:
   ```
   FIREWORKS_TARGET_CHAT=accounts/wellnesscafe/deployments/<your-chat-deployment-id>
   FIREWORKS_TARGET_REASONING=accounts/wellnesscafe/deployments/<your-reasoning-deployment-id>
   ```
4. Restart the emulator. The `model` field in Fireworks requests accepts both `accounts/.../models/...` and `accounts/.../deployments/...`.

### DEPLOYMENT_WARMING (503)

When deployments are scaled to zero, Fireworks returns `DEPLOYMENT_SCALING_UP`. The backend retries up to 4 times with backoff. If still warming after retries, it returns `DEPLOYMENT_WARMING` with `Retry-After: 60`. Tell users to wait ~60 seconds and retry.

---

## Confirm Emulator Running

```bash
lsof -nP -iTCP:5001 -sTCP:LISTEN
```

## Note

`firebase emulators:status` is not a valid command.

## Models / Deployments used

- **chat:** `FIREWORKS_TARGET_CHAT` (preferred) or `FIREWORKS_MODEL_CHAT` — default: `accounts/fireworks/models/llama-v3-70b-instruct`
- **reasoning:** `FIREWORKS_TARGET_REASONING` (preferred) or `FIREWORKS_MODEL_REASONING` — default: `accounts/fireworks/models/deepseek-r1`
- **formats:** `accounts/<...>/models/<name>` or `accounts/<...>/deployments/<id>`
