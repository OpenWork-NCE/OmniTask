# OmniTask mobile

The Flutter client consumes the same Spring Boot API and JWT contract as the web application. It provides bilingual authentication and task management on Android and iOS, with system, light and dark themes and native haptic feedback.

## Toolchain

- Flutter 3.47.5 stable
- Dart 3.13.4
- Android API 36, minimum API 24
- Java 21 for Android builds

Install the exact Flutter version from the official SDK archive, then run:

```sh
cd mobile
flutter pub get
flutter run
```

The default API origin is `http://10.0.2.2:8080` on an Android emulator and `http://127.0.0.1:8080` on iOS. Override it for a device or deployed environment:

```sh
flutter run --dart-define=API_BASE_URL=https://api.example.com
```

Use HTTPS outside local development. Android permits cleartext traffic only in debug builds, and iOS permits local networking for development.

## Product behavior

- Registration and login use the backend validation and JWT contract.
- The access token is stored in Android encrypted storage or the iOS Keychain through `flutter_secure_storage`.
- Sessions end at the server-provided expiry or after any authenticated `401` response. There is no refresh token or server-side logout endpoint.
- Tasks support search, status filtering, pagination, pull-to-refresh, creation, editing and confirmed deletion.
- Updates send the last observed version. A `409 TASK_VERSION_CONFLICT` keeps the draft open and offers an explicit reload.
- English is the default language and French is fully localized with Flutter's generated localization support.
- Theme and locale preferences persist separately from credentials.
- Selection, success and destructive actions use Flutter's native haptic APIs. Reduced animation preferences disable decorative background motion.

## Architecture

The client remains a feature-organized monolith:

```text
lib/
  app/                  bootstrap, root state and application settings
  core/                 configuration, network, storage, theme and shared widgets
  features/auth/        session, API access and authentication presentation
  features/tasks/       task contract, API access and task presentation
  l10n/                 English and French ARB catalogs
test/                   focused domain and transport tests
integration_test/       reserved for device journeys requiring an emulator
assets/                 supplied OmniTask logos, fonts and abstract graphics
```

Controllers own screen state and application operations. Repositories own HTTP serialization. Domain objects remain independent from widgets. The app uses Flutter `ChangeNotifier` and Material navigation directly because the current two-screen flow does not justify an external state-management or routing dependency.

`dio` provides timeouts, cancellation-ready HTTP infrastructure and interceptors. `flutter_secure_storage` provides platform credential storage. `shared_preferences` stores non-sensitive preferences. `flutter_svg` renders the supplied vector identity. Haptics, animations, localization and theming use Flutter SDK APIs.

## Verification

```sh
cd mobile
dart format --output=none --set-exit-if-changed lib test integration_test
flutter analyze
flutter test
flutter build apk --debug
```

The focused tests cover valid and expired session restoration, secure logout behavior, literal query serialization, optimistic version updates, conflict error preservation and a deterministic authentication-screen golden. GitHub Actions runs the same checks with Flutter 3.47.5 and uploads the resulting debug APK.

The repository does not contain a production signing key. Configure Android release signing and Apple provisioning through protected CI secrets before store distribution; never commit those credentials.
