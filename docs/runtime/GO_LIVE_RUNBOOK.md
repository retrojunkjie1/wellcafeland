# Go-Live Runbook
## WellnessCafe OS Production Deployment

This runbook provides step-by-step instructions for deploying WellnessCafe OS to production (wellnesscafelanding Firebase project).

---

## Prerequisites

- Firebase CLI installed and authenticated: `firebase login`
- Node.js and npm installed
- Access to Firebase Console for wellnesscafelanding project
- DNS access for wellnesscafe.net domain

---

## Pre-Deployment Checklist

- [ ] All code changes committed and pushed
- [ ] Tests pass locally
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables configured (see Step 1)

---

## Step 1: Configure Environment Variables

Create or update `.env.production` (or `.env`) with the following variables for **wellnesscafelanding** project:

```bash
VITE_FIREBASE_API_KEY=<your-api-key>
VITE_FIREBASE_AUTH_DOMAIN=wellnesscafelanding.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=wellnesscafelanding
VITE_FIREBASE_STORAGE_BUCKET=wellnesscafelanding.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_FIREBASE_APP_ID=<your-app-id>
VITE_FIREBASE_MEASUREMENT_ID=<your-measurement-id>
```

**⚠️ CRITICAL:** Ensure `VITE_FIREBASE_PROJECT_ID=wellnesscafelanding` (not `wellnesscafe-os`)

---

## Step 2: Verify Firebase Project Configuration

Check `.firebaserc` has the correct default project:

```bash
cat .firebaserc
```

Should show:
```json
{
  "projects": {
    "default": "wellnesscafelanding",
    ...
  }
}
```

If incorrect, set it:
```bash
firebase use wellnesscafelanding
```

---

## Step 3: Run Pre-Deployment Checks

```bash
npm run predeploy:check
```

This script validates:
- `.firebaserc` default project matches `wellnesscafelanding`
- Environment variables match expected project ID
- `firebase.json` configuration is present

**If checks fail, fix the issues before proceeding.**

---

## Step 4: Build the Application

```bash
npm run build
```

Verify the `dist/` directory is created and contains:
- `index.html`
- `assets/` directory with bundled JS/CSS

---

## Step 5: Deploy to Firebase Hosting

### Option A: Using npm script (recommended)
```bash
npm run deploy
```

This runs the pre-deployment check automatically, then deploys.

### Option B: Manual deployment
```bash
firebase use wellnesscafelanding
firebase deploy --only hosting
```

---

## Step 6: Verify Deployment

1. Check Firebase Console → Hosting
2. Verify the new release is active
3. Test the deployed URL (e.g., `https://wellnesscafelanding.web.app`)
4. Run smoke tests (see `QA_SMOKE_TESTS.md`)

---

## Step 7: Connect Custom Domain (Firebase Console)

**Note:** This step requires Firebase Console access and DNS configuration.

### In Firebase Console:

1. Go to **Hosting** → **Add custom domain**
2. Enter: `wellnesscafe.net`
3. Follow DNS verification steps:
   - Add A records (provided by Firebase)
   - Add AAAA records (provided by Firebase)
   - Or add CNAME record if using subdomain
4. Wait for SSL certificate provisioning (can take minutes to hours)
5. Verify domain is active and SSL is enabled

### DNS Configuration (at your DNS provider):

For root domain (`wellnesscafe.net`):
- Add A records pointing to Firebase IPs
- Add AAAA records for IPv6

For subdomain (e.g., `www.wellnesscafe.net`):
- Add CNAME record: `www` → `wellnesscafelanding.web.app`

---

## Step 8: Configure Redirects (if needed)

If you want `www.wellnesscafe.net` to redirect to `wellnesscafe.net` (or vice versa):

1. Firebase Console → Hosting → Redirects
2. Add redirect rule:
   - Source: `www.wellnesscafe.net`
   - Destination: `wellnesscafe.net`
   - Type: Permanent (301)

Or update `firebase.json`:
```json
{
  "hosting": {
    "redirects": [
      {
        "source": "/",
        "destination": "https://wellnesscafe.net",
        "type": 301
      }
    ]
  }
}
```

---

## Rollback Procedure

If deployment causes issues, rollback using one of these methods:

### Method 1: Firebase Console (Recommended)

1. Go to Firebase Console → Hosting → Releases
2. Find the previous working release
3. Click **Roll back** or **Promote to live**

### Method 2: Firebase CLI

```bash
firebase hosting:clone <source-site-id> <target-site-id> --only hosting
```

Or redeploy previous version:
```bash
git checkout <previous-commit-hash>
npm run build
firebase deploy --only hosting
```

### Method 3: Manual Rollback

1. Checkout previous commit: `git checkout <previous-commit>`
2. Rebuild: `npm run build`
3. Redeploy: `firebase deploy --only hosting`

---

## Post-Deployment Verification

- [ ] Site loads at custom domain
- [ ] SSL certificate is active (green lock icon)
- [ ] Authentication works (login/logout)
- [ ] All navigation tabs work
- [ ] Tools load correctly
- [ ] No console errors
- [ ] Mobile safe areas work correctly
- [ ] API endpoints respond correctly

See `QA_SMOKE_TESTS.md` for detailed test checklist.

---

## Troubleshooting

### Issue: Wrong project deployed
- Check `.firebaserc`: `firebase use wellnesscafelanding`
- Check `.env.production`: `VITE_FIREBASE_PROJECT_ID=wellnesscafelanding`
- Run: `npm run predeploy:check`

### Issue: Build fails
- Check Node.js version matches `.nvmrc` (if present)
- Clear cache: `rm -rf node_modules dist && npm install`
- Check for TypeScript/ESLint errors: `npm run lint`

### Issue: Domain not connecting
- Verify DNS records are correct (use `dig` or `nslookup`)
- Wait for DNS propagation (can take up to 48 hours)
- Check Firebase Console for domain verification status

### Issue: SSL certificate pending
- Wait 24-48 hours for automatic provisioning
- Check Firebase Console → Hosting → Domains for status
- Ensure DNS records are correct

---

## Emergency Contacts

- Firebase Support: https://firebase.google.com/support
- DNS Provider Support: [Your DNS provider]
- Development Team: [Contact info]

---

## Notes

- Always run `npm run predeploy:check` before deploying
- Never deploy with `wellnesscafe-os` project ID in production
- Keep `.env.production` out of version control (use `.env.example`)
- Document any manual Firebase Console changes in deployment notes

## ADMIN ACCESS GRANTING (LOCAL)

### How to Grant Admin Access

1. **Create Service Account Key:**
   - Go to Firebase Console → Project Settings → Service accounts
   - Click "Generate new private key"
   - Save the JSON file to `.secrets/wc-admin.json` (or your preferred location)

2. **Set Environment Variable:**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=.secrets/wc-admin.json
   ```

3. **Grant Admin:**
   ```bash
   npm run grant:admin -- <email>
   # Example:
   npm run grant:admin -- aleggi007@gmail.com
   ```

4. **User Must Re-authenticate:**
   - User must sign out and sign back in for custom claims to take effect
   - Or refresh their ID token: `await auth.currentUser.getIdToken(true)`

### Security Notes

- Service account JSON files are gitignored (`.secrets/`, `*.privatekey.json`, `serviceAccount*.json`)
- Never commit service account keys
- Admin access is enforced via Firebase custom claims (`admin: true`)
- Firestore security rules enforce admin-only access to admin collections

