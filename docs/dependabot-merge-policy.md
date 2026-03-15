# Dependabot merge policy

## Do not edit Dependabot PRs unless necessary

Editing the PR body or commit messages can cause conflicts when Dependabot rebases. Prefer using Dependabot commands.

## Preferred flow for conflicts

- **Conflicts:** Comment `@dependabot rebase` to trigger a rebase
- **Corrupted / stuck:** Comment `@dependabot recreate` to recreate the PR

Avoid manual edits to dependency manifests or lockfiles in Dependabot PRs.

## Before merging

1. **Review changelog/release notes** for major version bumps
2. **Ensure lockfile is updated** — `package-lock.json` (or equivalent) should be included
3. **Run build and lint locally:**
   ```bash
   npm ci
   npm run build
   npm run lint
   ```
   For PRs touching `/functions`, also run:
   ```bash
   cd functions && npm ci && cd ..
   ```

## Grouped dependencies

Some dependencies (e.g. `minimatch`, `glob`, `brace-expansion`, `picomatch`, `micromatch`, `fast-glob`) are grouped so they update together. This avoids version mismatches when packages depend on each other. If a Dependabot PR says "These dependencies needed to be updated together," that is expected — merge as a single unit.

## PRs touching both root and `/functions`

If a Dependabot PR updates dependencies in both `/` and `/functions`:

1. Verify both `package-lock.json` files are updated
2. Run `npm ci` and `npm run build` in the repo root
3. Run `npm ci` in `functions/` (functions may not have a build script; ensure install succeeds)
