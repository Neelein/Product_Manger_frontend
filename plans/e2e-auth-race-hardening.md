# Plan — Harden Frontend Auth Bootstrap (E2E auth race) (2026-08-07)

## Problem
`npm run e2e` flaked in CI. All failing specs shared one symptom: after login + a full page reload, the navbar showed「登入」(i.e. `member === null`) and member-gated UI disappeared, timing out on create buttons/links or redirecting protected routes to `/login`.

A Playwright network trace (`playwright-report`) showed the mechanism:
`POST /api/members/login → 200 (Set-Cookie session_key=A)` then two concurrent
`GET /api/members/me` both sent with cookie `A`; the first got `200` and set a
rotated `session_key=B`, the second got `401`. `AuthProvider`'s
`.catch(() => setMember(null))` cleared the valid session.

## Root cause
- Backend used for CI (backend repo `main`) rotates the session key on EVERY
  authenticated request (`SessionRepository.Rotate`), deleting the old key.
- Frontend `main.tsx` uses React `StrictMode`, which runs mount effects twice in
  dev (`npm run dev`, vite) → two concurrent `/me` requests sharing one cookie.
- The losing request's `401` then nulled out the winning request's valid member.

Backend `dev` already removed rotation (`refactor: replace session rotation with
direct key and 1-hour idle timeout`); merging it into backend `main` is the root
fix so CI no longer rotates.

## Frontend hardening (this plan)
Primary: **in-flight dedup** so duplicate/concurrent mounts share ONE `GET /me`
(`sessionRequest ??=`), eliminating the StrictMode double request at the source.
Secondary: **never null an existing member on failure** — `catch` is a no-op;
`member` starts `null` and is only cleared by `logout()`. This keeps a valid
session alive even if an unrelated concurrent authenticated call rotates the
session and a subsequent `/me` returns `401`.

## Files
| File | Action | Description |
|------|--------|-------------|
| `src/context/AuthContext.tsx` | Modify | `getSessionOnce()` dedup helper + defensive bootstrap `useEffect` |
| `plans/e2e-auth-race-hardening.md` | New | This file |
| `decisions/2026-08-07-3.md` | New | Decision record |

## Verification
- `npx tsc -b` (type-check).
- `npm run lint` (oxlint).
- `npm run e2e` — Playwright suite (9 specs) green.
- Confidence check: also run E2E against a backend build that still performs
  per-request session rotation to confirm the frontend now tolerates it.