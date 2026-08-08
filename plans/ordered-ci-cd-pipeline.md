# Plan — Ordered CI/CD pipeline: dev/PR → tests → merge → tests → deploy (2026-08-08)

## Goal
One ordered pipeline per repo so that merge-to-main and release-to-deploy only happen after the correct test stages pass, with the counterpart repo checked out at the same branch name (dev ↔ dev, main ↔ main).

## Flow
1. Push to `dev` OR open a PR (dev → main): run the test stages **in strict order** — 單元 → 整合 → e2e — they must all pass before merge.
2. After a merge to `main`: run the same stages again **in order**; only when all pass does `deploy` run.

## Changes
| Repo | File | Action | Description |
|------|------|--------|-------------|
| backend | `.github/workflows/ci.yml` | Rewrite | Jobs `unit` → `integration` (needs unit) → `e2e` (needs integration) → `deploy` (needs e2e, main only, so after `push dev`). Neither triggers. |
| backend | `.github/workflows/e2e.yml` | Delete | Folded into `ci.yml` |
| frontend | `.github/workflows/ci.yml` | Rewrite | Jobs `unit` (lint+build) → `e2e` (needs unit) → `deploy` (needs e2e, main only). No integration stage — frontend has no integration tests. |
| frontend | `.github/workflows/e2e.yml` | Delete | Folded into `ci.yml` |

## Triggers (both repos)
```yaml
on:
  push: { branches: [main, dev] }
  pull_request: { branches: [main] }
```
- `github.ref_name` in the E2E step keeps the counterpart matched: dev push/PR head = dev, main push = main.
- `deploy` job: `needs: e2e` + `if: github.ref == 'refs/heads/main'` — only ever runs after a green E2E chain on a merge.

## Merge enforcement
Workflows I create status checks; branch protection must be enabled in the GitHub repo settings to require those checks before merge (not something a YAML file can enforce on its own).

## Verification
- YAML syntax validated for both `ci.yml` files.
- Push both repos to `dev` and confirm the ordered dev pipeline; be careful about the required-check config for PR merges.