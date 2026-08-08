# Decision — Vercel proxy holds the API gateway secret (2026-08-08)

## Why
Embedding the secret via `VITE_*` would ship it in the public JS bundle — anyone could read it from DevTools. To make "only the frontend can call the API" real, the secret must live somewhere the browser never sees. Vercel runs a serverless function that proxies `/api/*` to the backend and injects `Authorization: Bearer <API_GATEWAY_SECRET>`. The local Vite dev proxy does the same using server-side `API_GATEWAY_SECRET`, so development and E2E behave exactly like production.

## Facing trade-offs
- Secret never in the bundle, so external callers who hit the backend origin directly get 401.
- A compromised Vercel account still exposes the secret (expected boundary).
- Vercel deploy must be manually verified on the domain after rollout (function build + domain env).

## What stays unchanged
- Browser cookie session auth and all `/media` handling (no bundled secret).

## Implementation notes (verified 2026-08-08)
- Function file: `api/[[...slug]].ts` (optional catch-all). Confirmed against current Vercel docs: filesystem functions in `api/` deploy for Vite/static projects, and catch-all `[[...slug]]` is supported.
- Runtime: Node.js (default) using Vercel's recommended non-framework web-handler signature `export default { async fetch(request) { ... } }`. Node's native fetch (undici) is used because the backend origin is plain HTTP (`http://neeleindev.com:8090`); Node fetch handles http targets reliably, whereas Edge-runtime fetch of http origins has proven flaky. Streaming (request/response bodies pass through as ReadableStreams) is native and needs no deps.
- `vercel.json`: the `/api/(.*)` external rewrite is removed so the function handles `/api/*`; the `/media/(.*)` rewrite is untouched.
- Local/E2E: Vite dev proxy `proxyReq` hook injects `Authorization: Bearer $API_GATEWAY_SECRET` for `/api` only. Default secrets remain `e2e` on both sides so local E2E keeps the full gate path consistent.
- The function file is added to `tsconfig.node.json` includes so `tsc -b` typechecks it (confirmed green).

## Limitations
- The backend remains HTTP on port 8090 with no Nginx/HTTPS. Bearer credentials can be intercepted in transit; a future HTTPS rollout must rotate the shared secret.
- Missing Vercel `API_GATEWAY_SECRET` fails explicitly with HTTP 500.
