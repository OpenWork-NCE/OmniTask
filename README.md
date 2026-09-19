# OmniTask

Java REST API for private task management. This repository currently contains the backend, its MySQL migrations, integration tests and delivery tooling. The web, Flutter and infrastructure directories are scaffolded in `frontend/`, `mobile/` and `infra/`; their feature implementations remain separate from the completed backend.

## Versions

Spring Boot 4.1.1, Java 21, Maven Wrapper 3.3.4/Maven 3.9.11 and MySQL 8.4.11. Docker uses Temurin 21.0.12+8 and base images are fixed by digest; CI uses the same JDK version.

## Requirements

- Docker Engine and Docker Compose 2.24.4 or newer, with permission to use the Docker daemon.
- OpenSSL for generating local development secrets.
- For host development: JDK 21, `unzip`, and either `curl` or `wget`. Maven Wrapper downloads and verifies Maven 3.9.11; a global Maven installation is not required.
- Network access on the first build to retrieve dependencies and container images.

## Run with Docker

From the repository root:

```sh
./scripts/init-local-env.sh
docker compose up --build --wait
curl --fail http://localhost:8080/actuator/health/readiness
```

The script creates random local database passwords and an RSA key pair. It preserves existing secrets. `.env` and `.secrets/` are ignored by Git. Do not copy placeholder passwords from `.env.example` into an existing `.env` and expect the script to replace them.

The API binds to `127.0.0.1:8080`; MySQL binds to `127.0.0.1:3306`. Stop the services with `docker compose down`. Database data remains in the named volume. `docker compose down --volumes` irreversibly deletes that local database; use it only when intentionally resetting local data.

On Linux, `.secrets/` is mode 0700. Individual key files are readable by the non-root container after bind mounting; other host users cannot traverse the containing directory. Use a managed secret mount with appropriate permissions in a deployed environment.

## Develop on the host

Start only MySQL, then export the generated configuration:

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

A corrected Temurin JDK was installed locally for this workspace under `.tools/jdk-21` (ignored by Git). To use it from the repository root, run `export JAVA_HOME="$PWD/.tools/jdk-21"` before entering `backend`. On another machine, install a supported JDK 21 and set `JAVA_HOME` normally.

## Configuration

| Variable | Meaning | Default |
| --- | --- | --- |
| `DB_URL` | JDBC URL | Local MySQL database `omnitask`, UTC session |
| `DB_USERNAME` | Application database user | `omnitask` |
| `DB_PASSWORD` | Database password | Required |
| `DB_POOL_SIZE` | Maximum connections per API instance | `5` |
| `JWT_PRIVATE_KEY` | PKCS#8 RSA private key resource, normally `file:/...` | Required |
| `JWT_PUBLIC_KEY` | X.509 RSA public key resource | Required |
| `JWT_ISSUER` | Required issuer claim | `omnitask` |
| `JWT_AUDIENCE` | Required audience claim | `omnitask-api` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated explicit origins | `http://localhost:5173` |
| `PORT` | HTTP port | `8080` |

JWT lifetime is 15 minutes. The application validates configured lifetimes between 1 and 30 minutes. Never commit private keys, passwords, access tokens or environment files. HTTPS termination, deployment access control and secret provisioning are the operator's responsibility.

## API

See [the API contract](docs/api/README.md) for complete constraints, requests, responses, error codes, pagination and concurrency behavior.

| Method | Path | Authentication |
| --- | --- | --- |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/tasks` | Bearer JWT |
| POST | `/api/tasks` | Bearer JWT |
| PUT | `/api/tasks/{id}` | Bearer JWT |
| DELETE | `/api/tasks/{id}` | Bearer JWT |

Example registration:

```sh
curl --request POST http://localhost:8080/api/auth/register \
  --header 'Content-Type: application/json' \
  --data '{"email":"alex@example.com","password":"An example passphrase!"}'
```

Login returns an `accessToken`; send it using `Authorization: Bearer <accessToken>`. Task owners come exclusively from the authenticated identity. Cross-user mutations return the same 404 as missing resources. PUT requires the version from the last task response; stale updates return 409.

## Verification

```sh
cd backend
./mvnw -B -ntp clean verify
```

Docker is mandatory for integration tests. Testcontainers creates an isolated real MySQL database, runs Flyway migrations and removes its containers afterward. No development database or external API is needed. A missing Docker daemon fails verification rather than skipping tests.

`verify` runs format checks, toolchain enforcement, unit tests when present, compilation, packaging, HTTP/persistence integration tests, SpotBugs and a JaCoCo report. `test` alone does not run the `*IT` integration suite. Run `./mvnw spotless:apply` to apply the shared Java format.

Reports are written to `backend/target/failsafe-reports/`, `backend/target/spotbugsXml.xml` and `backend/target/site/jacoco/index.html`. Coverage is diagnostic, not a claim that every risk is covered.

After starting the API, run `python3 scripts/smoke-api.py` from the repository root for an actual HTTP smoke check. It creates two test accounts, exercises ownership and conflicts, and deletes its task; the accounts remain in that database.

There is one narrow SpotBugs exclusion for retaining a constructor-injected Spring transactional service in `TaskController`. Copying the service would bypass its proxy. Other findings remain blocking.

GitHub Actions runs the same Maven lifecycle, builds the image, then boots it against a fresh Compose database and runs the HTTP smoke check. `compose.ci.yml` isolates that check from the host MySQL port. Test reports are retained as CI artifacts.

## Architecture and dependencies

The backend is a feature-organized monolith: `auth`, `users`, `tasks`, `security` and `http`. Controllers handle HTTP; services own transactions and authorization; repositories perform persistence. Input records, response records and JPA entities are separate. There are no generic service/repository wrappers or generated mapping layers.

Spring Boot's pinned dependency BOM manages Spring, Hibernate, Jackson, Flyway, MySQL JDBC and Testcontainers versions. Direct build plugins and the Maven distribution are pinned. Bouncy Castle is present specifically for Spring Security's scrypt implementation. API documentation is maintained as a concrete contract without adding a runtime documentation dependency.

Flyway owns schema changes; Hibernate validates them. Open Session in View is disabled. Task ownership is represented by a scalar UUID with a database foreign key, avoiding implicit association loading. Composite indexes match owner/status filtering and ordering; substring searches still scan the matching user's rows. No full-text performance claim is made.

See [design decisions](docs/backend-design.md) and [contribution conventions](CONTRIBUTING.md).

## Client and infrastructure skeleton

- [Web structure](frontend/README.md) follows React/Vite/TypeScript feature boundaries.
- [Mobile structure](mobile/README.md) follows Flutter feature boundaries and the shared API contract.
- [Infrastructure structure](infra/README.md) reserves Docker, GCP and Terraform concerns.
- [UI architecture](docs/ui/README.md) and [client folder decision](docs/adr/0001-client-folder-structure.md) define the shared boundaries.

## Security and operational boundaries

- Only explicitly supplied Bearer headers authenticate requests; no cookies or server sessions. CSRF is disabled for this transport. Adding cookie authentication requires changing that decision and its tests.
- CORS uses an explicit allowlist without credentialed browser requests.
- JWT verification restricts the algorithm to RS256 and validates signature, issuer, audience, timestamps and subject format. Access tokens contain user IDs, not passwords or email addresses.
- Logout means client-side token disposal. There is no refresh endpoint or per-token revocation; an already issued token remains valid until expiration.
- Errors use sanitized Problem Details, including authentication failures and firewall rejections. Correlation IDs connect responses to logs. Low-level Hibernate SQL error logging is disabled because database messages may contain rejected email addresses.
- Health endpoints expose status only. Readiness checks MySQL; liveness does not. Other actuator endpoints are not exposed.
- The image runs as UID/GID 10001. Migrations currently execute during startup using the application database account. A deployment with separate migration credentials/job is a future operational enhancement.

Optional follow-up work, not implemented: refresh sessions and revocation, distributed login rate limits, email verification/password recovery, web/mobile clients, GCP infrastructure, managed backups/restore drills and production monitoring. Public Internet deployment should include a deliberate abuse-control policy.
