# Plan — Space out category row action buttons (2026-08-08)

## Goal
On the 類別管理 page, the 編輯/刪除 (and edit-mode 儲存/取消) buttons in each table row are glued together (0px gap). Add consistent spacing between them.

## Changes
| File | Action | Description |
|------|--------|-------------|
| `src/App.css` | Modify | New rule `.categories-page .data-table td:last-child { display: flex; gap: 8px; justify-content: center; align-items: center; }` — matches existing `.header-actions` / `.calendar-actions` `gap: 8px` convention |
| `e2e/categories.spec.ts` | Modify | New test measuring the pixel gap between the two action buttons in the last row (`getBoundingClientRect`) and asserting `>= 8px` |
| `decisions/2026-08-08-category-action-gap.md` | New | Decision record |

## Verification
- `npm run lint`, `npm run build`.
- `npx playwright test e2e/categories.spec.ts` green.
- Manual Chrome check: measure real gap via DOM.