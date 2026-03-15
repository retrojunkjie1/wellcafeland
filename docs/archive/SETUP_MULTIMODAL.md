# Multimodal Wellness Engine Setup Guide

## 1. Environment Variables for Frontend

Add these to your `.env` file (in the project root):

```bash
# Multimodal Wellness Engine Configuration
VITE_OPENAI_HAS_AUDIO=true
VITE_FIREBASE_FUNCTIONS_URL=https://us-central1-wellnesscafelanding.cloudfunctions.net
```

**Note:** The `.env` file is gitignored, so you'll need to add these manually.

## 2. Firebase Functions Configuration

### Set OpenAI API Key as a Secret

Firebase Functions v2 uses secrets for sensitive data. Set the OpenAI API key:

```bash
cd functions
firebase functions:secrets:set OPENAI_API_KEY
```

When prompted, paste your OpenAI API key.

### Verify Secret is Set

```bash
firebase functions:secrets:access OPENAI_API_KEY
```

## 3. Install Dependencies

Make sure the OpenAI package is installed in functions:

```bash
cd functions
npm install
```

## 4. Deploy Firebase Functions

Deploy the multimodal functions:

```bash
cd functions
firebase deploy --only functions:multimodalChat,functions:multimodalTts,functions:multimodalStt
```

Or deploy all functions:

```bash
firebase deploy --only functions
```

## 5. Verify Deployment

After deployment, test the endpoints:

```bash
# Test chat endpoint
curl -X POST https://us-central1-wellnesscafelanding.cloudfunctions.net/multimodalChat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}],"mode":"default"}'
```

## 6. Troubleshooting

### If functions fail with "OPENAI_API_KEY not set":
- Verify the secret is set: `firebase functions:secrets:access OPENAI_API_KEY`
- Redeploy functions after setting the secret
- Check Firebase Console > Functions > Configuration for environment variables

### If frontend can't connect:
- Verify `VITE_FIREBASE_FUNCTIONS_URL` matches your Firebase project region
- Check browser console for CORS errors
- Ensure functions are deployed and accessible

### If audio features don't work:
- Verify `VITE_OPENAI_HAS_AUDIO=true` is in `.env`
- Restart dev server after adding env variable
- Check browser console for errors

## 7. Testing the Features

1. **Chat with Voice Input:**
   - Open chat, click mic button
   - Speak your message
   - Should transcribe and send

2. **Voice Responses:**
   - Send a message in chat
   - Click speaker icon on assistant response
   - Should play audio

3. **Breathing Tool:**
   - Open Breathing tool from Explore
   - Should generate dynamic plan
   - Click "Play guidance" for audio

4. **Grounding Tool:**
   - Open Grounding tool
   - Should show engine-generated steps
   - Audio guidance available

5. **Education Module:**
   - Open Education from Explore
   - Select a topic
   - Should show dynamic content
   - "Read to me" button for audio

## 8. Security Notes

- Never commit `.env` file
- Never commit OpenAI API keys
- Use Firebase Secrets for backend keys
- Use environment variables for frontend config (prefixed with `VITE_`)

