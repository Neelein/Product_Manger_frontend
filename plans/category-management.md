# Plan — Category management frontend (2026-08-08)

## Goal
Frontend half of category management. The backend (already merged and green)
added a `categories` table, replaced `products.category` free-text with
`category_id`, and exposes `GET/POST /api/categories`,
`POST /api/categories/{id}/update|/delete`. This task adds the UI.

Backend contract (from `../backend/decisions/2026-08-08-categories.md`):
- `Product` responses keep `category` (joined name) and add `category_id`.
- Product create/update now accept `category_id` (UUID string) not free text.

## Changes
| File | Action | Description |
|------|--------|-------------|
| `src/types/index.ts` | Modify | `Category`, `CreateCategoryRequest`, `CategoryResponse`, `CategoryListResponse`; `Product.category_id`; `CreateProductRequest.category_id` (keep `Product.category` name) |
| `src/api/categories.ts` | New | `listCategories` / `createCategory` / `updateCategory` / `deleteCategory` via `apiFetch` with POST `/update`,`/delete` URLs |
| `src/hooks/useCategories.ts` | New | `useCategories()` → `{ categories, loading, error, reload }` (useProducts pattern) |
| `src/pages/CategoryListPage.tsx` | New | `.categories-page` table page: create form, inline rename, delete w/ confirm + 409 message |
| `src/pages/DashboardPage.tsx` | Modify | Third FEATURES card 🏷️ 類別管理 → `/categories` |
| `src/App.tsx` | Modify | `/categories` route under `ProtectedRoute`, import page |
| `src/components/Layout.tsx` | Modify | Nav link 「類」 → `/categories`, visible when logged in |
| `src/pages/ProductForm.tsx` | Modify | Replace free-text 分類 input with `<select>` fed by `useCategories`; store/select `category_id`; keep label 「分類 *」 |
| `src/App.css` | Modify | `.categories-page` block reusing tokens; create/rename/hint styles |
| `plans/category-management.md` | New | This plan |
| `decisions/2026-08-08-categories.md` | New | Decision record |

## ProductForm select
- `<select id="category" value={categoryId}>` with placeholder option
  `<option value="">請選擇分類</option>` then `categories.map(...)`.
- Edit initializes `categoryId` from `product.category_id`; submit sends
  `category_id`. Empty categories list → hint「尚未建立任何分類，請到「類別管理」建立」.

## Verification
- `npx tsc -b`
- `npm run lint` (oxlint)
- E2E update (`product.spec.ts` select, new `categories.spec.ts`) is a separate
  following phase; not run here.