# 2026-08-08 — Category management E2E suite

## What
Extended the Playwright E2E suite to cover the new category management feature
(products now reference categories via a select instead of free text).

## Changes
- `e2e/helpers.ts`: added `freshCategory()` — pg `INSERT INTO categories`
  returning `{ id, name }` with a unique name, reusing the existing `Pool`
  pattern (`dbUrl()`).
- `e2e/global-setup.ts`: added `'categories'` to `APP_TABLES` so the table is
  truncated between runs.
- `e2e/product.spec.ts`: `createProduct` now seeds a category via
  `freshCategory()` and fills the 分類 * `<select>` with
  `selectOption(category.name)` (label match, no free text). The edit test
  re-selects the same category before saving.
- `e2e/inventory.spec.ts`: same migration — product creation in
  `createProductAndPrice` seeds a category and uses `selectOption`.
- `e2e/categories.spec.ts`: new spec of 4 independent tests (each calls
  `registerAndLogin`):
  1. create + rename a category (create row `input` placeholder 請輸入類別名稱 →
     `tbody tr` row → 編輯 → `.category-rename-input` → 儲存; assert renamed
     visible, original gone);
  2. delete a category not in use (accept `window.confirm` dialog → assert the row
     disappears);
  3. deleting a category in use by a product is blocked (create product selects
     the category on `/products/new`; delete attempt surfaces the server
     "in use" error banner, row remains);
  4. product create form requires an existing category (`getByLabel('分類 *')`
     resolves to a `<select>`, not a text input; `selectOption` picks a seeded
     category and the checked option text equals its name).

## Why
The 分類 control on the product form and free-text categories were replaced by
a categories table + `<select>`; the suite must exercise that behavior and the
new category management page end-to-end against the real backend.

## Verification
`npx tsc -b` and `npx playwright test --list` pass (17 tests / 8 files). Full
suite intentionally not run (reviewer runs it).