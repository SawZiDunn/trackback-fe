## Project Structure

- `src/app/` - Routing layer; Next.js App Router route files map URLs to feature pages. Route files stay thin (`page.tsx` renders a module page).
- `src/modules/{feature}/pages/` - Feature page implementations (e.g. `ClaimsPage`, `FoundItemDetailPage`).
- `src/modules/{feature}/components/` - Feature-specific UI (e.g. `ClaimItemDialog`, `LoginForm`).
- `src/modules/{feature}/api/` - Feature API layer; TanStack Query hooks that call the backend through the shared Axios client.
- `src/modules/{feature}/types/` - Feature-specific request/response types.
- `src/modules/{feature}/hooks/`, `src/modules/{feature}/store/` - Feature-specific hooks and Zustand state (only when needed).
- `src/core/` - Shared infrastructure: Axios client, interceptors, QueryClient configuration, React providers, and global state.
- `src/common/` - Shared UI that is not tied to one feature (Header, Footer, NavBar, Button).

Feature modules currently in the repository: `auth`, `lost-items`, `found-items`, `claims`, `my-posts`, `profile`.

### System context

The backend is maintained in a separate repository and is consumed through its
HTTP API. This repository contains only the frontend: a Next.js application
that renders pages, manages client session state, and talks to the backend over
HTTPS using Axios with HTTP-only cookie authentication.

The frontend runs as a single deployable Next.js application. Internally it is
organized as a modular monolith: one deployment unit divided into feature
modules with one-way dependency rules (modules may use `core/` and `common/`;
`core/` depends on no feature).

## Feature-based modular architecture

TrackBack groups code by feature first, and by technical role second. Each
feature keeps its pages, components, API hooks, and types together, while
routing, shared infrastructure, and shared UI live outside the features:

```text
URL (/claims/123)
    |
    v
src/app/claims/[id]/page.tsx     Routing: URL -> feature page
    |
    v
src/modules/claims/              Feature slice
    pages/ClaimDetailPage.tsx       Page implementation
    components/                     Feature UI
    api/claimApi.ts                 TanStack Query hooks
    types/claim.ts                  Feature contracts
    |
    v
src/core/api/client.ts           Shared Axios instance (one client, interceptors)
    |
    v
Express backend                  Separate repository, HTTP + cookie auth
```

Requests flow one way: route file -> module page -> module components ->
module API hooks -> shared client -> backend. `app/` knows about URLs;
`modules/` knows about features; `core/` and `common/` know nothing about
specific features (`core/` must not import from `modules/`).

### Why we use this architecture

- **Separation of concerns:** routing, feature UI, data fetching, and shared
  infrastructure have distinct locations, so a URL change never touches
  business UI and an infrastructure change never rewrites feature code.

- **Change isolation:** the HTTP layer is confined to `modules/*/api/` and
  `core/api/`. Swapping the API client, backend base URL, or query library is
  an infrastructure change rather than an edit in every component.

- **Consistency:** every feature follows the same shape
  (pages/components/api/types), so new modules copy a known pattern instead of
  inventing structure.

- **Team scalability:** features are vertical slices, so work on claims,
  notifications, or profile mostly touches one folder each, with fewer
  merge conflicts across the team.

## Server state vs UI state

Data ownership decides where state lives:

- **TanStack Query** owns server data: items, claims, notifications, user
  profile. Components read it through query hooks; mutations invalidate the
  affected query keys, and the UI re-renders from the cache.
- **Zustand** owns client session/UI state (current user session, global app
  state). Server data is not copied into Zustand.

The design patterns behind these decisions (feature slices, singleton API
client, facade hooks, provider, interceptor, guard) are documented in
[design-patterns.md](design-patterns.md).
