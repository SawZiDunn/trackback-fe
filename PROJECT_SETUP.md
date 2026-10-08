# Campus Lost & Found - Project Setup Guide

**For AI Agents and Developers:** Read this before adding or modifying frontend features.

> **Core rule:** Feature-specific code goes in `src/modules/{feature}/`. Next.js route files go in `src/app/`. Shared infrastructure goes in `src/core/`. Shared UI goes in `src/common/`.

---

## 1. Tech Stack

```text
Frontend:         Next.js 14+ (App Router)
UI Library:       React 18+
Language:         TypeScript
Styling:          Tailwind CSS
Package Manager:  pnpm
API Fetching:     TanStack Query (React Query)
State Management: Zustand
HTTP Client:      Axios
```

---

# 2. Project Architecture: Feature-Based Modular

The frontend uses a **feature/module-based architecture**. Each feature should keep its feature-specific UI, pages, API/query hooks, types, hooks, and state together.

```text
src/
├── app/                                  # Next.js routing layer
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx               # Route: /login - call modules/auth/pages/LoginPage.tsx for nextjs route
│   │   └── register/page.tsx            # Route: /register
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── items/page.tsx               # Route: /items
│   │   ├── items/[id]/page.tsx          # Route: /items/:id
│   │   ├── claims/page.tsx              # Route: /claims
│   │   └── profile/page.tsx             # Route: /profile
│   └── api/                             # OPTIONAL Next.js server API/BFF routes, won't need for our project provided we have an Express backend
│       ├── items/route.ts
│       ├── claims/route.ts
│       └── auth/route.ts
│
├── core/                                 # Shared infrastructure
│   ├── api/
│   │   ├── client.ts                    # Axios instance
│   │   ├── interceptors.ts              # Auth/error handling
│   │   └── queryClient.ts               # TanStack Query configuration
│   ├── store/
│   │   └── useAppStore.ts               # Global Zustand state
│   ├── types/
│   │   ├── api.ts                       # Generic API types
│   │   └── common.ts                    # Shared types
│   ├── hooks/
│   ├── utils/
│   └── middleware/
│
├── common/                               # Shared UI/presentation
│   ├── components/
│   ├── icons/
│   ├── layouts/
│   └── styles/
│
└── modules/                              # Feature modules
    ├── items/
    │   ├── components/
    │   ├── types/
    │   ├── api/
    │   ├── hooks/
    │   ├── store/
    │   └── pages/ - actual pages like ItemsPage.tsx, ItemDetailPage.tsx using components/hooks/api from this module
    ├── claims/
    │   ├── components/
    │   ├── types/
    │   ├── api/
    │   ├── hooks/
    │   ├── store/
    │   └── pages/
    ├── auth/
    │   ├── components/
    │   ├── types/
    │   ├── api/
    │   ├── hooks/
    │   └── pages/
    └── profile/
        ├── components/
        ├── types/
        ├── api/
        ├── hooks/
        └── pages/
```

---

# 3. IMPORTANT: `app/` vs `modules/`

## `src/app/` = Next.js routes

`app/` contains **Next.js App Router route files**. A file such as:

```text
src/app/(dashboard)/items/page.tsx
```

creates the `/items` route. Keep this file thin:

```tsx
import { ItemsPage } from '@/modules/items/pages/ItemsPage';

export default function Page() {
  return <ItemsPage />;
}
```

The route file answers: **"What should Next.js render for this URL?"**

## `src/modules/` = feature implementation

The actual feature belongs in `src/modules/items/`. This contains the feature's UI, page implementation, API/query hooks, types, hooks, and feature-specific state.

The rule is:

> **`app/` knows about URLs. `modules/` knows about features.**

### Why are there two page files?

They are not duplicate pages:

```text
app/(dashboard)/items/page.tsx
        │
        │ Next.js route
        ▼
modules/items/pages/ItemsPage.tsx
        │
        ├── components
        ├── hooks
        ├── api
        ├── store
        └── types
```

`app/.../page.tsx` is the Next.js route entry. `modules/.../pages/...Page.tsx` is the actual feature page implementation.

---

# 4. IMPORTANT: `modules/{feature}/api/` vs `app/api/`

These are **different things**.

## `modules/{feature}/api/` = frontend API client/query layer

Example:

```text
src/modules/items/api/itemApi.ts
```

This contains TanStack Query hooks and calls the backend through the shared Axios client. It **does not create an HTTP endpoint**.

```tsx
export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const response = await apiClient.get('/items');
      return response.data as Item[];
    },
  });
}
```

Normal flow:

```text
Browser
  ↓
modules/items/api/itemApi.ts
  ↓ Axios
core/api/client.ts
  ↓
Express Backend
  ↓
PostgreSQL
```

## `app/api/` = optional Next.js server API/BFF layer

Example:

```text
src/app/api/items/route.ts
```

This creates a real Next.js endpoint such as `/api/items`. It can proxy requests to the Express backend:

```text
Browser
  ↓ /api/items
Next.js app/api/items/route.ts
  ↓
Express Backend
  ↓
PostgreSQL
```

### IMPORTANT

The existence of `modules/items/api/itemApi.ts` does **not** mean `app/api/items/route.ts` is required.

For this project, `app/api/` is **optional** and should only be used when we intentionally need a Next.js server API/BFF endpoint. Do not create an `app/api/{feature}/route.ts` automatically for every feature.

---

# 5. What Goes Where?

| What are you adding? | Put it here |
|---|---|
| Next.js URL route | `src/app/...` |
| Feature page implementation | `src/modules/{feature}/pages/` |
| Feature UI component | `src/modules/{feature}/components/` |
| Feature API/query hooks | `src/modules/{feature}/api/` |
| Feature-specific React hook | `src/modules/{feature}/hooks/` |
| Feature-specific Zustand state | `src/modules/{feature}/store/` |
| Feature-specific TypeScript type | `src/modules/{feature}/types/` |
| Global/shared Zustand state | `src/core/store/` |
| Axios instance | `src/core/api/` |
| TanStack Query configuration | `src/core/api/` |
| Shared UI component | `src/common/components/` |
| Shared layout | `src/common/layouts/` |
| Shared utility | `src/core/utils/` |
| Next.js server API/BFF endpoint | `src/app/api/` |

---

# 6. Adding a New Feature: Step-by-Step

Suppose we add **Notifications**.

## Step 1: Create the module

```text
src/modules/notifications/
├── components/
├── types/
├── api/
├── hooks/
├── store/
└── pages/
```

Only create subfolders that are actually needed; the structure is a convention, not a requirement to create empty folders.

## Step 2: Add feature types

```text
src/modules/notifications/types/notification.ts
```

## Step 3: Add API/query hooks

```text
src/modules/notifications/api/notificationApi.ts
```

Use `core/api/client.ts` to call the Express backend. Use TanStack Query for server data.

## Step 4: Add feature components

```text
src/modules/notifications/components/
├── NotificationBell.tsx
├── NotificationCard.tsx
└── NotificationList.tsx
```

## Step 5: Add the feature page

```text
src/modules/notifications/pages/NotificationsPage.tsx
```

This is the actual page implementation.

## Step 6: Add the Next.js route

```text
src/app/(dashboard)/notifications/page.tsx
```

```tsx
import { NotificationsPage } from '@/modules/notifications/pages/NotificationsPage';

export default function Page() {
  return <NotificationsPage />;
}
```

That route is the bridge between the URL and the feature module.

## Step 7: Add shared integration only when needed

For example, if notifications appear in the global header, the header can import:

```text
modules/notifications/components/NotificationBell.tsx
```

Do not move `NotificationBell` to `common/` merely because the Header uses it. It is still notification-specific.

---

# 7. How to Decide `modules/` vs `common/`

Ask: **"Is this specifically about one feature?"**

If yes, put it in the feature module:

```text
modules/claims/components/ClaimCard.tsx
```

If it is generic and useful across unrelated features, use `common/`:

```text
common/components/Button.tsx
common/components/Modal.tsx
common/components/Loading.tsx
```

Do not move something to `common/` simply because it is used by two components. It should be genuinely reusable and feature-independent.

---

# 8. API Architecture

The normal project flow is:

```text
┌─────────────────────────────────────────────────────┐
│                    Next.js Frontend                 │
│                                                     │
│  app/                                               │
│  └── route files                                    │
│         │                                           │
│         ▼                                           │
│  modules/{feature}/api/{feature}Api.ts              │
│         │                                           │
│         ▼                                           │
│  core/api/client.ts                                 │
└─────────┼───────────────────────────────────────────┘
          │ Axios
          ▼
┌─────────────────────────────────────────────────────┐
│                 Express Backend                     │
│          Controllers → Services → Repositories      │
│                         ↓                           │
│                    PostgreSQL                       │
└─────────────────────────────────────────────────────┘
```

The optional Next.js BFF flow is only used when explicitly needed:

```text
Browser
  ↓
app/api/{feature}/route.ts
  ↓
Express Backend
```

Do not introduce both flows for the same feature without a reason.

---

# 9. Module Independence

A module can use shared infrastructure and shared UI:

```text
modules/{feature}
      ↓
   ┌──┴───────┐
   ↓          ↓
 core/      common/
```

A feature may also import from another feature when there is a real domain dependency.

The important rule is:

> **`core/` must not depend on a feature module.**

For example, `core/api/client.ts` must not import `modules/items/...`.

---

# 10. API Data vs Local UI State

Use **TanStack Query** for server/API data:

```text
Items from backend
Claims from backend
Notifications from backend
User profile from backend
```

Use **Zustand** for client-side UI/application state:

```text
Selected item
Filter UI state
Sidebar open/closed
Global auth/UI state
```

Do not copy server data into Zustand just to avoid TanStack Query.

---

# 11. Complete Feature Example

For Items:

```text
src/
├── app/
│   └── (dashboard)/
│       └── items/
│           ├── page.tsx
│           └── [id]/
│               └── page.tsx
│
└── modules/
    └── items/
        ├── components/
        │   ├── ItemCard.tsx
        │   ├── ItemList.tsx
        │   ├── ItemForm.tsx
        │   └── ItemFilters.tsx
        ├── pages/
        │   ├── ItemsPage.tsx
        │   └── ItemDetailPage.tsx
        ├── api/
        │   └── itemApi.ts
        ├── hooks/
        │   ├── useItems.ts
        │   └── useItemFilters.ts
        ├── store/
        │   └── useItemStore.ts
        └── types/
            └── item.ts
```

Flow for `/items`:

```text
/items
  ↓
app/(dashboard)/items/page.tsx
  ↓
modules/items/pages/ItemsPage.tsx
  ↓
modules/items/components/ItemList.tsx
  ↓
modules/items/api/itemApi.ts
  ↓
core/api/client.ts
  ↓
Express Backend
```

Flow for `/items/123`:

```text
/items/123
  ↓
app/(dashboard)/items/[id]/page.tsx
  ↓
modules/items/pages/ItemDetailPage.tsx
  ↓
modules/items/api/itemApi.ts
  ↓
Express Backend
```

---

# 12. Common Mistakes to Avoid

### ❌ Put the whole feature inside `app/`

Do not do:

```text
app/items/
├── page.tsx
├── ItemCard.tsx
├── ItemForm.tsx
└── itemApi.ts
```

Instead:

```text
app/(dashboard)/items/page.tsx
modules/items/{components,pages,api,types,...}
```

### ❌ Confuse `modules/items/api` with `app/api/items`

```text
modules/items/api/itemApi.ts
    = frontend API client / TanStack Query hooks

app/api/items/route.ts
    = actual Next.js server API endpoint
```

### ❌ Put feature-specific components in `common/`

Use `modules/claims/components/ClaimForm.tsx`, not `common/components/ClaimForm.tsx`, when the component is Claim-specific.

### ❌ Put feature-specific types in `core/types/`

Use `modules/claims/types/claim.ts` for Claim-specific types.

### ❌ Fetch API data directly throughout UI components

Prefer:

```text
Component
  ↓
TanStack Query hook
  ↓
module API
  ↓
core API client
  ↓
Express backend
```

---

# 13. Quick Decision Guide

| Question | Location |
|---|---|
| Is this a URL route? | `src/app/` |
| Is this the actual feature page implementation? | `src/modules/{feature}/pages/` |
| Is this a feature UI component? | `src/modules/{feature}/components/` |
| Is this a feature API/query hook? | `src/modules/{feature}/api/` |
| Is this a feature React hook? | `src/modules/{feature}/hooks/` |
| Is this feature Zustand state? | `src/modules/{feature}/store/` |
| Is this a feature TypeScript type? | `src/modules/{feature}/types/` |
| Is this global/shared state? | `src/core/store/` |
| Is this shared infrastructure? | `src/core/` |
| Is this generic shared UI? | `src/common/` |
| Do we specifically need a Next.js server API/BFF endpoint? | `src/app/api/` |

---

# 14. New Feature Checklist

```text
[ ] Identify the feature/module

[ ] Create src/modules/{feature}/

[ ] Add only the needed subfolders:
    ├── components/
    ├── types/
    ├── api/
    ├── hooks/
    ├── store/
    └── pages/

[ ] Add feature types to modules/{feature}/types/

[ ] Add TanStack Query/API hooks to modules/{feature}/api/

[ ] Add feature UI to modules/{feature}/components/

[ ] Add feature-specific hooks/state only if needed

[ ] Add actual page implementation to modules/{feature}/pages/

[ ] Create the corresponding Next.js route under app/

[ ] Keep app/.../page.tsx thin: route → module page

[ ] Use core/api/client.ts for HTTP requests

[ ] Do NOT create app/api/{feature}/route.ts unless a
    Next.js server API/BFF endpoint is specifically needed

[ ] Put genuinely shared UI in common/

[ ] Keep core/ independent from feature modules
```

---

# 15. Naming Conventions

```text
Folders:            lowercase
                    items, claims, auth, notifications

Components:         PascalCase
                    ItemCard.tsx, ClaimForm.tsx

Feature pages:      PascalCase + Page
                    ItemsPage.tsx, ClaimDetailPage.tsx

Hooks:              useXxx
                    useItems.ts, useClaims.ts

Stores:             useXxxStore
                    useItemStore.ts, useClaimStore.ts

API hooks/functions: useXxx
                    useCreateItem, useReviewClaim

Types files:        featureName.ts
                    item.ts, claim.ts, notification.ts

Constants:          UPPER_SNAKE_CASE
                    MAX_FILE_SIZE, DEFAULT_PAGE_SIZE
```

---

# 16. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Campus Lost & Found
```

The shared Axios client in `src/core/api/client.ts` should use the configured backend URL.

---

# 17. Summary for AI Agents

When generating or modifying frontend code:

1. **Identify the feature first.** Put feature-specific code under `src/modules/{feature}/`.
2. **Use `app/` only for Next.js routing.** Keep route `page.tsx` files thin.
3. **Put feature page implementations in `modules/{feature}/pages/`.**
4. **Put feature API/query hooks in `modules/{feature}/api/`.**
5. **Use `core/api/client.ts` for HTTP requests.**
6. **Do not confuse `modules/{feature}/api/` with `app/api/`.**
7. **Do not create `app/api/{feature}/route.ts` automatically.** It is only for an intentional Next.js server API/BFF layer.
8. **Put feature UI in `modules/{feature}/components/`.**
9. **Put feature types in `modules/{feature}/types/`.**
10. **Put feature hooks/state in the corresponding module folders.**
11. **Put genuinely shared UI in `common/`.**
12. **Put shared infrastructure in `core/`.**
13. **Follow the existing module pattern instead of inventing a new structure.**

### Standard new-feature pattern

```text
src/modules/notifications/
├── components/
├── types/
├── api/
├── hooks/
├── store/
└── pages/

src/app/(dashboard)/notifications/
└── page.tsx
```

Relationship:

```text
app/(dashboard)/notifications/page.tsx
                │
                ▼
modules/notifications/pages/NotificationsPage.tsx
                │
       ┌────────┼─────────┐
       ▼        ▼         ▼
 components    hooks      api
                          │
                          ▼
                    core/api/client
                          │
                          ▼
                   Express Backend
```

**This is the standard pattern to follow for new features.**
