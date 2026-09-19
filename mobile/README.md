# Mobile application structure

The mobile client is reserved for the Flutter implementation described in the project brief. It consumes the same Spring Boot API and JWT contract as the web client.

```text
lib/
  app/                         application bootstrap and navigation
  core/                        configuration, network, storage, theme and widgets
  features/auth/               authentication data, domain and presentation
  features/tasks/              task data, domain and presentation
test/                          unit and widget tests
integration_test/              device-level API and navigation tests
assets/                        bundled images, icons and fonts
```

Each feature is split into `data`, `domain` and `presentation` only where that separation has a concrete responsibility. The mobile client must reuse the backend routes and validation rules documented in `docs/api/README.md`.
