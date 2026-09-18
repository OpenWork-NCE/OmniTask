# Backend implementation plan

Goal: deliver the specified backend with reproducible tooling and evidence from real MySQL tests.
Architecture: feature-organized monolith; auth, users, tasks and shared HTTP/security configuration.
Spec: backend-design.md.

- [ ] Bootstrap pinned Maven build, wrapper and application configuration. Verify dependency resolution and compilation.
- [ ] Write HTTP integration tests for registration/login, ownership, task CRUD, validation, JWT failure and optimistic conflict. Run them against a bootable baseline and confirm missing features fail.
- [ ] Implement migrations, entities, DTOs, repositories, services, JWT security and uniform errors. Run integration tests and fix the actual failures.
- [ ] Add targeted edge-case tests for search escaping, pagination, CORS, timestamps, database constraints and error sanitization. Verify each added behavior.
- [ ] Add non-root image, local Compose, CI and concrete API/setup documentation. Build and smoke-test from a fresh database.
- [ ] Run clean Maven verify, inspect the diff, record executed checks and make coherent Conventional Commits.

No frontend, Flutter, refresh-token service or GCP infrastructure is included in this backend change. No invented collaboration or historical commits.
