# 2026-08-08 — Category management frontend

## What
Implemented the frontend for category management, matching the already-merged
backend (categories table, `products.category_id` FK, category CRUD API).

## Changes
- `src/types/index.ts`: new `Category`, `CreateCategoryRequest`,
  `CategoryResponse`, `CategoryListResponse`; `Product.category_id` added and
  `CreateProductRequest`/`UpdateProductRequest` now use `category_id`
  (free-text `category` removed from requests). `Product.category` (joined name)
  is kept because the backend still returns it.
- `src/api/categories.ts`: `listCategories`, `createCategory`, `updateCategory`
  (`POST /api/categories/{id}/update`), `deleteCategory`
  (`POST /api/categories/{id}/delete`) using `apiFetch` like products/registrationCodes.
- `src/hooks/useCategories.ts`: `useCategories()` returning
  `{ categories, loading, error, reload }`.
- `src/pages/CategoryListPage.tsx`: `.categories-page` table page styled after
  RegistrationCodesPage — create form (trimmed name required; duplicate name
  surfaces the 409 message), inline per-row rename (編輯 → input + 儲存/取消),
  delete with `window.confirm` that keeps the row and shows the server error on
  409 (category in use). Loading/empty/error states reuse existing classes.
- `src/pages/DashboardPage.tsx`: third FEATURES card 🏷️ 類別管理 → `/categories`.
- `src/App.tsx`: `/categories` route under `ProtectedRoute` (not AdminRoute).
- `src/components/Layout.tsx`: nav link 「類」 → `/categories`, shown when a
  member is logged in.
- `src/pages/ProductForm.tsx`: replaced the free-text 分類 input with a `<select>`
  fed by `useCategories`; state holds `category_id`, edit initializes from
  `product.category_id`, submit sends `category_id`. Keeps label 「分類 *」
  and the 請填寫所有必填欄位 validation; empty-categories hint shown.
- `src/App.css`: `.categories-page` block (table/create form/rename input/hint)
  reusing existing tokens and conventions.

## Why
Products now reference categories by id; free-typing is removed to prevent
uncontrolled duplicate categories. Any logged-in member can manage categories
for now (admin gate deferred — matches backend decision).

## Verification
`npx tsc -b` and `npm run lint` (oxlint) pass. Playwright E2E (update of
`product.spec.ts` select + new `categories.spec.ts`) is a separate pending
phase and was not run.