# Backend design

The backend implements the recruitment specification's six endpoints with Java 21, Spring Boot, Spring Security, Spring Data JPA and MySQL. It is a feature-organized monolith. Controllers own HTTP, services own transactions and authorization, repositories own persistence. Entities never cross the HTTP boundary.

## Contract decisions

- Bearer JWT only. No cookie or HTTP session authentication. CSRF is disabled specifically because credentials are never attached automatically by browsers. CORS has an explicit configurable origin allowlist; credentials are not enabled.
- Registration returns the user identity, never the password hash. Login returns an RS256 access token expiring after 15 minutes. Signature, algorithm, issuer, audience, timestamps and UUID subject are validated. Logout is client-side token disposal; issued tokens remain valid until expiration. Refresh, revocation, cookies and rate limiting are separate future work.
- Emails are stripped and lowercased using Locale.ROOT, limited to 254 characters and unique in MySQL. Passwords are 12 to 128 characters, hashed with Spring Security's scrypt encoder. No password normalization.
- Task status is TODO, IN_PROGRESS or DONE. Creation defaults to TODO. Title is stripped, required and limited to 200 characters. Description is nullable, limited to 5000 characters. Dates are server-owned UTC instants.
- GET /api/tasks accepts status, q (literal substring, maximum 200 characters), page (zero-based), size (1 to 100; default 20). Search covers title and description, case/accent insensitive through the database collation. Sort is createdAt descending then id ascending. Filtering happens before pagination and always scopes by authenticated owner.
- PUT replaces title, description and status and requires the version read by the client. Stale updates return 409. DELETE removes the latest owned resource; concurrent changes during its transaction are rejected by JPA optimistic locking. Cross-user and absent resources both return 404.
- Unknown request properties are rejected, including client-supplied owner IDs and timestamps. Malformed requests return 400. Security and MVC errors use application/problem+json with a stable code and correlation ID, without internal details.
- Flyway owns the schema; Hibernate only validates it. No Open Session in View. Transactions are at service boundaries. User IDs on tasks are scalar foreign keys, avoiding implicit association fetches.
- Public health reveals only status. All other actuator endpoints remain unexposed. Docker runs as a non-root user. MySQL uses a persistent named volume locally.

## Validation

Integration tests exercise real HTTP security filters, Flyway, JPA and MySQL through Testcontainers. Tests include ownership, invalid JWTs, validation, duplicate registration, filtering, pagination, persistence and stale updates. Maven verify also enforces formatting, static analysis and packaging. The image and a fresh Compose database are checked before delivery.
