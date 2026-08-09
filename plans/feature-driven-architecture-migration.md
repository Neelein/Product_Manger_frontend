# Feature-Driven Architecture Migration

## Goal

Restructure the React frontend around business features without changing existing routes, backend API contracts, or user-facing behavior.

## Target structure

- `src/app`: router, providers, layout, and application styles.
- `src/features`: auth, products, inventory, categories, announcements, chat, calendar, and registration-codes.
- `src/shared`: API client, reusable UI, utilities, and shared styles.

Each feature owns its pages, API functions, hooks, components, and domain types. Cross-feature access uses public exports or small shared contracts rather than internal imports.

## Migration strategy

1. Establish `app` and `shared` boundaries while preserving compatibility exports.
2. Split global types and API modules by feature.
3. Migrate low-risk auth, category, and registration-code features.
4. Migrate products and inventory, including product variants and variant inventory.
5. Migrate announcements, chat, calendar, dashboard, and admin pages.
6. Move feature styles incrementally and remove obsolete centralized modules.
7. Delete the legacy `pages`, `api`, `hooks`, `context`, `components`, and `types` directories after all imports and tests are migrated.

## Constraints

- Preserve all existing URLs and backend request/response contracts.
- Do not add a state-management dependency during this migration.
- Keep existing E2E behavior and add tests for each migrated boundary.
- Use compatibility re-exports only during migration; the completed structure must not depend on them.

## Verification

Run `npm run build`, `npm run lint`, `npm run test:proxy`, and the Playwright suite after migration phases.

## Product Detail UI Rule

The price section displays and edits prices only. Inventory actions and inventory summaries are displayed exclusively in the product variant section.
