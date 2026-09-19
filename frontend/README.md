# OmniTask web application

The web application is a React single-page client for the OmniTask API. English is the source and fallback language; French contains the same semantic catalog with natural localized copy. Users can choose system, light or dark appearance.

## Requirements and commands

Use Node.js 24.19.x and npm 11.17.x.

```sh
npm ci
npm run dev
```

The default development URL is `http://localhost:5173`. The API must be available at the `VITE_API_BASE_URL` declared in `.env.local`, or at `http://localhost:8080` when the variable is absent.

| Command             | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Start the Vite development server                  |
| `npm run format`    | Apply Prettier                                     |
| `npm run lint`      | Run ESLint with zero warnings                      |
| `npm run typecheck` | Check all strict TypeScript projects               |
| `npm test`          | Run the focused Vitest suite once                  |
| `npm run e2e`       | Run four Chromium journeys against a live API      |
| `npm run build`     | Type-check and create `dist/`                      |
| `npm run check`     | Run formatting, lint, type checks, tests and build |

## Feature boundaries

```text
src/
  app/                  provider composition, routing and query policy
  assets/               approved local brand and abstract graphics
  components/layout/    authenticated and public page shells
  components/ui/        accessible shared presentation primitives
  features/auth/        auth API, validation, session and route guards
  features/tasks/       task API, URL state, validation and interactions
  lib/api/              typed HTTP client and safe Problem Details parsing
  lib/config/           validated build environment
  lib/i18n/             English and French catalogs
  lib/theme/            preference resolution and DOM synchronization
  styles/               Tailwind import, tokens, fonts and layout rules
  test/                 Vitest, jsdom and MSW setup
tests/e2e/              Playwright user journeys and API fixtures
```

Feature folders own their transport types, validation and UI behavior. Shared code is limited to behavior used across features. Pages orchestrate queries and mutations while focused components own presentation and form interaction.

## State and HTTP behavior

TanStack Query owns server state. Search text, status and page live in the URL so navigation and sharing preserve task discovery state. Searches are debounced by 300 ms and passed to the API as literal values.

The HTTP client validates the API origin, injects the Bearer token for protected calls, accepts abort signals and converts failures to a safe `ApiProblem`. HTML gateway responses and internal server text are never rendered. A protected 401 clears the session and redirects to login with localized feedback.

The access token and its expiry are stored in `sessionStorage` under `omnitask.session` and mirrored in the session provider. Expired or malformed restored data is discarded before use. Locale and theme preferences use `localStorage`; no token is stored there.

Task updates send the last observed entity version. A 409 keeps the editor and draft open and offers explicit reload or cancel actions. Delete requires confirmation. Task lists are invalidated after successful mutations and after missing-resource responses.

## Localization, theme and responsive layout

The English and French catalogs are checked for identical key sets. Changing locale updates the document language. Dates and counts use the active locale.

An inline bootstrap resolves the saved or system theme before React starts, preventing a light-theme flash. The theme provider then tracks system changes without overwriting the user's `system` preference.

The layout starts at 320 px. Tailwind's 640 px, 768 px and 1024 px breakpoints progressively add space and columns. Primary actions remain visible at narrow widths, user content can wrap, dialogs cap their viewport height, controls meet a 44 px minimum target, and reduced-motion preferences disable nonessential motion.

Framer Motion coordinates page entrances, staggered task rendering, layout changes, dialog presentation, button feedback and slow abstract-overlay movement. Ambient loops run for 12 to 20 seconds; interaction feedback stays between 160 and 550 ms. A global motion policy and explicit reduced-motion checks stop continuous decorative movement when the operating system requests reduced motion.

Headless UI supplies Dialog, Menu and Listbox behavior. Radix UI is limited to toast announcements. Lucide supplies interface icons. React Hook Form and Zod keep form state and client constraints aligned. Framer Motion owns animation timing and reduced-motion behavior. These dependencies each own a concrete concern and are pinned exactly.

## Tests

Vitest, Testing Library and MSW cover API error conversion, session expiry, catalog parity, theme resolution, route guards, validation, URL query serialization, task rendering and mutation conflict behavior.

Playwright runs one Chromium project and four representative journeys. It expects the API on `http://127.0.0.1:8080` by default; set `E2E_API_BASE_URL` when the fixture endpoint differs. The Vite browser origin remains `http://localhost:5173` so it matches the API's explicit local CORS origin.

## Production image

Build the pinned multi-stage image:

```sh
docker build --tag omnitask-web:local .
```

Override the public API origin at build time when required:

```sh
docker build \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  --tag omnitask-web:local .
```

The runtime image uses unprivileged Nginx as UID/GID 101 on port 8080. `/healthz` returns plain text, `/assets/` uses immutable one-year caching for hashed files, and other routes fall back to `index.html` with `no-cache` for client-side routing.

The root Compose file builds this image with `WEB_API_BASE_URL`, binds it to `127.0.0.1:${WEB_PORT:-5173}` and waits for API readiness before starting it.
