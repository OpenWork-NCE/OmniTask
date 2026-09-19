# ADR 0001: Organize clients by feature

## Decision

The React web client and Flutter mobile client use feature-oriented directories. Each feature owns its transport types, validation, API operations and presentation entry points. Shared infrastructure is kept in `lib`, `core` or `components` only when it has more than one consumer.

## Consequences

The same task behavior can be implemented on both platforms without coupling their UI code. A small feature may keep fewer layers until a second responsibility appears. API contracts remain centralized in the backend documentation and are not duplicated as untracked assumptions.
