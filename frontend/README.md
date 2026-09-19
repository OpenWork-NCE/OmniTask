# Web application structure

The web client is reserved for the React, Vite and TypeScript implementation required by the project brief.

The structure is organized by feature:

```text
src/
  app/                         application bootstrap, routing and providers
  assets/                      local static assets
  components/layout/           shared page shell and navigation
  components/ui/               reusable presentation primitives
  features/auth/               registration, login and session state
  features/tasks/              task list, filters and task mutations
  lib/api/                     HTTP client and API error translation
  lib/auth/                    token storage and authenticated requests
  lib/config/                  validated runtime configuration
  styles/                      global styles and design tokens
  types/                       shared transport types
tests/                         unit, component, fixture and end-to-end tests
```

Feature code owns its API calls, schemas, types and screens. Shared code belongs in `components`, `lib` or `types` only when it is used by more than one feature. The client must call the existing backend contract documented in `docs/api/README.md`.
