# Plan — End-to-End Testing (Playwright) (2026-08-06)

## Overview

Add Playwright full-stack E2E tests covering the React frontend calling the Go backend. The suite's single source of truth lives in this (frontend) repo but is portable so the backend repo's CI can reuse it (checks out frontend `dev` and runs the same suite against the backend checkout).

## Scope

- Framework: Playwright (Chromium)
- Environment: local full-stack — real backend (`:8090`) + real frontend (`:5173`), postgres `productdb_e2e`
- Data: dedicated `productdb_e2e`, truncated in `globalSetup`; uploaded media written to a temp `MEDIA_ROOT` removed in `globalTeardown`
- CI: run on push to `main` and `dev`, plus `workflow_dispatch`, in both frontend and backend repos (backend wiring is Phase 2)

## Flows covered (Phase 1)

- Auth: register → protected redirect, login, me, logout
- Product: create → list → detail → add price → update
- Inventory: create (from price) → list → add item
- Announcements: create → list → detail
- Chat: create room → send message → list messages
- Calendar/events: create → list by month → add viewer

## Files (frontend repo)

| File | Action | Description |
|------|--------|-------------|
| `playwright.config.ts` | New | testDir `e2e`, baseURL `:5173`, webServer = backend+frontend, globalSetup/Teardown |
| `scripts/start-backend.sh` | New | Build+run backend from `BACKEND_DIR` on `DATABASE_URL=…productdb_e2e`, `MEDIA_ROOT=<tmp>`, wait `/api/health` |
| `e2e/*.spec.ts` | New | Playwright specs per flow above |
| `e2e/global-setup.ts` | New | Truncate all tables in e2e DB via `pg` |
| `e2e/global-teardown.ts` | New | Remove temp `MEDIA_ROOT` |
| `package.json` | Modify | `e2e`, `e2e:ui` scripts; devDeps `@playwright/test`, `pg` |
| `.gitignore` | Modify | Add `test-results/`, `playwright-report/` |
| `.github/workflows/e2e.yml` | New | Postgres service + e2e run on `[main, dev]` + dispatch |
| `plans/e2e-test.md` | New | This file |
| `decisions/2026-08-06-2.md` | New | Decision record |

## Phase 2 (backend repo, later)

Backend `.github/workflows/e2e.yml`: checkout backend + frontend@dev, postgres service, run frontend harness with `BACKEND_DIR` pointing at backend checkout.

## Verification

- Local: start postgres, `npm run e2e`, expect green
- CI frontend: push dev/main triggers e2e