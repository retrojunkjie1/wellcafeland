# Setup Guide: Global Resource Search

This guide explains how to set up the Global Resource Search feature that powers the Housing, Government Assistance, Grants, Programs, and other directory pages.

## Backend Setup (Firebase Functions)

### 1. Set RapidAPI Key as Secret

The RapidAPI key is stored as a Firebase Functions secret for security:

```bash
firebase functions:secrets:set RAPIDAPI_KEY
```

When prompted, enter your RapidAPI key:
```
c4a0609edcmshf9c6797bb339190p1903b1jsn9845dbe45f6d
```

### 2. Deploy the Function

Deploy the new `globalResourceSearch` function:

```bash
firebase deploy --only functions:globalResourceSearch
```

Or deploy all functions:

```bash
firebase deploy --only functions
```

### 3. Verify Deployment

After deployment, the function will be available at:
```
https://us-central1-wellnesscafelanding.cloudfunctions.net/globalResourceSearch
```

## Frontend Setup

### Environment Variables

Ensure your `.env` file has:

```env
VITE_FIREBASE_FUNCTIONS_URL=https://us-central1-wellnesscafelanding.cloudfunctions.net
```

If not set, the frontend will use the default URL.

## How It Works

1. **User enters a search query** in any directory page (Housing, Government Assistance, Grants, Programs, etc.)

2. **Frontend calls** `searchResources()` from `src/services/resourceSearch.js`

3. **Service makes POST request** to Firebase Function `/globalResourceSearch` with:
   - `query`: The search text
   - `domain`: The directory type (e.g., "housing", "government_assistance", "grants", "programs")
   - `region`: Optional region filter
   - `category`: Optional category filter

4. **Backend function**:
   - Normalizes the query based on domain (adds context like "sober living" for housing)
   - Calls RapidAPI real-time web search
   - Normalizes and returns results

5. **Frontend displays** results with:
   - Loading states
   - Error messages (if search fails)
   - Empty states (if no results found)
   - The actual query that was searched

## Directory Pages

The following directory pages use this search:

- **Housing Directory** (`/directory/housing`)
- **Government Assistance** (`/directory/assistance`)
- **Grants & Funding** (`/directory/grants`)
- **Programs & Groups** (`/directory/programs`)
- **Providers** (`/directory/providers`)
- **Hotlines & Crisis** (`/directory/hotlines`)

Each page:
- Shows a default query on load
- Allows users to search with custom queries
- Supports region and category filters
- Displays real-time results from RapidAPI
- Shows clear error messages if search fails
- Shows the actual query that was searched

## Testing

1. Navigate to any directory page (e.g., `/directory/housing`)
2. You should see a default query loaded automatically
3. Try searching with a custom query
4. Try changing filters (region, category)
5. Verify results appear from real web sources

## Troubleshooting

### Function returns 503 error
- Check that `RAPIDAPI_KEY` secret is set: `firebase functions:secrets:access RAPIDAPI_KEY`
- Redeploy the function after setting the secret

### No results appear
- Check browser console for errors
- Verify the function URL is correct in `.env`
- Check that RapidAPI key is valid and has remaining quota

### CORS errors
- The function has `cors: true` configured, so CORS should work automatically
- If issues persist, check Firebase Functions logs

## API Response Format

Success response:
```json
{
  "ok": true,
  "results": [
    {
      "id": "unique-id",
      "title": "Resource Title",
      "description": "Resource description",
      "url": "https://example.com",
      "source": "example.com",
      "snippet": "Additional snippet text"
    }
  ],
  "query": "The actual query that was searched"
}
```

Error response:
```json
{
  "ok": false,
  "error": "Human-readable error message",
  "details": "Technical details (optional)"
}
```

