# Firebase Functions Setup

## Quick Start

1. **Install dependencies:**
   ```bash
   cd functions
   npm install
   ```

2. **Set up Firebase (if not already done):**
   ```bash
   firebase login
   firebase init functions
   ```

3. **Configure API Keys:**

   **Production: store provider keys in Firebase Secret Manager:**
   ```bash
   firebase functions:secrets:set OPENAI_API_KEY
   ```
   The deployed AI functions bind this secret by name. Firebase prompts for the value; do not put it in source control or a command argument. Deploy the Functions after creating or rotating the secret.

   **Local development:**
   Create a `.env` file in the `functions/` folder:
   ```
   OPENAI_API_KEY=your-key-here
   ```

4. **Run locally with emulators:**
   ```bash
   firebase emulators:start --only functions
   ```
   This will start the functions emulator on `http://127.0.0.1:5001`

5. **Deploy to Firebase:**
   ```bash
   firebase deploy --only functions
   ```

## Frontend Configuration

After deploying, update your frontend `.env` file:

**For deployed functions:**
```
VITE_FIREBASE_FUNCTIONS_URL=https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/aiSession
```

**For local emulator:**
```
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_FUNCTIONS_REGION=us-central1
```

The Vite proxy will automatically forward `/aiSession` requests to your Firebase Functions.

## Testing

Once running, test the endpoint:
```bash
curl -X POST http://127.0.0.1:5001/YOUR-PROJECT-ID/us-central1/aiSession \
  -H "Content-Type: application/json" \
  -d '{"mode":"templates"}'
```

## Alpha Owner bootstrap (one-time production action)

The Alpha Owner claim is deliberately not self-service. Only the trusted Firebase project owner should run this once, for the verified account that owns God-Eye. It uses Google Application Default Credentials and never accepts a password or prints claim values. Do not run it against an emulator or a different Firebase project.

```bash
gcloud auth application-default login
cd functions
GCLOUD_PROJECT=wellnesscafelanding \
CONFIRM_ALPHA_OWNER_EMAIL='owner@example.com' \
node scripts/setAlphaOwnerClaim.cjs 'owner@example.com'
```

Replace `owner@example.com` in both places with the exact verified Alpha Owner email. The duplicate email is an explicit confirmation guard. After a successful confirmation, sign out and back in (or refresh the Firebase ID token), then open `/admin/roles`. This grants root administrator authority, so never use a delegated administrator's address. The bootstrap script does not create regular admin assignments; the Alpha Owner assigns narrowly scoped, optionally regional roles through the protected screen.
