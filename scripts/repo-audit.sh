#!/usr/bin/env sh
# Repo audit: detect tracked paths that should be ignored (generated artifacts, secrets, etc.)
# Exit non-zero if any offending paths are found.
# POSIX sh-compatible for macOS.

set -e

TRACKED=$(git ls-files --cached 2>/dev/null || true)

# Build list of offenders: grep for bad patterns, exclude .env.example
OFFENDERS=$(echo "$TRACKED" | grep -E '^\.firebase/|^dist/|^build/|^coverage/|node_modules/|\.log$|^\.DS_Store|^\.vite/|^\.cache/|^\.turbo/|^\.next/|^\.nuxt/|^out/|^tmp/|^temp/|\.local$|\.pem$|\.key$|serviceAccount.*\.json' 2>/dev/null || true)
ENV_BAD=$(echo "$TRACKED" | grep -E '^\.env$|^\.env\.' 2>/dev/null | grep -v '^\.env\.example$' || true)
VSCODE_BAD=$(echo "$TRACKED" | grep '^\.vscode/' 2>/dev/null | grep -v '^\.vscode/extensions\.json$' || true)
OFFENDERS=$(printf '%s\n%s\n%s' "$OFFENDERS" "$ENV_BAD" "$VSCODE_BAD" | sort -u | grep -v '^$' || true)

echo "=== Repo audit: checking for tracked accidentals ==="
echo ""

if [ -n "$OFFENDERS" ]; then
  echo "ERROR: The following tracked paths should be ignored:"
  echo "$OFFENDERS" | sed 's/^/  /'
  echo ""
  echo "Run: git rm -r --cached <path> to untrack (files stay on disk)"
  exit 1
fi

echo "OK: No tracked accidentals found."
exit 0
