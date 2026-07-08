# Git Workflow

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `landing-stable` | Stable landing page recovery point |
| `before-landing-recovery` | Pre-recovery backup (July 8, 2026) |

## Tags

| Tag | Commit | Description |
|-----|--------|-------------|
| `landing-v1-stable` | `2782433` | Stable cinematic landing page baseline |

## Workflow Rules

1. **Never force push to main** — always create a new commit
2. **Before destructive operations**, create a safety branch
3. **Recovery branches** are created from the recovery commit, not checked out
4. **Worktrees** (`git worktree add`) are preferred for safe inspection of other commits
5. **No history rewriting** — no rebase, no amend, no reset --hard

## Safe Cleanup Workflow

```
1. Create safety branch:         git branch before-<operation>
2. Make changes in working tree
3. Run typecheck + lint + build: npm run typecheck && npm run lint && npm run build
4. If ANY test fails:            git checkout -- <changed-files>
5. Stage and commit:             git add <files> && git commit -m "<message>"
6. Push:                         git push origin main
```

## Recovery Workflow

```
1. Identify recovery commit:     git log --oneline | grep <description>
2. Verify commit exists:         git cat-file -t <hash>
3. Verify content:               git diff --stat <base> <recovery>
4. Create worktree:              git worktree add ../recovery-copy <recovery-hash>
5. Build and verify in worktree
6. Restore files:                git restore --source=<recovery-hash> <file-paths>
7. Commit restored files
8. Remove worktree:              git worktree remove ../recovery-copy
```
