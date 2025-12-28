# Deployment Blockers Summary - wellnesscafe.net

## 🚨 Critical Blockers (Must Fix Before Deployment)

### 1. Environment Variables Point to Wrong Project - CRITICAL
**Status**: ❌ **BLOCKING**

**Issue**: 
- `.env` file exists but has **WRONG PROJECT ID**
- Points to `wellnesscafe-os` instead of `wellnesscafelanding`
- Functions URL is wrong: `wellnesscafe-os` instead of `wellnesscafelanding`
- Auth domain is wrong: `wellnesscafe-os.firebaseapp.com` instead of `wellnesscafelanding.firebaseapp.com`
- Production build will connect to wrong Firebase project

**Required Action**:
1. Create `.env.local` (or use `.env` if Vite is configured to read it)
2. Set all `VITE_FIREBASE_*` variables
3. Rebuild: `npm run build`
4. Deploy: `firebase deploy --only hosting`

**Required Variables** (CORRECT VALUES):
```
VITE_FIREBASE_API_KEY=AIzaSyDT9KZC5cxhQoyEOmMWdufsC-gJCx7O5yA
VITE_FIREBASE_AUTH_DOMAIN=wellnesscafelanding.firebaseapp.com  # FIX: was wellnesscafe-os
VITE_FIREBASE_PROJECT_ID=wellnesscafelanding  # FIX: was wellnesscafe-os
VITE_FIREBASE_STORAGE_BUCKET=wellnesscafelanding.firebasestorage.app  # FIX: was wellnesscafe-os
VITE_FIREBASE_MESSAGING_SENDER_ID=1022330574843
VITE_FIREBASE_APP_ID=1:1022330574843:web:cb618943891f1d6d0e1d5e
VITE_FIREBASE_MEASUREMENT_ID=G-4TGHRQB475
VITE_FIREBASE_FUNCTIONS_URL=https://us-central1-wellnesscafelanding.cloudfunctions.net  # FIX: was wellnesscafe-os
VITE_OPENAI_HAS_AUDIO=true
VITE_RAPIDAPI_KEY=c4a0609edcmshf9c6797bb339190p1903b1jsn9845dbe45f6d
```

**⚠️ CRITICAL**: Current `.env` has wrong project. Must update all `wellnesscafe-os` references to `wellnesscafelanding`.

---

### 2. Custom Domain Not Connected
**Status**: ❌ **BLOCKING**

**Issue**:
- `wellnesscafe.net` is not connected to Firebase Hosting
- Currently only accessible via `wellnesscafelanding.web.app`
- DNS and SSL setup required

**Required Action**:
1. Go to Firebase Console → Hosting → Add custom domain
2. Add `wellnesscafe.net` and `www.wellnesscafe.net`
3. Follow DNS verification steps (add A/AAAA or CNAME records)
4. Wait for SSL certificate (24-48 hours)

**Current Access**:
- ✅ Working: `https://wellnesscafelanding.web.app`
- ❌ Not working: `https://wellnesscafe.net`

---

## ⚠️ Important (Verify Before Deployment)

### 3. Firebase Secrets Status
**Status**: ⚠️ **UNKNOWN** - Needs Verification

**Required Secrets**:
- `OPENAI_API_KEY` - For AI features (multimodalChat, TTS, STT)
- `RAPIDAPI_KEY` - For resource search (if using RapidAPI)

**Check Command**:
```bash
firebase functions:secrets:access OPENAI_API_KEY
firebase functions:secrets:access RAPIDAPI_KEY
```

**Impact**: Functions will fail at runtime if secrets are missing.

---

## ✅ What's Already Working

- ✅ Firebase project configured: `wellnesscafelanding`
- ✅ All 9 Firebase Functions deployed and active
- ✅ CORS configured for `wellnesscafe.net` in functions
- ✅ Build system working (`dist/` exists)
- ✅ Firebase Hosting configured in `firebase.json`
- ✅ Dry run deployment successful

---

## 📋 Quick Fix Checklist

### Immediate Actions (30 minutes)

- [ ] **Get Firebase Config**
  - Firebase Console → Project Settings → General
  - Copy Firebase SDK configuration
  - Create `.env.local` with `VITE_FIREBASE_*` prefix

- [ ] **Rebuild with Env Vars**
  ```bash
  npm run build
  ```

- [ ] **Deploy to Default Domain First**
  ```bash
  firebase deploy --only hosting
  # Test at: https://wellnesscafelanding.web.app
  ```

### Domain Setup (24-48 hours)

- [ ] **Add Custom Domain**
  - Firebase Console → Hosting → Add custom domain
  - Add `wellnesscafe.net`

- [ ] **Configure DNS**
  - Follow Firebase instructions
  - Add A/AAAA or CNAME records

- [ ] **Wait for SSL**
  - SSL certificate provisioning: 24-48 hours
  - Firebase will notify when ready

### Verification (After Deployment)

- [ ] Test Firebase Auth
- [ ] Test AI features (Living Guide)
- [ ] Test resource search
- [ ] Test all critical user flows

---

## 🎯 Why You Can't Go Live Right Now

**Primary Reason**: Environment variables are not set for the production build.

**Secondary Reason**: Custom domain `wellnesscafe.net` is not connected to Firebase Hosting.

**Tertiary Concern**: Firebase secrets status unknown (may cause runtime failures).

---

## 💡 Solution Path

1. **Today (30 min)**: Set up `.env.local`, rebuild, deploy to default domain
2. **Today (1 hour)**: Connect custom domain, configure DNS
3. **Tomorrow**: Wait for SSL, verify deployment
4. **Ongoing**: Monitor function logs, test all features

---

**Bottom Line**: The app is **technically ready** but needs **configuration** (env vars + domain) before it can go live on `wellnesscafe.net`.

