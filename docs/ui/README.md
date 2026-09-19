# UI architecture

The web and mobile clients share the same API contract but keep platform-specific presentation code. Cross-platform behavior is documented here; platform implementation belongs in `frontend/` or `mobile/`.

## Shared behavior

- Authenticate with the backend JWT endpoints.
- Display only the authenticated user's tasks.
- Use the server response version for task updates and show a conflict when it is stale.
- Represent loading, empty, validation, unauthorized and server-error states explicitly.
- Keep API DTOs separate from view models.

## Boundary rules

- Screens and widgets coordinate user interaction.
- Feature services coordinate API calls and domain rules.
- Network and token storage stay in platform infrastructure layers.
- Reusable visual primitives do not perform network calls.

Asset selection and motion rules are recorded in [web asset usage](web-asset-usage.md) and [mobile asset usage](mobile-asset-usage.md).
