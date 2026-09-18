# API contract

Base URL: `http://localhost:8080`. JSON requests use `Content-Type: application/json`.
Protected endpoints require `Authorization: Bearer <accessToken>`. Cookies and query-string tokens are not accepted. Serve the API over HTTPS outside local development.

## Authentication

`POST /api/auth/register`

```json
{"email":"alex@example.com","password":"An example passphrase!"}
```

Returns 201 with `id`, normalized `email`, and `createdAt`. Email is stripped, lowercased and limited to 254 characters. Password is 12 to 128 characters and is not trimmed. Duplicate email: 409 `EMAIL_ALREADY_REGISTERED`.

`POST /api/auth/login` accepts the same fields and returns 200:

```json
{"accessToken":"<signed JWT>","tokenType":"Bearer","expiresIn":900}
```

Unknown account and wrong password both return 401 `INVALID_CREDENTIALS`. Responses carrying credentials are not cacheable. The access token expires after 15 minutes with no clock-skew allowance; synchronize clocks across API instances. Dispose of it to log out. There is no refresh or server-side revocation endpoint. A copied token remains usable until expiry. RS256 keys must persist across restarts and instances. Replacing the verification key invalidates previous tokens; planned key rotation with overlap is outside this scope.

## Tasks

`POST /api/tasks`

```json
{"title":"Prepare quarterly report","description":"Include the revised totals","status":"TODO"}
```

Returns 201 with `id`, `title`, `description`, `status`, `createdAt`, `updatedAt`, `version`. `title` is stripped, nonblank, maximum 200 characters. Description may be null and has a 5000-character limit. Status defaults to TODO when omitted or null; allowed values: TODO, IN_PROGRESS, DONE. Dates are server-generated ISO 8601 UTC values. Unknown input fields are rejected.

`GET /api/tasks?status=TODO&q=report&page=0&size=20`

Returns 200:

```json
{"items":[],"page":0,"size":20,"totalElements":0,"totalPages":0}
```

Only the caller's tasks are searched. Status is optional. `q` is stripped, maximum 200 characters, and matches literal substrings of title or description, ignoring case and accents. `%` and `_` are literals, not search wildcards. Empty search matches all tasks. Page starts at 0, is bounded to 1000000; size is 1 to 100. Ordering is `createdAt DESC, id ASC`. An out-of-range page returns an empty items array with the filtered total. Offset pagination can shift when new rows are inserted; it is not a snapshot across requests.

`PUT /api/tasks/{id}`

```json
{"title":"Publish quarterly report","description":null,"status":"DONE","version":0}
```

Returns 200 with the updated task. Title, status and nonnegative version are required. Description is cleared when null or omitted. A stale version returns 409 `TASK_VERSION_CONFLICT`; reload the list and let the user resolve the edit. The response's version is the value to use for the next update.

`DELETE /api/tasks/{id}` returns 204 with no body. It deletes the latest owned resource; it does not require a client version. A conflicting modification during the delete transaction returns 409. Deleting an already deleted task returns 404.

Missing resources and resources belonging to another user both return 404 `TASK_NOT_FOUND`. Owner identity, timestamps and identifiers cannot be set through task inputs. There is no separate GET-by-ID route in this version.

## Errors

All errors use `application/problem+json`:

```json
{
  "type":"about:blank",
  "title":"Bad Request",
  "status":400,
  "detail":"Request validation failed",
  "instance":"/api/tasks",
  "code":"VALIDATION_FAILED",
  "correlationId":"57d7c426-bafe-4bc1-9f9d-9e720bad10a7",
  "errors":[{"field":"title","message":"must not be blank"}]
}
```

The `errors` array is present for field validation. Rejected values, internal exception text, SQL and stack traces are never returned. The response header `X-Correlation-ID` matches the problem and diagnostic logs. Valid UUID correlation headers are accepted; other input is replaced with a generated UUID.

| Status | Meaning |
| --- | --- |
| 400 | Invalid JSON, field, enum, identifier or query parameter |
| 401 | Missing/invalid JWT or invalid login credentials |
| 403 | Access or CORS denied |
| 404 | Missing route or task, including another user's task |
| 405 | Unsupported HTTP method |
| 409 | Duplicate email or stale task version |
| 415 | Unsupported request media type |
| 500 | Unexpected failure, sanitized diagnostic reference only |

## Operational routes

`GET /actuator/health`, `/actuator/health/liveness` and `/actuator/health/readiness` expose status only. Readiness includes database connectivity; liveness does not. Other actuator endpoints are not exposed. Do not use liveness failures to restart the app merely because MySQL is temporarily unavailable.

## Browser integration

The default development allowlist is `http://localhost:5173`; configure `CORS_ALLOWED_ORIGINS` explicitly for deployment. Credentials are not enabled. CSRF is disabled only because this API authenticates exclusively through an explicit Authorization header and accepts neither session nor cookie credentials. Adding cookie authentication requires changing the CSRF contract and tests.

For the future web client, choose and document safe token persistence before implementation. This backend does not endorse storing long-lived secrets in localStorage.
