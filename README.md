# OmniTask

OmniTask is a bilingual private task application. It combines a Spring Boot API, React and Flutter clients, MySQL schema migrations, automated verification and production-oriented web and API container images.

The web and mobile clients provide registration, login, task search and status filtering, pagination, task creation and editing, confirmed deletion, optimistic concurrency recovery, English and French interfaces, and system/light/dark themes. Task ownership always comes from the authenticated JWT.

## Versions

- Java 21 and Spring Boot 4.1.1
- Maven Wrapper 3.3.4 with Maven 3.9.11
- MySQL 8.4.11
- Node.js 24.19.x and npm 11.17.0
- React 19.3.0, Vite 8.3.0, TypeScript 6.0.3, Tailwind CSS 4.3.3 and Framer Motion 13.4.0
- Flutter 3.47.5 stable and Dart 3.13.4

Dependency and container versions are fixed. Production base images are also pinned by digest.

## Requirements

- Docker Engine with Docker Compose 2.24.4 or newer
- OpenSSL for local secret generation
- Node.js 24.19.x and npm 11.17.x for frontend development
- JDK 21 and `unzip` for backend development
- Flutter 3.47.5 and an Android API 36 toolchain for mobile development
- Network access during the first dependency and image download

A global Maven installation is not required.

## Run the complete application

From the repository root:

```sh
./scripts/init-local-env.sh
docker compose up --build --wait
```

Open `http://localhost:5173`. The API is available at `http://localhost:8080`, and MySQL is bound to `127.0.0.1:3306` for local diagnostics.

The initialization script creates random database passwords and an RSA signing key pair. It preserves existing values. `.env` and `.secrets/` are excluded from Git.

Stop the services without deleting data:

```sh
docker compose down
```

The `mysql-data` volume persists. `docker compose down --volumes` deletes the local database and should only be used for an intentional reset.

## Develop on the host

Start MySQL and the API:

```sh
./scripts/init-local-env.sh
docker compose up -d --wait mysql
set -a
. ./.env
set +a
export JWT_PRIVATE_KEY="file:$PWD/.secrets/jwt-private.pem"
export JWT_PUBLIC_KEY="file:$PWD/.secrets/jwt-public.pem"
cd backend
./mvnw spring-boot:run
```

In another terminal, start the web client:

```sh
cd frontend
npm ci
npm run dev
```

Vite serves the client on `http://localhost:5173` and calls the API at `http://localhost:8080`. Copy `frontend/.env.example` to `frontend/.env.local` only when a different API origin is required.

Run the mobile client from an Android emulator:

```sh
cd mobile
flutter pub get
flutter run
```

Android emulators use `http://10.0.2.2:8080` by default. Pass `--dart-define=API_BASE_URL=https://api.example.com` for a physical device or deployed API. See [mobile setup and architecture](mobile/README.md).

This workspace also contains a local Temurin JDK at `.tools/jdk-21`, which is ignored by Git. On another machine, install JDK 21 and set `JAVA_HOME` normally.

## Configuration

### API and Compose

| Variable               | Meaning                                            | Default                                      |
| ---------------------- | -------------------------------------------------- | -------------------------------------------- |
| `DB_URL`               | JDBC URL                                           | Local `omnitask` database with a UTC session |
| `DB_USERNAME`          | Application database user                          | `omnitask`                                   |
| `DB_PASSWORD`          | Application database password                      | Required                                     |
| `DB_POOL_SIZE`         | Maximum connections per API instance               | `5`                                          |
| `JWT_PRIVATE_KEY`      | PKCS#8 RSA private key resource                    | Required                                     |
| `JWT_PUBLIC_KEY`       | X.509 RSA public key resource                      | Required                                     |
| `JWT_ISSUER`           | Required JWT issuer                                | `omnitask`                                   |
| `JWT_AUDIENCE`         | Required JWT audience                              | `omnitask-api`                               |
| `CORS_ALLOWED_ORIGINS` | Comma-separated explicit web origins               | `http://localhost:5173`                      |
| `PORT`                 | Host API port in Compose                           | `8080`                                       |
| `WEB_PORT`             | Host web port in Compose                           | `5173`                                       |
| `WEB_API_BASE_URL`     | API origin compiled into the production web bundle | `http://localhost:8080`                      |

### Frontend

`VITE_API_BASE_URL` is validated as a URL when the client is built. Because Vite embeds this value in the static bundle, build a new image when the public API origin changes.

Locale and theme preferences are stored locally. The access token is held in memory and `sessionStorage`, so closing the browser session signs the user out. It is never stored in `localStorage`.

## API contract

The complete request constraints, Problem Details responses, pagination and concurrency behavior are documented in [docs/api/README.md](docs/api/README.md).

| Method   | Path                 | Authentication |
| -------- | -------------------- | -------------- |
| `POST`   | `/api/auth/register` | Public         |
| `POST`   | `/api/auth/login`    | Public         |
| `GET`    | `/api/tasks`         | Bearer JWT     |
| `POST`   | `/api/tasks`         | Bearer JWT     |
| `PUT`    | `/api/tasks/{id}`    | Bearer JWT     |
| `DELETE` | `/api/tasks/{id}`    | Bearer JWT     |

Task owners come exclusively from the authenticated identity. Cross-user access returns the same 404 response as a missing resource. Updates include the last observed version; stale writes return 409 and the web editor preserves the draft for explicit recovery.

## Verification

Backend verification uses a real MySQL instance through Testcontainers:

```sh
cd backend
./mvnw -B -ntp verify
```

This lifecycle checks formatting and the toolchain, runs unit and integration tests, packages the API, runs SpotBugs and produces a JaCoCo report. Docker is required and missing Docker fails the build.

Frontend verification:

```sh
cd frontend
npm ci
npm run check
```

`check` runs Prettier verification, ESLint with zero warnings, strict TypeScript, 23 focused Vitest tests and a production Vite build.

With the API and MySQL running, execute the four Chromium journeys:

```sh
cd frontend
npm run e2e
```

The journeys cover registration and first-task creation on mobile, editing and filtering on desktop, literal search history, and French dark mode at 320 px with a 200 percent root font size.

Mobile verification:

```sh
cd mobile
dart format --output=none --set-exit-if-changed lib test integration_test
flutter analyze
flutter test
flutter build apk --debug
```

Packaged smoke checks:

```sh
python3 scripts/smoke-api.py http://localhost:8080
python3 scripts/smoke-web.py http://localhost:5173
```

The API smoke test covers health, authentication, CRUD, filtering, cross-user isolation and stale updates. The web smoke test checks the health endpoint and SPA fallback.

## Deployment

The repository includes a reproducible no-cost deployment path using Firebase Hosting, a Render Docker web service, and Aiven for MySQL. The Render Blueprint configures the API without storing credentials, and Firebase serves the compiled SPA from `frontend/dist`.

See [deployment instructions](docs/deployment.md) for provider setup, secret handling, verification, free-plan limits, and the mobile release build command.

GitHub Actions runs backend and frontend verification independently, builds both images, transfers those exact images to a final job, starts them against a fresh MySQL database and runs both smoke suites.

## Architecture

The backend is a feature-organized monolith with `auth`, `users`, `tasks`, `security` and `http` packages. Controllers own HTTP concerns, services own application rules and transaction boundaries, and repositories own persistence. Input DTOs, output DTOs and JPA entities remain separate.

Both clients follow the same feature ownership. Authentication owns credentials and session state. Tasks own API types, validation and task interactions. Shared code is limited to cross-feature configuration, networking, storage, localization, themes and presentation primitives. TanStack Query owns web server state; focused Flutter controllers own mobile screen state.

Flyway owns database changes and Hibernate validates the schema. Open Session in View is disabled. Composite indexes match owner/status filtering and ordering; substring search remains scoped to a user's rows without a full-text performance claim.

See [backend design decisions](docs/backend-design.md), [frontend architecture](frontend/README.md), [UI asset usage](docs/ui/web-asset-usage.md) and [contribution conventions](CONTRIBUTING.md).

## Security and operational boundaries

- The API accepts explicit Bearer headers and does not use authentication cookies or server sessions. CSRF is disabled for this transport.
- CORS uses explicit origins and does not allow credentialed browser requests.
- JWT validation restricts signatures to RS256 and validates issuer, audience, timestamps and subject format.
- Access tokens expire after 15 minutes. Logout removes the client token. There is no refresh endpoint or per-token revocation.
- Error responses are sanitized Problem Details. Correlation IDs connect responses to logs without returning stack traces or SQL details.
- Readiness checks MySQL; liveness does not. Other actuator endpoints are not exposed.
- The API image runs as UID/GID 10001. The web image runs as UID/GID 101 and exposes a minimal `/healthz` endpoint.
- Production deployments must provide HTTPS termination, managed secrets, access control, monitoring and backup procedures.

Potential future scope includes refresh-token revocation, distributed login rate limits, password recovery, production mobile signing and paid production infrastructure. These are outside the implemented contract.
