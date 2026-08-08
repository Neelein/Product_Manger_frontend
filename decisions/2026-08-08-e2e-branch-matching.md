# E2E checks branch-matching counterpart repo (2026-08-08)

## What
Changed the full-stack E2E workflows so each one checks out the counterpart repository at the same branch name as the workflow trigger (`${{ github.ref_name }}`) instead of a hardcoded ref.

## Why
Previously `frontend/e2e.yml` always checked out backend `main`, and `backend/e2e.yml` always checked out frontend `dev`. When feature work lived on `dev`, a dev push could be validated against stale `main` code (the session-rotation bug earlier was exactly this). Now dev pushes validate dev code and main merges validate main code.

## Changes
- `frontend/.github/workflows/e2e.yml`: backend checkout `ref: main` → `ref: ${{ github.ref_name }}`.
- `backend/.github/workflows/e2e.yml`: frontend checkout `ref: dev` → `ref: ${{ github.ref_name }}`.

## Notes
- Backend E2E already tested its own workspace code (branch-correct); only the frontend ref changed there.
- `workflow_dispatch` uses the manually selected branch for `github.ref_name`.

## Verification
- YAML syntax validated for both files.
- Pushed both repos to `dev` to confirm the pipeline (main optional).