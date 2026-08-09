# Feature-Driven Architecture Decision

The frontend will migrate from a page-centered structure to Feature-Driven Architecture. Business features own their pages, API modules, hooks, components, and types. Application wiring belongs under `app`, reusable infrastructure belongs under `shared`, and existing routes and backend contracts remain unchanged. The migration will be incremental and will not introduce a new state-management library.
