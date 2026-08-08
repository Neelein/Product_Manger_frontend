# Plan - Fixed Vercel proxy function (2026-08-08)

## Goal
Route every production `/api/*` request through one fixed Vercel Function so multi-segment member routes do not depend on filesystem catch-all matching.

## Implementation
- Rename `api/[...slug].ts` to `api/proxy.ts` without changing the Web Standard fetch proxy behavior.
- Rewrite `/api/:path*` to `/api/proxy?__path=:path*`; reconstruct the original API path in the function and preserve all non-routing query parameters.
- Keep `/media/(.*)` unchanged and keep `API_GATEWAY_SECRET` and `BACKEND_ORIGIN` server-side.
- Update proxy tests for products, member login, forwarding, path reconstruction, and missing secrets.
- Update TypeScript function includes, package verification metadata, and the plan/decision records.

## Verification
- Run `npm run test:proxy`, `npm run build`, `npm run lint`, and `npm run e2e`.
- Validate rewrite reconstruction with unit tests rather than assuming Vite's local proxy represents Vercel routing.
