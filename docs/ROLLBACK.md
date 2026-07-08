# Rollback & Recovery

## Current Stable Reference Points

| Artifact | Value |
|----------|-------|
| Stable Commit | `2782433` |
| Stable Branch | `landing-stable` |
| Stable Tag | `landing-v1-stable` |
| Recovery Commit | `4095621` (stash — working tree snapshot) |
| Pre-Recovery Branch | `before-landing-recovery` |

## Rollback Commands

### Roll back to stable landing page (if working tree is modified):
```bash
git checkout landing-stable -- <file-paths>
```

### Restore from tag:
```bash
git checkout tags/landing-v1-stable -- <file-paths>
```

## Full Recovery Procedure

### If you need to restore the entire landing page from scratch:

```bash
# 1. Create a worktree for the recovery commit
git worktree add ../temp-recovery landing-stable

# 2. Inspect and build
cd ../temp-recovery
npm install && npm run build

# 3. Restore specific files to main project
cd /path/to/original/project
git restore --source=landing-stable \
  src/app/\(public\)/PremiumLandingPage.tsx \
  src/app/\(public\)/landing/LandingHero.tsx \
  src/app/\(public\)/landing/FinalScene.tsx \
  src/app/\(public\)/landing/CableSystem.tsx \
  src/app/\(public\)/landing/StationBookmarks.tsx \
  src/app/\(public\)/landing/StationSTAR.tsx \
  src/app/\(public\)/landing/StationCommunity.tsx \
  src/app/\(public\)/landing/StationSearch.tsx \
  src/app/\(public\)/landing/components/NotebookAsset.tsx \
  src/app/\(public\)/landing/useScrollOrchestrator.ts \
  src/app/globals.css \
  src/app/\(public\)/layout.tsx \
  src/app/\(public\)/page.tsx \
  src/components/LenisProvider.tsx

# 4. Commit and push
git commit -m "restore: landing page from stable tag"
git push origin main
```

## Emergency Recovery Checklist

- [ ] Determine the divergence point via `git reflog`
- [ ] Find the last known-good commit via `git log --oneline`
- [ ] Create a safety branch: `git branch emergency-backup`
- [ ] Create a worktree: `git worktree add ../recovery <commit>`
- [ ] Build and visually verify in the worktree
- [ ] Use `git restore --source=<commit> <files>` — never `reset --hard`
- [ ] Commit verified files
- [ ] Tag the recovery: `git tag -a <version>-recovered -m "<message>"`
- [ ] Push branch and tag
- [ ] Document what went wrong

## Common Mistakes & Fixes

| Mistake | Fix |
|---------|-----|
| `git stash drop` accidentally | `git fsck --lost-found` + `git show <dangling-commit>` |
| `git reset --hard` lost work | `git reflog` to find previous HEAD |
| Working tree overwritten | Use `git diff --stat` to identify changes before committing |
| Force push to remote | `git push --force origin <previous-hash>:main` (use sparingly) |

## Release Workflow

1. Ensure `main` builds: `npm run build`
2. Tag the release: `git tag -a <version> -m "<message>"`
3. Push the tag: `git push origin <version>`
4. Create a GitHub Release from the tag
