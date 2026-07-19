# Plan — Add `product_id` to Inventory + Navigation (2026-07-18)

## Overview

InventoryDetailPage needs a "返回產品" button, but the frontend Inventory type and backend API did not include `product_id`. This plan adds it end-to-end through the entire stack.

## Files Changed

### Backend

| File | Change |
|------|--------|
| `src/domain/inventory.go` | Add `ProductID string \`json:"product_id"\`` to Inventory struct |
| `src/database/inventory_repo.go` | Add `&inv.ProductID` scan arg |
| `db/migrations/008_create_functions.sql` | Add `product_id UUID` and `p.id AS product_id` to all 3 functions |

### Frontend

| File | Change |
|------|--------|
| `src/types/index.ts` | Add `product_id: string` and `product_detail_id: string` to Inventory interface |
| `src/pages/InventoryDetailPage.tsx` | Add "← 返回產品" link inside `detail-card > detail-header` (moved from `page-header`); remove unused `updating` destructuring |

## Implementation Order

1. Backend domain struct
2. Backend SQL functions (add column to RETURN TABLE and SELECT + GROUP BY)
3. Backend scan function
4. Frontend type
5. Frontend page navigation
6. Build verification
