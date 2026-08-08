# Decision - Fixed Vercel proxy function (2026-08-08)

## Decision
Use `api/proxy.ts` as the only Vercel API function and rewrite `/api/:path*` to it with an internal `__path` query parameter.

## Why
The deployed non-framework Vite project inconsistently matched multi-segment filesystem catch-all functions. A fixed function removes that routing dependency while retaining the existing server-side gateway secret and streaming proxy behavior.

The function removes `__path` before forwarding query parameters, rebuilds `/api/<path>`, and takes the backend origin and gateway secret only from server environment variables. No `VITE_*` variable is introduced.
