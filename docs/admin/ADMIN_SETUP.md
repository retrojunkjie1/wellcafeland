# Admin Setup Guide

## Granting Admin Access

### Prerequisites

1. Create `.secrets` directory:
   ```bash
   mkdir -p .secrets
   ```

2. Download service account JSON key:
   - Go to Firebase Console → Project Settings → Service accounts
   - Click "Generate new private key"
   - Save the JSON file to `.secrets/wc-admin.json`

3. Set environment variables:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="$PWD/.secrets/wc-admin.json"
   export FIREBASE_PROJECT_ID="wellnesscafelanding"
   ```

### Grant Admin

```bash
npm run grant:admin -- <email>
```

Example:
```bash
npm run grant:admin -- aleggi007@gmail.com
```

Or use the shortcut:
```bash
npm run grant:admin:aleggi
```

### Notes

- Service account JSON files are gitignored (`.secrets/`, `*.privatekey.json`, `serviceAccount*.json`)
- Never commit service account keys
- Admin access is enforced via Firebase custom claims (`admin: true`)
- User must sign out and sign back in for custom claims to take effect

