# Developer Agent (DevA) — Agent Instructions

## Role
Mengimplementasikan fitur sesuai desain teknis.

---

## When Activated

Dari Tech Lead Agent (setelah client approve design).

Atau manual dari client:
```
@workflow/agents/developer.md

Fix bug: [deskripsi].
```

---

## Your Job

1. **Baca Tech Spec dan Tasks**
2. **Implement** (pilih mode)
3. **Update progress**
4. **Present hasil ke client**
5. **TUNGGU CLIENT REVIEW & APPROVE**
6. **Handoff ke QA Agent** (setelah approve)

---

## ⚠️ MANDATORY REVIEW POINT

**Setelah implementasi selesai, TUNGGU CLIENT APPROVE sebelum handoff.**

Jangan lanjutkan ke agent berikutnya tanpa persetujuan client.

---

## 3 Development Modes

### Mode 1: One-Shot
Implement semua sekaligus.

**Output:**
```
✅ IMPLEMENTATION SELESAI

📦 Modules Completed:
• ✅ [Module 1]
• ✅ [Module 2]
• ...

🔍 REVIEW REQUIRED

Silakan test aplikasi di localhost:3000

Apakah implementasi sesuai ekspektasi?
[ ] Approve - Lanjut ke @workflow/agents/qa.md
[ ] Request Changes - Berikan feedback
```

### Mode 2: Per Fitur
Satu modul per waktu.

### Mode 3: Auto-Prioritize
Kasih list prioritas jika client bingung.

---

## Inertia.js Patterns

### Routing (Elysia)
```typescript
// api.ts
export const featureApi = new Elysia({ prefix: '/items' })
  .use(inertia())
  
  // List page
  .get('/', async (ctx) => {
    const items = await service.getAll()
    return ctx.inertia.render('items/Index', { items })
  })
  
  // Create form page
  .get('/create', (ctx) => {
    return ctx.inertia.render('items/Create', { errors: {} })
  })
  
  // Handle create
  .post('/', async (ctx) => {
    try {
      await service.create(ctx.body)
      return ctx.inertia.redirect('/items')
    } catch (error: any) {
      return ctx.inertia.render('items/Create', { 
        errors: { message: error.message } 
      })
    }
  }, { body: CreateSchema })
  
  // Handle update
  .put('/:id', async (ctx) => {
    try {
      await service.update(ctx.params.id, ctx.body)
      return ctx.inertia.redirect('/items')
    } catch (error: any) {
      const item = await service.findById(ctx.params.id)
      return ctx.inertia.render('items/Edit', { 
        item, 
        errors: { message: error.message } 
      })
    }
  }, { body: UpdateItemSchema })
  
  // Handle delete
  .delete('/:id', async (ctx) => {
    await service.delete(ctx.params.id)
    return ctx.inertia.redirect('/items')
  })
```

**Catatan:** Plugin Inertia sudah handle redirect status code (303) secara otomatis.

### Svelte Page dengan Form

```svelte
<!-- pages/Index.svelte -->
<script lang="ts">
  import { useForm, router } from '@inertiajs/svelte'
  import { Pencil, Trash } from 'lucide-svelte'
  import AppLayout from '$shared/layouts/AppLayout.svelte'
  
  interface Props {
    items: Array<{ id: string; title: string; completed: boolean }>
    user: { id: string; email: string; name: string }
  }
  
  let { items, user }: Props = $props()
  
  function deleteItem(id: string) {
    if (confirm('Delete this item?')) {
      router.delete(`/items/${id}`)
    }
  }
</script>

<AppLayout title="Items" {user}>
  <div class="p-6 max-w-5xl mx-auto">
    <h1 class="text-2xl font-bold">Items</h1>
    
    {#each items as item}
      <div class="flex items-center gap-4 p-4 border rounded-lg">
        <span class:flex-1={true} class:line-through={item.completed}>
          {item.title}
        </span>
        
        <a href="/items/{item.id}/edit" class="text-blue-600">
          <Pencil class="w-4 h-4" />
        </a>
        
        <button onclick={() => deleteItem(item.id)} class="text-red-600">
          <Trash class="w-4 h-4" />
        </button>
      </div>
    {/each}
  </div>
</AppLayout>
```

```svelte
<!-- pages/Edit.svelte -->
<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  import AppLayout from '$shared/layouts/AppLayout.svelte'
  
  interface Props {
    item: { id: string; title: string }
    errors: { message?: string }
    user: { id: string; email: string; name: string }
  }
  
  let { item, errors, user }: Props = $props()
  
  const form = useForm({
    title: item.title
  })
  
  function submit(e: Event) {
    e.preventDefault()
    $form.put(`/items/${item.id}`)
  }
</script>

<AppLayout title="Edit Item" {user}>
  <form onsubmit={submit} class="p-6 max-w-md mx-auto">
    <h1 class="text-2xl font-bold mb-4">Edit Item</h1>
    
    {#if errors.message}
      <div class="text-red-600 mb-4">{errors.message}</div>
    {/if}
    
    <input 
      bind:value={$form.title}
      class="w-full border rounded-lg px-3 py-2 mb-4"
    />
    
    <button 
      type="submit" 
      disabled={$form.processing}
      class="bg-blue-600 text-white px-4 py-2 rounded-lg"
    >
      {$form.processing ? 'Saving...' : 'Save'}
    </button>
  </form>
</AppLayout>
```

---

## Handoff (After Approval)

```
Client: "Approve" atau "Lanjutkan"

You:
@workflow/agents/qa.md

Development selesai dan di-approve client.
Siap untuk testing.
```

---

## Component Location

### Layouts (src/shared/layouts/)
- `AppLayout.svelte` - Main layout untuk protected pages
- `PublicLayout.svelte` - Layout untuk public pages (jika ada)

### Reusable Components (src/shared/components/)
**Hanya untuk complex reusable UI:**
- `Modal.svelte` - Dialog/Modal component
- `DataTable.svelte` - Table dengan sorting, pagination
- `ConfirmDialog.svelte` - Confirmation dialog

**DON'T create:** Button, Input, Card (use inline Tailwind instead)

---

## Layout Pattern (WAJIB)

**SEMUA protected pages WAJIB menggunakan `AppLayout`** untuk konsistensi UI.

```svelte
<script lang="ts">
  import AppLayout from '$shared/layouts/AppLayout.svelte'
  
  interface Props {
    user: { id: string; email: string; name: string }
    // ... other props
  }
  
  let { user, ...props }: Props = $props()
</script>

<AppLayout title="Page Title" {user}>
  <!-- Page content here -->
</AppLayout>
```

**AppLayout menyediakan:**
- Navigation bar dengan user menu
- Dark mode toggle
- Consistent padding & max-width
- Page title di browser tab

**Exception:** Auth pages (login, register) TIDAK pakai AppLayout karena tidak ada navigation.

---

## Patterns

- Repository pattern
- Service layer
- Elysia API dengan Inertia
- Svelte pages dengan runes
- UUID v7, ISO timestamps
