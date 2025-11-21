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

   **Option A: Using Firebase Functions config (recommended for production):**
   ```bash
   firebase functions:config:set fireworks.api_key="YOUR_FIREWORKS_KEY"
   # OR
   firebase functions:config:set openai.api_key="YOUR_OPENAI_KEY"
   ```

   **Option B: Using environment variables (for local development):**
   Create a `.env` file in the `functions/` folder:
   ```
   FIREWORKS_API_KEY=your-key-here
   # OR
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

