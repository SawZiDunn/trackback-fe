# API Patterns Reference

Use these patterns when creating API hooks. Copy and adapt for your feature.

---

## Basic Fetch (useQuery)

**When:** Getting data from backend
**Pattern:**
```typescript
export function useItems() {
  return useQuery({
    queryKey: ['items'],                    // Unique key for caching
    queryFn: async () => {                  // Function to fetch
      const response = await apiClient.get('/items');
      return response.data as Item[];       // Type the response
    }
  });
}
```

**In Component:**
```typescript
const { data: items, isLoading, error } = useItems();

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
return <div>{items?.map(item => <div>{item.title}</div>)}</div>;
```

---

## Fetch Single Item (useQuery with Params)

**When:** Getting one item by ID
**Pattern:**
```typescript
export function useItem(id: string) {
  return useQuery({
    queryKey: ['items', id],                // Include ID in key
    queryFn: async () => {
      const response = await apiClient.get(`/items/${id}`);
      return response.data as Item;
    },
    enabled: !!id                           // Don't fetch if no ID
  });
}
```

**In Component:**
```typescript
const { data: item } = useItem(itemId);
return <div>{item?.title}</div>;
```

---

## Create (useMutation)

**When:** POST new data to backend
**Pattern:**
```typescript
export function useCreateItem() {
  const queryClient = useQueryClient();    // For invalidating cache

  return useMutation({
    mutationFn: async (data: CreateItemRequest) => {
      const response = await apiClient.post('/items', data);
      return response.data as Item;
    },
    onSuccess: () => {
      // Refetch data after success
      queryClient.invalidateQueries({ queryKey: ['items'] });
    }
  });
}
```

**In Component:**
```typescript
const createItem = useCreateItem();

const handleSubmit = async (formData: CreateItemRequest) => {
  try {
    const newItem = await createItem.mutateAsync(formData);
    console.log('Created:', newItem);
  } catch (error) {
    console.error('Error:', error);
  }
};

return (
  <button 
    onClick={() => handleSubmit(data)}
    disabled={createItem.isPending}
  >
    {createItem.isPending ? 'Creating...' : 'Create'}
  </button>
);
```

---

## Update (useMutation)

**When:** PATCH/PUT to update existing data
**Pattern:**
```typescript
export function useUpdateItem(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Item>) => {
      const response = await apiClient.patch(`/items/${id}`, data);
      return response.data as Item;
    },
    onSuccess: () => {
      // Invalidate both list and detail caches
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['items', id] });
    }
  });
}
```

**In Component:**
```typescript
const updateItem = useUpdateItem(itemId);

const handleUpdate = async (newData: Partial<Item>) => {
  await updateItem.mutateAsync(newData);
};

return (
  <button disabled={updateItem.isPending}>
    {updateItem.isPending ? 'Saving...' : 'Save'}
  </button>
);
```

---

## Delete (useMutation)

**When:** DELETE to remove data
**Pattern:**
```typescript
export function useDeleteItem(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/items/${id}`);
      // No return needed for DELETE
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['items', id] });
    }
  });
}
```

**In Component:**
```typescript
const deleteItem = useDeleteItem(itemId);

const handleDelete = async () => {
  if (confirm('Are you sure?')) {
    await deleteItem.mutateAsync();
  }
};

return (
  <button onClick={handleDelete} disabled={deleteItem.isPending}>
    {deleteItem.isPending ? 'Deleting...' : 'Delete'}
  </button>
);
```

---

## Fetch with Filters/Params

**When:** GET with query parameters
**Pattern:**
```typescript
interface ItemFilters {
  category?: string;
  status?: string;
  limit?: number;
}

export function useItems(filters?: ItemFilters) {
  return useQuery({
    queryKey: ['items', filters],           // Include filters in key
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await apiClient.get(`/items?${params.toString()}`);
      return response.data as Item[];
    }
  });
}
```

**In Component:**
```typescript
const [filters, setFilters] = useState({ category: 'electronics' });
const { data: items } = useItems(filters);

// When filters change, hook automatically refetches
```

---

## Paginated Fetch

**When:** Getting paginated results
**Pattern:**
```typescript
export function useItemsPage(page: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: ['items', page, pageSize],    // Include pagination in key
    queryFn: async () => {
      const response = await apiClient.get('/items', {
        params: { page, pageSize }
      });
      return response.data as {
        items: Item[];
        total: number;
        page: number;
      };
    }
  });
}
```

**In Component:**
```typescript
const [page, setPage] = useState(1);
const { data: result } = useItemsPage(page);

return (
  <div>
    {result?.items.map(item => <ItemCard key={item.id} item={item} />)}
    <div>
      <button onClick={() => setPage(p => p - 1)} disabled={page === 1}>
        Previous
      </button>
      <span>Page {page} of {Math.ceil(result?.total || 0 / 10)}</span>
      <button onClick={() => setPage(p => p + 1)}>Next</button>
    </div>
  </div>
);
```

---

## Upload File

**When:** POST with FormData (file upload)
**Pattern:**
```typescript
export function useUploadItemImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/items/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data as { url: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    }
  });
}
```

**In Component:**
```typescript
const uploadImage = useUploadItemImage();

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const result = await uploadImage.mutateAsync(file);
    console.log('Image URL:', result.url);
  }
};

return (
  <input
    type="file"
    onChange={handleFileChange}
    disabled={uploadImage.isPending}
  />
);
```

---

## Dependent Queries (Query B depends on Query A)

**When:** Query result is needed before fetching another
**Pattern:**
```typescript
export function useItemWithClaims(itemId: string) {
  // First query - get item
  const itemQuery = useQuery({
    queryKey: ['items', itemId],
    queryFn: async () => {
      const response = await apiClient.get(`/items/${itemId}`);
      return response.data as Item;
    },
    enabled: !!itemId
  });

  // Second query - depends on first
  const claimsQuery = useQuery({
    queryKey: ['claims', itemId],
    queryFn: async () => {
      const response = await apiClient.get(`/claims?itemId=${itemId}`);
      return response.data as Claim[];
    },
    enabled: !!itemQuery.data    // Wait for first query
  });

  return { item: itemQuery.data, claims: claimsQuery.data };
}
```

**In Component:**
```typescript
const { item, claims } = useItemWithClaims(itemId);

// Wait for both to load
if (!item || !claims) return <div>Loading...</div>;

return <div>{item.title} has {claims.length} claims</div>;
```

---

## Multiple Mutations (Sequential)

**When:** Need to do multiple operations in order
**Pattern:**
```typescript
export function useCreateClaimFlow() {
  const queryClient = useQueryClient();
  const createClaim = useMutation({
    mutationFn: async (data: CreateClaimRequest) => {
      const response = await apiClient.post('/claims', data);
      return response.data as Claim;
    }
  });

  const notifySeller = useMutation({
    mutationFn: async (claimId: string) => {
      await apiClient.post(`/claims/${claimId}/notify-seller`);
    }
  });

  // Combined function
  const submitFlow = async (claimData: CreateClaimRequest) => {
    const claim = await createClaim.mutateAsync(claimData);
    await notifySeller.mutateAsync(claim.id);
    queryClient.invalidateQueries({ queryKey: ['claims'] });
  };

  return { submitFlow, isLoading: createClaim.isPending || notifySeller.isPending };
}
```

**In Component:**
```typescript
const { submitFlow, isLoading } = useCreateClaimFlow();

const handleSubmit = async (data: CreateClaimRequest) => {
  try {
    await submitFlow(data);
    console.log('Claim created and seller notified');
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## Error Handling

**When:** Need to handle errors from API
**Pattern:**
```typescript
export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateItemRequest) => {
      try {
        const response = await apiClient.post('/items', data);
        return response.data as Item;
      } catch (error: any) {
        // Handle specific errors
        if (error.response?.status === 400) {
          throw new Error('Invalid data');
        } else if (error.response?.status === 401) {
          throw new Error('Not authenticated');
        } else if (error.response?.status === 403) {
          throw new Error('Not authorized');
        }
        throw new Error('Failed to create item');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error.message);
    }
  });
}
```

**In Component:**
```typescript
const createItem = useCreateItem();

const handleSubmit = async (data: CreateItemRequest) => {
  try {
    await createItem.mutateAsync(data);
  } catch (error) {
    // Error already handled, just show in UI
    console.error(error);
  }
};

return (
  <div>
    <button onClick={() => handleSubmit(data)} disabled={createItem.isPending}>
      Create
    </button>
    {createItem.error && (
      <div className="text-red-500">{createItem.error.message}</div>
    )}
  </div>
);
```

---

## Optimistic Updates

**When:** Update UI before response from server
**Pattern:**
```typescript
export function useUpdateItemOptimistic(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Item>) => {
      const response = await apiClient.patch(`/items/${id}`, data);
      return response.data as Item;
    },
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['items', id] });

      // Snapshot old data
      const previousData = queryClient.getQueryData(['items', id]);

      // Update cache immediately
      queryClient.setQueryData(['items', id], (old: Item) => ({
        ...old,
        ...newData
      }));

      return { previousData };
    },
    onError: (error, newData, context) => {
      // Revert on error
      if (context?.previousData) {
        queryClient.setQueryData(['items', id], context.previousData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', id] });
    }
  });
}
```

---

## Summary Table

| Operation | Hook Pattern | HTTP Method | Invalidate |
|-----------|--------------|-------------|-----------|
| Read list | `useQuery` | GET | N/A |
| Read one | `useQuery` | GET /id | N/A |
| Create | `useMutation` | POST | Yes |
| Update | `useMutation` | PATCH | Yes |
| Delete | `useMutation` | DELETE | Yes |
| Upload file | `useMutation` | POST FormData | Yes |

---

## Tips & Tricks

### 1. Always type responses
```typescript
return response.data as Item[];  // ✅ Good
return response.data;            // ❌ No type
```

### 2. Include variables in query key
```typescript
queryKey: ['items', { category: 'electronics', status: 'open' }]  // ✅ Caches separately
queryKey: ['items']  // ❌ Won't differentiate filters
```

### 3. Use enabled for conditional queries
```typescript
enabled: !!userId  // ✅ Wait for userId
// vs
queryKey: ['user', userId]  // Less clear
```

### 4. Always invalidate after mutations
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['items'] });  // ✅ Refetch
}
// Without this, UI won't update automatically
```

### 5. Handle loading/error in components
```typescript
const { data, isLoading, error } = useQuery(...);

if (isLoading) return <Loading />;
if (error) return <Error error={error} />;

return <Success data={data} />;
```

---

**Use these patterns as templates. Copy, modify the names and endpoints, done!** ✨
