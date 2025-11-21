# Security Guidelines for WellnessCafe OS

## 🔒 Protecting Your Code

### 1. Environment Variables
- **NEVER** commit `.env` files to version control
- Use `.env.example` as a template (no real values)
- All sensitive keys should use `VITE_` prefix for Vite to expose them
- Keep `.env` files local and share credentials securely

### 2. Git Repository Security

#### If using GitHub/GitLab:
1. **Make repository private:**
   - GitHub: Settings → General → Change visibility → Make private
   - GitLab: Settings → General → Visibility → Private

2. **Access Control:**
   - Only add collaborators you trust
   - Use branch protection rules for main/master
   - Require pull request reviews

3. **If repository was public:**
   - Rotate all API keys and secrets
   - Check git history for exposed secrets: `git log -p`
   - Consider using tools like `git-secrets` or `truffleHog`

### 3. Firebase Security

#### Firebase Console Settings:
1. Go to Firebase Console → Project Settings
2. **Restrict API keys:**
   - Application restrictions: HTTP referrers (web sites)
   - Add your domain(s) to allowed referrers
   - API restrictions: Restrict to specific Firebase APIs

3. **Firestore Security Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Add your security rules here
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

4. **Authentication:**
   - Enable only necessary auth providers
   - Set up email verification
   - Use strong password requirements

### 4. Code Security Checklist

- [ ] All `.env` files in `.gitignore`
- [ ] No hardcoded API keys in source code
- [ ] Firebase config uses environment variables
- [ ] Repository is private (if using Git)
- [ ] Access control configured
- [ ] Firebase API keys restricted
- [ ] Firestore security rules configured
- [ ] Authentication properly secured

### 5. Sharing Credentials Securely

**DO:**
- Use password managers (1Password, LastPass, Bitwarden)
- Share via encrypted channels (Signal, encrypted email)
- Use environment variable sharing tools (1Password Secrets Automation)

**DON'T:**
- Commit secrets to Git
- Share via unencrypted email/Slack
- Store in plain text files
- Post in public channels

### 6. Monitoring

- Monitor Firebase usage for unusual activity
- Set up alerts for API key usage
- Review access logs regularly
- Rotate keys periodically

### 7. If Secrets Are Exposed

1. **Immediately:**
   - Rotate all exposed keys
   - Revoke old keys
   - Check for unauthorized access

2. **Clean Git history:**
   ```bash
   # Remove file from history (use with caution)
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push (if necessary):**
   ```bash
   git push origin --force --all
   ```

## 🔐 Current Security Status

✅ Environment variables properly configured  
✅ `.gitignore` includes `.env` files  
✅ Firebase config uses `import.meta.env`  
✅ `.env.example` template created  

## 📝 Next Steps

1. Create your `.env` file from `.env.example`
2. Add your Firebase credentials to `.env`
3. If using Git, ensure repository is private
4. Configure Firebase security rules
5. Restrict Firebase API keys in console

