# Complete Feature Migration Decision

Complete the Feature-Driven Architecture migration by moving all remaining pages, API modules, hooks, types, and components into their owning feature or shared boundary. Add a dedicated dashboard feature, split product and inventory API ownership, and remove the legacy `src/pages`, `src/api`, `src/hooks`, `src/context`, `src/components`, and `src/types` directories after all imports and tests pass. Existing routes, backend contracts, and user behavior remain unchanged.
