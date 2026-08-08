# Plan — Remove 類 link from navbar (2026-08-08)

## Goal
Remove the「類」(categories) link from the navbar. Category management should only be reachable from the 產品 (products) section — it already is, via the「類別管理」card on the Dashboard page (`/home`, which the 產品 nav link opens).

## Changes
| File | Action | Description |
|------|--------|-------------|
| `src/components/Layout.tsx` | Modify | Delete the `member && <Link to="/categories" className="nav-link">類</Link>` block so「類」no longer appears in the navbar |
| `e2e/categories.spec.ts` | Modify | Add test asserting the navbar has no 類 link but the categories page is still reachable via the dashboard card |

## Notes
- `/categories` route, page, and the Dashboard「類別管理」card stay unchanged.
- No other code depends on the navbar 類 link (verified via grep).

## Verification
- `npm run lint`, `npm run build`.
- `npx playwright test e2e/categories.spec.ts` green.