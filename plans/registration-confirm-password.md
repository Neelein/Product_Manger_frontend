# Plan — Confirm-password field on registration (2026-08-07)

## Goal
Registration on the frontend must ask the user to confirm their password and block submission when the two passwords differ.

## Changes
| File | Action | Description |
|------|--------|-------------|
| `src/pages/LoginPage.tsx` | Modify | `confirmPassword` state;「確認密碼」input in register mode (`autocomplete="new-password"`); validate empty (`請輸入確認密碼`) and mismatch (`兩次輸入的密碼不一致`), both guarded by `mode === 'register'`; clear on reset & after success |
| `e2e/helpers.ts` | Modify | `fillRegisterForm` fills confirm; password label uses `{ exact: true }` (label 密碼 now ambiguous with 確認密碼) |
| `e2e/registration-code.spec.ts` | Modify | invalid-code test fills confirm + `{ exact: true }` |
| `e2e/auth.spec.ts` | Modify | new test: mismatched confirm → `兩次輸入的密碼不一致` visible, stays on form |
| `decisions/2026-08-07-5.md` | New | Decision record |

## Verification
- `npm run lint`, `npm run build`.
- `npm run e2e` (13 specs) green.