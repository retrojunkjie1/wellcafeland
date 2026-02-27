# No-Secrets Check

Run this checklist and grep commands before committing or opening a PR.

## Manual checklist

- [ ] No `.env`, `.env.local`, or `.env.*` (except `.env.example`) staged
- [ ] No API keys, tokens, or passwords in code
- [ ] No PHI or patient-identifiable data
- [ ] No agent transcripts or session dumps in PR body or commits
- [ ] No local filesystem paths (e.g. `/Users/...`) in code or docs

## Grep commands (run from repo root)

```bash
# API keys / tokens (adjust patterns as needed)
rg -i "api[_-]?key\s*=\s*['\"]?[a-zA-Z0-9_-]{20,}" --type-add 'code:*.{js,jsx,ts,tsx,json}' -t code . 2>/dev/null || true
rg -i "secret\s*=\s*['\"][^'\"]+['\"]" --type-add 'code:*.{js,jsx,ts,tsx,json}' -t code . 2>/dev/null || true

# Common credential patterns
rg -i "password\s*=\s*['\"][^'\"]+['\"]" --type-add 'code:*.{js,jsx,ts,tsx,json}' -t code . 2>/dev/null || true
rg "sk-[a-zA-Z0-9]{20,}" . 2>/dev/null || true

# Firebase / Google (likely false positives in config - verify)
rg "AIza[0-9A-Za-z_-]{35}" . 2>/dev/null || true
```

**Note:** These greps may yield false positives (e.g. placeholder strings). Manually verify any matches before committing.
