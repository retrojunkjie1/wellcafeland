## Description

<!-- Brief description of changes -->

## Pre-merge checklist

- [ ] **No secrets**: No API keys, tokens, passwords, or credentials in code or config
- [ ] **No PHI**: No patient names, treatment-facility identifiers, or protected health information
- [ ] **No internal transcripts**: No agent/assistant conversation logs or session dumps
- [ ] **No local paths**: No filesystem paths (e.g. `/Users/...`, `C:\...`) in code or docs
- [ ] **No raw logs**: No unredacted logs containing PII, tokens, or internal data

## Security Impact

<!-- Describe any security impact. Use "None" if no security-relevant changes. -->

## Data Impact

<!-- Describe any impact on user data, PHI, or logging. Use "None" if no data-relevant changes. -->

## Environment variables touched

<!-- List any env vars added, removed, or changed. Use "None" if none. -->

---

## Bot PR checklist (Dependabot / Renovate)

If this PR was opened by a bot:

- [ ] Package manager and lockfile are consistent (`package-lock.json` present and updated)
- [ ] Ran `npm ci` (or equivalent) and `npm run build` successfully
- [ ] No code changes beyond dependency manifests and lockfiles
- [ ] If conflicts exist, use `@dependabot rebase` or `@dependabot recreate` — do not manually edit
