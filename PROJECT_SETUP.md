# Campus Lost & Found - Project Setup Guide

**For AI Agents: Read this to understand the project structure and conventions.**

---

## 1. Tech Stack

```
Frontend:        Next.js 14+ (App Router)
UI Library:      React 18+
Language:        TypeScript
Styling:         Tailwind CSS
Package Manager: pnpm
API Fetching:    TanStack Query (React Query)
State Management: Zustand
HTTP Client:     Axios
```

---

## 2. Project Architecture: Feature-Based Modular

### Folder Structure

```
src/
├── app/                                  # Next.js App Router (routes only)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx               # Route to /login
│   │   └── register/page.tsx            # Route to /register
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── items/page.tsx               # Route to /items
│   │   ├── claims/page.tsx              # Route to /claims
│   │   └── profile/page.tsx             # Route to /profile
│   └── api/
│       ├── items/route.ts               # API routes (call backend, not used much)
│       ├── claims/route.ts
│       └── auth/route.ts
│
├── core/                                 # Shared infrastructure
│   ├── api/
│   │   ├── client.ts                    # Axios instance with interceptors
│   │   ├── interceptors.ts              # Auth, error handling
│   │   └── queryClient.ts               # TanStack Query configuration
│   ├── store/
│   │   └── useAppStore.ts               # Global Zustand store (auth, UI state)
│   ├── types/
│   │   ├── api.ts                       # Generic API response types
│   │   └── common.ts                    # Common shared types
│   ├── hooks/
│   │   └── useApi.ts                    # Reusable API hook wrapper (optional)
│   ├── utils/
│   │   ├── validators.ts                # Form validation
│   │   ├── formatters.ts                # Date, string formatting
│   │   └── constants.ts                 # App constants
│   └── middleware/
│       └── auth.ts                      # Auth guards
│
├── common/                               # Shared across all modules
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   ├── Loading.tsx
│   │   └── ErrorBoundary.tsx
│   ├── icons/
│   │   └── index.ts                     # SVG icons or icon components
│   ├── layouts/
│   │   ├── DashboardLayout.tsx
│   │   └── AuthLayout.tsx
│   └── styles/
│       └── globals.css                  # Tailwind imports, global styles
│
└── modules/                              # Feature modules (self-contained)
    ├── items/
    │   ├── components/
    │   │   ├── ItemCard.tsx             # Display single item
    │   │   ├── ItemList.tsx             # Display list of items
    │   │   ├── ItemForm.tsx             # Create/edit item form
    │   │   └── ItemFilters.tsx          # Filter component
    │   ├── types/
    │   │   └── item.ts                  # Item-specific types (Item, ItemRequest, etc)
    │   ├── api/
    │   │   └── itemApi.ts               # TanStack Query hooks (useItems, useCreateItem, etc)
    │   ├── hooks/
    │   │   ├── useItems.ts              # Custom hook wrapping TanStack Query
    │   │   └── useItemFilters.ts        # Item filter state management
    │   ├── store/
    │   │   └── useItemStore.ts          # Zustand store for item-specific UI state
    │   └── pages/
    │       ├── ItemsPage.tsx            # Full page component
    │       └── ItemDetailPage.tsx       # Single item detail page
    │
    ├── claims/
    │   ├── components/
    │   │   ├── ClaimForm.tsx            # Create claim form
    │   │   ├── ClaimCard.tsx            # Display single claim
    │   │   ├── ClaimList.tsx            # Display list of claims
    │   │   └── ClaimStatusBadge.tsx
    │   ├── types/
    │   │   └── claim.ts                 # Claim-specific types
    │   ├── api/
    │   │   └── claimApi.ts              # TanStack Query hooks (useClaims, useCreateClaim, etc)
    │   ├── hooks/
    │   │   └── useClaims.ts
    │   ├── store/
    │   │   └── useClaimStore.ts
    │   └── pages/
    │       ├── ClaimsPage.tsx
    │       └── ClaimDetailPage.tsx
    │
    ├── auth/
    │   ├── components/
    │   │   ├── LoginForm.tsx
    │   │   ├── RegisterForm.tsx
    │   │   └── LogoutButton.tsx
    │   ├── types/
    │   │   └── auth.ts                  # Auth-specific types (User, AuthRequest, etc)
    │   ├── api/
    │   │   └── authApi.ts               # useLogin, useRegister, useLogout hooks
    │   ├── hooks/
    │   │   └── useAuth.ts               # Wrapper around auth API
    │   └── pages/
    │       ├── LoginPage.tsx
    │       └── RegisterPage.tsx
    │
    └── profile/                         # Example: future module
        ├── components/
        ├── types/
        ├── api/
        ├── hooks/
        └── pages/
```

---

## 3. Core Concepts

### **3.1 Module Independence**
- Each module in `src/modules/` is completely self-contained
- Module can import from: `core/`, `common/`, other modules
- `core/` can import from: `common/`
- Dependencies flow: `app/` → `modules/` → `core/` → `common/`

### **3.2 API Layer (TanStack Query)**
**File:** `modules/{feature}/api/{feature}Api.ts`

TanStack Query hooks handle:
- Fetching from backend
- Automatic caching
- Refetching
- Mutations (POST, PATCH, DELETE)

**Example:**
```typescript
// modules/items/api/itemApi.ts
export function useItems() {
  return useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const response = await apiClient.get('/items');
      return response.data as Item[];
    }
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateItemRequest) => {
      const response = await apiClient.post('/items', data);
      return response.data as Item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    }
  });
}
```

### **3.3 State Management (Zustand)**
**For global state only** (auth, UI toggles, filters)

**Global store:** `core/store/useAppStore.ts`
```typescript
// For global state: user, authToken, isSidebarOpen
export const useAppStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  // ...
}));
```

**Module-specific store:** `modules/{feature}/store/use{Feature}Store.ts`
```typescript
// For feature-specific UI state: selected item, filters
export const useItemStore = create((set) => ({
  selectedItemId: null,
  setSelectedItemId: (id) => set({ selectedItemId: id })
}));
```

### **3.4 Types**
**File:** `modules/{feature}/types/{feature}.ts`

```typescript
// modules/items/types/item.ts

// Data model (from backend)
export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  imageUrl?: string;
  foundById: string;
  createdAt: string;
  updatedAt: string;
  status: 'open' | 'claimed' | 'returned';
}

// API Request
export interface CreateItemRequest {
  title: string;
  description: string;
  category: string;
  location: string;
  imageUrl?: string;
}

// API Response (usually same as Item)
export type ItemResponse = Item;
```

---

## 4. How to Add a New Feature (Step by Step)

### Example: Adding a "Notifications" Module

**Step 1: Create module folder structure**
```bash
mkdir -p src/modules/notifications/{components,types,api,hooks,store,pages}
```

**Step 2: Create types file** (`src/modules/notifications/types/notification.ts`)
```typescript
export interface Notification {
  id: string;
  userId: string;
  type: 'claim' | 'approval' | 'rejection';
  message: string;
  read: boolean;
  createdAt: string;
}

export interface CreateNotificationRequest {
  type: string;
  message: string;
}
```

**Step 3: Create API hooks** (`src/modules/notifications/api/notificationApi.ts`)
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';
import { Notification, CreateNotificationRequest } from '../types/notification';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await apiClient.get('/notifications');
      return response.data as Notification[];
    }
  });
}

export function useMarkAsRead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      return response.data as Notification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });
}
```

**Step 4: Create components** (`src/modules/notifications/components/NotificationBell.tsx`)
```typescript
'use client';
import { useNotifications } from '../api/notificationApi';

export function NotificationBell() {
  const { data: notifications } = useNotifications();
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <div>
      <button>🔔</button>
      {unreadCount > 0 && <span>{unreadCount}</span>}
    </div>
  );
}
```

**Step 5: Create page** (`src/modules/notifications/pages/NotificationsPage.tsx`)
```typescript
'use client';
import { useNotifications } from '../api/notificationApi';

export function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Notifications</h1>
      {notifications?.map(notif => (
        <div key={notif.id}>{notif.message}</div>
      ))}
    </div>
  );
}
```

**Step 6: Add route** (`src/app/(dashboard)/notifications/page.tsx`)
```typescript
import { NotificationsPage } from '@/modules/notifications/pages/NotificationsPage';

export default function Page() {
  return <NotificationsPage />;
}
```

**Step 7: Add to header** (`src/common/components/Header.tsx`)
```typescript
import { NotificationBell } from '@/modules/notifications/components/NotificationBell';

export function Header() {
  return (
    <header>
      {/* ... */}
      <NotificationBell />
    </header>
  );
}
```

---

## 5. Common Patterns

### **Pattern 1: Fetch and Display Data**
```typescript
// Component
'use client';
import { useItems } from '../api/itemApi';

export function ItemList() {
  const { data: items, isLoading, error } = useItems();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {items?.map(item => <ItemCard key={item.id} item={item} />)}
    </div>
  );
}
```

### **Pattern 2: Form with Mutation**
```typescript
// Component
'use client';
import { useState } from 'react';
import { useCreateItem } from '../api/itemApi';

export function ItemForm() {
  const [title, setTitle] = useState('');
  const createItem = useCreateItem();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createItem.mutateAsync({ title });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} />
      <button type="submit" disabled={createItem.isPending}>
        {createItem.isPending ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

### **Pattern 3: Global State**
```typescript
// Store
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null })
}));

// Component
'use client';
import { useAuthStore } from '@/core/store/useAppStore';

export function UserMenu() {
  const { user, logout } = useAuthStore();
  return (
    <div>
      <span>{user?.name}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 6. Important Rules

### **DO ✅**
- Keep related code in one module folder
- Use TanStack Query for API data
- Use Zustand for global/UI state
- Create separate hooks for complex logic
- Add TypeScript types for everything
- Use `'use client'` only in components that need interactivity

### **DON'T ❌**
- Don't mix multiple features in one folder
- Don't use `useState` for data from API (use TanStack Query)
- Don't put business logic in components
- Don't import from `modules` into `core`
- Don't fetch data directly in components (use custom hooks)
- Don't skip TypeScript types

---

## 7. Naming Conventions

```
Folders:           lowercase (items, claims, auth)
Components:        PascalCase (ItemCard.tsx, LoginForm.tsx)
Hooks:             useXxx (useItems.ts, useAuth.ts)
Stores:            useXxxStore (useItemStore.ts, useAppStore.ts)
API functions:     useXxx hooks (useCreateItem, useDeleteItem)
Types files:       featureName.ts (item.ts, claim.ts)
Constants:         UPPER_SNAKE_CASE (MAX_FILE_SIZE, DEFAULT_PAGE_SIZE)
```

---

## 8. File Templates

### **Component Template**
```typescript
'use client';
import { ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  className?: string;
}

export function MyComponent({ children, className = '' }: Props) {
  return <div className={className}>{children}</div>;
}
```

### **API Hooks Template**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/core/api/client';
import { MyType } from '../types/myfeature';

export function useMyData() {
  return useQuery({
    queryKey: ['myfeature'],
    queryFn: async () => {
      const response = await apiClient.get('/myfeature');
      return response.data as MyType[];
    }
  });
}
```

### **Store Template**
```typescript
import { create } from 'zustand';

interface MyStore {
  value: string;
  setValue: (value: string) => void;
}

export const useMyStore = create<MyStore>((set) => ({
  value: '',
  setValue: (value) => set({ value })
}));
```

---

## 9. Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Campus Lost & Found
```

Access in code:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

---

## 10. Dependency Injection Across Modules

**Example: Using items in claims module**

```typescript
// modules/claims/api/claimApi.ts
import { apiClient } from '@/core/api/client';
import { Item } from '@/modules/items/types/item';  // ✅ OK to import from another module
import { Claim } from '../types/claim';

export function useClaim(itemId: string) {
  return useQuery({
    queryKey: ['claims', itemId],
    queryFn: async () => {
      const response = await apiClient.get(`/claims?itemId=${itemId}`);
      return response.data as Claim;
    }
  });
}
```

---

## Summary for AI Agents

When generating code:

1. **For API data:** Use TanStack Query hooks in `modules/{feature}/api/`
2. **For global state:** Use Zustand in `core/store/` or `modules/{feature}/store/`
3. **For UI:** Create components in `modules/{feature}/components/`
4. **For types:** Define in `modules/{feature}/types/`
5. **For shared UI:** Use components in `common/components/`
6. **Follow naming conventions:** Components are PascalCase, hooks are useXxx
7. **Keep modules independent:** Everything related to a feature lives in one folder

**Request format for AI:**
> "Add a new feature called X. Create the module structure with types, API hooks, components, and a page. Follow the patterns in modules/items and modules/claims."
