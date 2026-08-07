# Plan — Restyle Registration Codes page like Inventory (2026-08-07)

## Goal
Make the admin `註冊代碼管理` page (`/admin/registration-codes`) visually and behaviorally match the `庫存管理` page (`/inventory`), keeping all registration-code functionality intact.

## Reference
`src/pages/InventoryListPage.tsx` — header with `back-link`, `page-header` h1 + subtitle, `search-bar` (input + 搜尋, Enter to search, client-side filter), `data-table`, `status-badge`, `empty-state`.

## Changes
| File | Action | Description |
|------|--------|-------------|
| `src/pages/RegistrationCodesPage.tsx` | Modify | back-link → /home; search-bar + client-side filter by code; `data-table`; `status-badge` available/used pills; empty state text for search vs none |
| `src/App.css` | Modify | Add `===== Registration Codes =====` block mirroring inventory table/search styles, `.code-cell` monospace, `.status-available`/`.status-used`, `.code-create-form` |
| `decisions/2026-08-07-4.md` | New | Decision record |

## Verification
- `npm run lint`, `npm run build`.
- Browser (Chrome MCP): log in as admin, open `/admin/registration-codes`, compare computed styles with `/inventory`, create + search + delete flows, cleanup test data.