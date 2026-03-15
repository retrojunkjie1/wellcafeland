# Deployment Checklist - Fix Internet Connection Issues

## Issues Fixed

1. ✅ **Mobile Menu on Directory Pages** - Added `/directory` routes to `isOSRoute` check
2. ✅ **API Connection Errors** - Fixed `multimodalClient.js` to use direct `fetch` instead of `apiFetch`
3. ✅ **Better Error Messages** - Added network error detection and clearer messages

## Required Steps to Deploy

### 1. Set RapidAPI Key as Firebase Secret

```bash
firebase functions:secrets:set RAPIDAPI_KEY
```

When prompted, enter:
```
c4a0609edcmshf9c6797bb339190p1903b1jsn9845dbe45f6d
```

### 2. Deploy Firebase Functions

Deploy the global resource search function:

```bash
firebase deploy --only functions:globalResourceSearch
```

Or deploy all functions:

```bash
firebase deploy --only functions
```

### 3. Verify Function is Live

After deployment, test the function:

```bash
curl -X POST https://us-central1-wellnesscafelanding.cloudfunctions.net/globalResourceSearch \
  -H "Content-Type: application/json" \
  -d '{"query":"grants for addiction treatment","domain":"grants"}'
```

You should get a JSON response with results.

### 4. Check Environment Variables

Ensure your `.env` file has:

```env
VITE_FIREBASE_FUNCTIONS_URL=https://us-central1-wellnesscafelanding.cloudfunctions.net
VITE_OPENAI_HAS_AUDIO=true
```

### 5. Verify Firebase Functions are Deployed

Check Firebase Console:
- Go to Firebase Console > Functions
- Verify `globalResourceSearch`, `multimodalChat`, `multimodalTts`, `multimodalStt` are deployed
- Check that they show "Active" status

### 6. Test in Browser

1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to a directory page (e.g., `/directory/grants`)
4. Try a search
5. Check the Network tab for:
   - Request to `globalResourceSearch`
   - Response status (should be 200)
   - Response body (should have `ok: true` and `results` array)

## Troubleshooting

### "We couldn't reach the search engine right now"

**Possible causes:**
1. Function not deployed - Run `firebase deploy --only functions:globalResourceSearch`
2. RapidAPI key not set - Run `firebase functions:secrets:set RAPIDAPI_KEY`
3. CORS issue - Check function has `cors: true` in config
4. Network issue - Check browser console for CORS or network errors

### "Network connection failed"

**Possible causes:**
1. No internet connection
2. Firewall blocking requests
3. Function URL incorrect - Check `VITE_FIREBASE_FUNCTIONS_URL` in `.env`
4. Function not deployed or inactive

### Tools Not Returning Data

**Check:**
1. Browser console for errors
2. Network tab for failed requests
3. Firebase Functions logs: `firebase functions:log`
4. Verify `multimodalChat` function is deployed
5. Verify `OPENAI_API_KEY` secret is set

### Mobile Menu Not Showing

**Fixed:** Directory pages now included in `isOSRoute` check. Menu button should appear on all pages.

## Quick Test Commands

```bash
# Check if functions are deployed
firebase functions:list

# Check function logs
firebase functions:log --only globalResourceSearch

# Test function locally (if using emulator)
firebase emulators:start --only functions
```

## Next Steps After Deployment

1. Test each directory page:
   - `/directory/housing`
   - `/directory/assistance`
   - `/directory/grants`
   - `/directory/programs`

2. Test tools:
   - Breathing tool
   - Grounding tool
   - Self-Surgeon tool
   - Education module

3. Test mobile menu on all pages

4. Verify search returns real results from RapidAPI

