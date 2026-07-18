# Plan — Inventory System Frontend (2026-07-18)

## Overview

Add inventory management UI for the frontend, matching the backend inventory API. Inventory is linked one-to-one with product_prices. Each inventory has many inventory_items.

## Pages

| Route | Page | Auth | Description |
|-------|------|:----:|-------------|
| `/inventory` | InventoryListPage | No (list public) | Search + list all inventories |
| `/inventory/:id` | InventoryDetailPage | No (view public) | Single inventory detail + items CRUD |

## Modifications

| File | Description |
|------|-------------|
| `types/index.ts` | Add Inventory, InventoryItem, request/response types |
| `api/products.ts` | Add 10 inventory API functions |
| `hooks/useInventory.ts` | New file — inventory + items CRUD hooks |
| `pages/ProductDetail.tsx` | Show inventory summary + "管理庫存" link per price |
| `pages/InventoryListPage.tsx` | New — search + inventory list |
| `pages/InventoryDetailPage.tsx` | New — inventory summary + items CRUD |
| `components/Layout.tsx` | Add "庫存管理" nav link |
| `App.tsx` | Add inventory routes |
| `App.css` | Inventory styles |

## Implementation Order

1. Types → API → Hooks
2. InventoryDetailPage → InventoryListPage
3. ProductDetail integration
4. Layout + Routes
5. CSS
