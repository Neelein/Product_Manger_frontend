# Ordered CI/CD pipeline (2026-08-08)

## What
Consolidated each repo's workflows into a single `ci.yml` with strictly ordered stages:
- backend: `unit` → `integration` → `e2e` → `deploy`
- frontend: `unit` (lint+build) → `e2e` → `deploy` (no integration tests exist for the frontend)

The pipeline triggers on push to `dev`/`main` and on PRs targeting `main`, so dev pushes and PRs run the suite; merged `main` runs the suite again, and only a green E2E chain allows `deploy`. The old `e2e.yml` files were removed (their content folded in).

## Why
The user wants deployment gated behind a full, ordered test chain both before merge (PR checks) and after merge (deploy), across frontend and backend, with the counterpart repo tested on its matching branch (dev ↔ dev, main ↔ main).

## Changes
- backend `.github/workflows/ci.yml`: `unit` (go test) → `integration` (`go test -tags=integration`, needs unit) → `e2e` (Playwright full-stack, needs integration; checkouts out frontend at `${{ github.ref_name }}`) → `deploy` (needs e2e, `if: main`). Deleted `e2e.yml`.
- frontend `.github/workflows/ci.yml`: `unit` (`npm ci && lint && build`) → `e2e` (needs unit; checkouts out backend at `${{ github.ref_name }}`) → `deploy` (needs e2e, `if: main`, `--prod` only). Deleted `e2e.yml`.
- Removed the Vercel dev-branch preview deploy: deploy now only happens post-merge (`main`), matching the new flow.

## Notes
- `github.ref_name` on PR = PR head branch (e.g. `dev`), on `main` push = `main`, so the counterpart stays branch-matched.
- To actually STOP merges until checks pass, branch protection in the GitHub repo settings must list `unit`/`integration`/`e2e` as required checks — workflow YAML can’t enforce that alone.

## Verification
- YAML syntax validated for both `ci.yml` files.
- Push to `dev` triggers the dev pipeline; a `main` merge triggers the full chain then deploy.