# Plan — Vercel API-gateway proxy + E2E secret wiring (2026-08-08)

## Goal
Frontend still calls relative `/api/*`. A Vercel serverless/edge function proxies `/api/*` to the backend, injecting `Authorization: Bearer <API_GATEWAY_SECRET>` so the secret never ships in the browser bundle and only Vercel can relay valid calls.

## Decisions (from backend plan, user-confirmed)
- Option B: secret held by Vercel env (`API_GATEWAY_SECRET`) + backend server env. No `VITE_*` in the deployed bundle.
- Local dev/E2E: Vite dev proxy injects the same header from `API_GATEWAY_SECRET` so the full path (browser → proxy → backend gate) is validated. This is server-side Vite configuration only.
- Vercel function catch-all `api/[[...slug]].ts` (or Vercel-supported catch-all form) forwarding method/body/headers and streaming the response; `vercel.json` `/api` rewrite removed so the function runs (keep `/media` rewrite).

## Changes
| File | Action | Description |
|------|--------|-------------|
| `api/[[...slug]].ts` | New | Vercel function: proxy `/api/*` to the HTTP backend origin, add `Authorization: Bearer <API_GATEWAY_SECRET>`, forward method/query/headers/body, preserve cookies, and stream reply; includes a Node types reference for Vercel's function typecheck |
| `tests/proxy.test.ts` | New (moved from `api/proxy.test.ts`) | Node unit tests stay outside `api/`, which is reserved for real Vercel filesystem functions; Node TypeScript settings still check the test and allow its `.ts` import |
| `vercel.json` | Modify | Remove `/api/(.*)` rewrite so the function handles it; keep `/media` |
| `vite.config.ts` | Modify | Dev proxy `/api`: inject `Authorization: Bearer <API_GATEWAY_SECRET>` when set |
| `.env.example` | New | Document local-only `API_GATEWAY_SECRET` |
| `scripts/start-backend.sh` | Modify | Export `API_GATEWAY_SECRET="${E2E_API_SECRET:-e2e}"` to the backend process |
| `playwright.config.ts` | Modify | Frontend webServer command prefix `API_GATEWAY_SECRET="${E2E_API_SECRET:-e2e}"` |
| `.github/workflows/cicd.yml` | Modify | e2e job env `E2E_API_SECRET: e2e` |
| `plans/api-gateway.md`, `decisions/2026-08-08-api-gateway.md` | Modify | Document the test placement and Vercel Node typecheck fix |

## Verification
- `npx tsc -b`, `npm run test:proxy`, `npm run lint`, `npm run build`
- Full Playwright E2E (proxy injects secret → backend gate active → login + feature flows pass).
- Manual post-deploy check on Vercel domain: `/api/health` returns 200; other success.

## Limitations
- The current backend remains HTTP on port 8090; a Bearer secret can be intercepted in transit. A future HTTPS deployment must rotate the secret.
- Vercel returns an explicit 500 when `API_GATEWAY_SECRET` is missing instead of sending an unauthenticated upstream request.
- Vercel's Vite filesystem-functions integration treats every TypeScript file under `api/` as a function candidate, so unit tests must remain under `tests/`.
- The function uses a file-local `/// <reference types="node" />` so Vercel recognizes `process.env` without adding Node types to the browser `tsconfig.app.json`.
