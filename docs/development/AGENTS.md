# Agent instructions (Cursor / AI assistants)

Guidance for AI agents and developers working in this repository.

## Security + Privacy operating rules

- **Never paste agent transcripts** into PR bodies, commits, or docs
- **Never commit secrets** — no API keys, tokens, or credentials in code or config
- **Never log tokens** — avoid logging auth tokens, API keys, or session identifiers
- **Treat treatment-facility and patient-related data as sensitive** — no PHI in commits, logs, or PRs
- **External URL fetching** — must be allowlisted and SSRF-protected (policy; implementation follows existing patterns)
