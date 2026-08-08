# 2026-08-08 — Space out category row action buttons

## What
Added spacing between the action buttons (編輯/刪除, and edit-mode 儲存/取消) in
each row of the categories page table, plus an E2E test asserting the gap.

## Changes
- `src/App.css`: new rule `.categories-page .data-table td:last-child` making the
  actions cell a flex container with `gap: 8px`, centered, matching the existing
  `.header-actions` / `.calendar-actions` convention.
- `e2e/categories.spec.ts`: new test `row action buttons 編輯 and 刪除 are spaced
  apart` — creates a category, measures the pixel gap between the two buttons in
  the last row via `page.evaluate`/`getBoundingClientRect`, asserts it is >= 8px.

## Why
The two inline-flex buttons were glued together (0px gap), making them hard to
read and easy to mis-click.

## Verification
- `npm run lint` exit 0; `npm run build` success.
- `npx playwright test e2e/categories.spec.ts` → 5/5 green (includes the new spacing test).
- Live Chrome DOM check on /categories: gap between 編輯 and 刪除 = 8px (was 0px).