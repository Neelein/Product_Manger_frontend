# Plan — Vercel CI/CD (2026-08-06)

## Overview

Deploy the frontend to Vercel with GitHub Actions. Only the frontend goes to Vercel; the Go backend stays on the self-hosted server. The frontend calls relative `/api` and `/media` paths, so `vercel.json` rewrites proxy them server-side to `http://neeleindev.com:8090`, keeping the browser same-origin so the SameSite Lax session cookie keeps working without CORS changes.

## Files

| File | Action | Description |
|------|--------|-------------|
| `vercel.json` | New | Rewrites `/api/*` and `/media/*` to `http://neeleindev.com:8090` |
| `.github/workflows/ci.yml` | New | Lint + build on push to `dev` and PR to `main` |
| `.github/workflows/deploy.yml` | New | Vercel deploy on push to `main` (prod) and `dev` (preview) |
| `.gitignore` | Modify | Ignore `.vercel/` (contains org/project IDs) |
| `plans/vercel-cicd.md` | New | This file |
| `decisions/2026-08-06.md` | New | Decision record |

## Deployment model

- Push to `main` → `vercel --prod` (production deployment)
- Push to `dev` → preview deployment (no `--prod`)
- `vercel-action@v42` (amondnet) runs the Vite build itself using the project's Framework Preset
- Required GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

## Verification

- Local: `npm run lint` + `npm run build`
- After merge: push to `dev` triggers CI + preview deploy; push to `main` triggers production
