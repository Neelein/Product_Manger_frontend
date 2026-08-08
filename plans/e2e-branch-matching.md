# Plan — E2E checks the branch-matching counterpart repo (2026-08-08)

## Goal
Make the full-stack E2E workflows check out the counterpart repository at the SAME branch name as the workflow trigger, so:
- push to `dev` → E2E tests `dev`-branch code
- merge to `main` → E2E tests `main`-branch code

## Changes
| File | Action | Description |
|------|--------|-------------|
| `frontend/.github/workflows/e2e.yml` | Modify | Backend checkout `ref: main` → `ref: ${{ github.ref_name }}` |
| `backend/.github/workflows/e2e.yml` | Modify | Frontend checkout `ref: dev` → `ref: ${{ github.ref_name }}` |

## Result matrix
| Trigger | Tested combo |
|---------|--------------|
| frontend push `dev` | frontend dev + backend dev |
| frontend push `main` | frontend main + backend main |
| backend push `dev` | backend dev (own) + frontend dev |
| backend push `main` (post-merge) | backend main (own) + frontend main |

## Verification
- YAML syntax validation of both workflow files.
- Push each repo to `dev` and watch the GitHub Action run (main run optional).