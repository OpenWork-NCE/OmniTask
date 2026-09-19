# Contributing

## Local backend setup

Requirements:

- Docker Engine with Docker Compose
- OpenSSL
- Java 21 for running Maven directly

Generate the local database passwords and RS256 key pair once:

```sh
./scripts/init-local-env.sh
```

The script writes random passwords to `.env` and a PKCS#8 private key with its
public key to `.secrets/`. Both locations are ignored by Git. Running the script
again preserves every existing secret.

Start MySQL and the API:

```sh
docker compose up --build --wait
```

The API listens on `http://localhost:8080` by default. Its readiness endpoint is
`http://localhost:8080/actuator/health/readiness`. Both published ports bind to
localhost. MySQL data remains in the `omnitask_mysql-data` named volume when the
containers stop.

Stop the containers while retaining local data:

```sh
docker compose down
```

To remove the local database as well, explicitly run `docker compose down -v`.

## Verification

Run the complete backend verification lifecycle from the backend directory:

```sh
cd backend
./mvnw -B -ntp verify
```

This command checks formatting and static analysis, runs unit and Testcontainers
integration tests against MySQL, and packages the application. Docker must be
running so Testcontainers can start its database.

Build the production image separately:

```sh
docker build -t omnitask-api:local backend
```

## Commit messages

Use Conventional Commits in the form `type(scope): description`. Write the
description in English, use the imperative mood, and do not end it with a period.

Examples:

```text
feat(tasks): add status filtering
fix(auth): reject expired tokens
docs(contributing): explain local setup
```

Common types are `feat`, `fix`, `docs`, `test`, `refactor`, `build`, `ci`, and
`chore`. Add `!` before the colon and a `BREAKING CHANGE:` footer when a commit
introduces an incompatible contract change.
