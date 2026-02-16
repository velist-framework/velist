# Basic CRUD Example

This example demonstrates a complete CRUD feature for managing a simple resource (Blog Posts).

## Files

```
src/features/posts/
├── api.ts              # API routes
├── service.ts          # Business logic + TypeBox schemas
├── repository.ts       # Database access
└── pages/
    ├── Index.svelte    # List all posts
    ├── Create.svelte   # Create form
    ├── Edit.svelte     # Edit form
    └── Show.svelte     # View single post
```

## Quick Start

1. Copy the `posts` folder to `src/features/`
2. Add to database schema in `connection.ts`
3. Generate and run migrations
4. Mount in `bootstrap.ts`
5. Access at `/posts`

## Features Demonstrated

- ✅ TypeBox validation
- ✅ Repository pattern
- ✅ Inertia.js forms
- ✅ Error handling
- ✅ Flash messages
- ✅ Pagination
- ✅ Search/filter
- ✅ Soft delete

## Code Highlights

### Repository with Pagination

```typescript
async findPaginated(page: number = 1, perPage: number = 10, search?: string) {
  let query = db.selectFrom('posts')
    .where('deleted_at', 'is', null)
  
  if (search) {
    query = query.where('title', 'like', `%${search}%`)
  }
  
  const offset = (page - 1) * perPage
  
  const [data, countResult] = await Promise.all([
    query
      .selectAll()
      .limit(perPage)
      .offset(offset)
      .execute(),
    query
      .select((eb) => eb.fn.count('id').as('count'))
      .executeTakeFirst()
  ])
  
  return {
    data,
    meta: {
      current_page: page,
      last_page: Math.ceil(Number(countResult?.count || 0) / perPage),
      per_page: perPage,
      total: Number(countResult?.count || 0)
    }
  }
}
```

### Search Form with Debounce

```svelte
<script>
  import { useForm } from '@inertiajs/svelte'
  import { debounce } from '$shared/lib/utils'
  
  let { posts, filters } = $props()
  
  const searchForm = useForm({
    search: filters.search || ''
  })
  
  const debouncedSearch = debounce(() => {
    $searchForm.get('/posts', { preserveState: true })
  }, 300)
</script>

<input
  type="search"
  bind:value={$searchForm.search}
  oninput={debouncedSearch}
  placeholder="Search posts..."
/>
```

## Try It

```bash
# After copying files
bun run db:generate
bun run db:migrate
bun run dev

# Visit http://localhost:3000/posts
```
