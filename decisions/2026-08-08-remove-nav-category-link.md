# Remove 類 (Categories) link from navbar (2026-08-08)

## What
Removed the「類」link from the top navbar. Category management remains accessible from the 產品 section via the「類別管理」card on the Dashboard (`/home`), which is what the「產品」nav link opens.

## Why
The user asked that category management appear only inside the product area instead of as its own navbar entry, to reduce navbar clutter.

## Changes
- `src/components/Layout.tsx`: deleted the `{member && <Link to="/categories" className="nav-link">類</Link>}` block.
- `e2e/categories.spec.ts`: added a test asserting the navbar no longer contains a 類 link, while the `/categories` page stays reachable through the Dashboard card.

## Notes
- `/categories` route, `CategoryListPage`, and the Dashboard card are unchanged.
- Verified via grep that no test/code relied on the navbar 類 link.

## Verification
- `npm run lint` exit 0; `npm run build` success.
- `npx playwright test e2e/categories.spec.ts` (6 tests) green.