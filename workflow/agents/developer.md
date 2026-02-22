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

> 📚 **Reference Documents:** Developer Agent membaca output dari Tech Lead Agent:
> - `workflow/outputs/02-engineering/ARCHITECTURE.md` — Struktur folder & patterns
> - `workflow/outputs/02-engineering/DATABASE_SCHEMA.md` — Schema changes
> - `workflow/outputs/02-engineering/TASKS.md` — Checklist implementasi
> - `workflow/outputs/01-product/PRD.md` — Context fitur & requirements

1. **Baca semua reference documents** (di atas)
2. **Implement** sesuai TASKS.md (pilih mode)
3. **Update progress**
4. **Present hasil ke client**
5. **TUNGGU CLIENT REVIEW & APPROVE**
6. **Handoff ke QA Agent** (setelah approve)

---

## Git Commit Authority

**Developer Agent BOLEH melakukan commit lokal setiap kali satu fitur selesai.**

### Kapan Commit

- Setelah satu fitur/modul selesai di-implementasi
- Sebelum handoff ke QA Agent (setelah client approve)

### Format Commit Message

```
feat([nama-fitur]): deskripsi singkat perubahan

Contoh:
- feat(invoices): add CRUD operations for invoices
- feat(auth): implement login with JWT
- fix(users): resolve email validation bug
```

### Langkah Commit (Lokal Saja)

```bash
# 1. Check status
git status

# 2. Add files
git add src/features/[fitur]/

# 3. Commit dengan pesan yang jelas
git commit -m "feat([nama-fitur]): deskripsi fitur"
```

### Catatan Penting

- **COMMIT LOKAL ONLY** - Developer TIDAK BOLEH push ke remote
- **Testing dilakukan oleh QA Agent** - Bukan tugas Developer
- **Satu fitur = Satu commit** (atau bisa beberapa commit jika fitur kompleks)
- Push ke remote akan dilakukan setelah QA testing selesai dan di-approve

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

## Inertia.js Patterns (Sama dengan AGENTS.md)

### Routing (Elysia)

**⚠️ PENTING:** Gunakan pattern yang sama persis dengan AGENTS.md untuk type safety.

```typescript
// api.ts
import { createProtectedApi } from '../_core/auth/protected'
import { ItemService, CreateItemSchema, UpdateItemSchema } from './service'
import { inertia, type Inertia } from '../../inertia/plugin'

export const itemApi = createProtectedApi('/items')
  .derive(() => ({ itemService: new ItemService() }))
  
  // List page
  .get('/', async (ctx) => {
    const { inertia, itemService } = ctx as typeof ctx & { inertia: Inertia }
    const items = await itemService.getAll()
    return inertia.render('items/Index', { items })
  })
  
  // Create form page
  .get('/create', (ctx) => {
    const { inertia } = ctx as typeof ctx & { inertia: Inertia }
    return inertia.render('items/Create', { errors: {} })
  })
  
  // Handle create
  .post('/', async (ctx) => {
    const { body, itemService, inertia } = ctx as typeof ctx & { inertia: Inertia }
    try {
      await itemService.create(body)
      return inertia.redirect('/items')
    } catch (error: any) {
      return inertia.render('items/Create', { 
        errors: { message: error.message } 
      })
    }
  }, { body: CreateItemSchema })
  
  // Show edit form
  .get('/:id/edit', async (ctx) => {
    const { params, itemService, inertia } = ctx as typeof ctx & { inertia: Inertia }
    const item = await itemService.getById(params.id)
    if (!item) {
      return inertia.render('errors/404', { path: ctx.request.url })
    }
    return inertia.render('items/Edit', { item, errors: {} })
  })
  
  // Handle update
  .put('/:id', async (ctx) => {
    const { params, body, itemService, inertia } = ctx as typeof ctx & { inertia: Inertia }
    try {
      await itemService.update(params.id, body)
      return inertia.redirect('/items')
    } catch (error: any) {
      const item = await itemService.getById(params.id)
      return inertia.render('items/Edit', { 
        item, 
        errors: { message: error.message } 
      })
    }
  }, { body: UpdateItemSchema })
  
  // Handle delete
  .delete('/:id', async (ctx) => {
    const { params, itemService, inertia } = ctx as typeof ctx & { inertia: Inertia }
    await itemService.delete(params.id)
    return inertia.redirect('/items')
  })
```

**Key Points:**
1. Gunakan `createProtectedApi()` untuk protected routes
2. Gunakan `.derive()` untuk inject service
3. **WAJIB** destructuring dengan type assertion: `const { inertia, itemService } = ctx as typeof ctx & { inertia: Inertia }`
4. Jangan lupa import `type Inertia` dari plugin
5. Plugin Inertia sudah handle redirect status code (303) secara otomatis

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

## Shared Resources

### Layouts: `src/shared/layouts/`
- `AppLayout.svelte` - Main layout untuk protected pages (WAJIB)
- `PublicLayout.svelte` - Layout untuk public pages

### Components: `src/shared/components/`
**Hanya untuk complex reusable UI:**
- `Modal.svelte`, `DataTable.svelte`, `ConfirmDialog.svelte`
- `ToastContainer.svelte` (sudah ada di AppLayout)

**DON'T create:** Button, Input, Card (use inline Tailwind)

### Utilities: `src/shared/lib/`
| Utility | Import | Usage |
|---------|--------|-------|
| Debounce | `$shared/lib/debounce` | `debounce(fn, 300)` |
| CSV Export | `$shared/lib/csv` | `downloadCSV('file', data)` |
| Toast | `$shared/lib/toast` | `toast.success('msg')` |

#### Toast Example (Sangat Mudah!)
```typescript
import { toast } from '$shared/lib/toast'

// Dari mana saja, setelah fetch, di event handler, dll
function handleSave() {
  try {
    await saveData()
    toast.success('Data saved!')
  } catch (err) {
    toast.error(err.message)
  }
}
```
ToastContainer sudah otomatis di AppLayout, tinggal panggil saja.

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

## Authentication Pattern (WAJIB)

### Protected Routes - Gunakan Helper

**WAJIB gunakan `createProtectedApi()`** - Jangan copy-paste auth boilerplate:

```typescript
// api.ts
import { createProtectedApi } from '../_core/auth/protected'

export const featureApi = createProtectedApi('/feature')
  .derive(() => ({ service: new FeatureService() }))
  .get('/', (ctx) => {
    const user = (ctx as any).user  // Sudah ter-attach otomatis
    return ctx.inertia.render('feature/Index', { user })
  })
```

### Mengakses User di Route

```typescript
.get('/', (ctx) => {
  const user = (ctx as any).user  // { sub, email, name, role }
  return ctx.inertia.render('page/Index', { user })
})
```

### Role-Based Access (Admin Only)

```typescript
// Admin only route
.get('/admin', (ctx) => {
  const user = (ctx as any).user
  if (user.role !== 'admin') {
    return ctx.inertia.render('errors/403')
  }
  return ctx.inertia.render('admin/Index')
})
```

### Manual Pattern (Hanya Jika Perlu Custom)

```typescript
// Gunakan ini hanya jika butuh logic auth khusus
import { Elysia } from 'elysia'
import { cookie } from '@elysiajs/cookie'
import { jwt } from '@elysiajs/jwt'
import { inertia } from '../../inertia/plugin'

export const customApi = new Elysia({ prefix: '/custom' })
  .use(cookie())
  .use(jwt({...}))
  .use(inertia())
  .onBeforeHandle(async (ctx) => {
    // Custom auth logic
  })
```

### Kesalahan Umum (JANGAN LAKUKAN)

```typescript
// ❌ SALAH - Akan error:
// TypeError: .auth is not a function
export const wrongApi = new Elysia({ prefix: '/wrong' })
  .use(authApi)
  .auth(true)  // ❌ Error! auth() macro tidak ada di sini
```

---

## Reference Documents (WAJIB Baca)

Sebelum mulai coding, Developer Agent WAJIB membaca:

### 1. PRD.md (Product Context)
**Lokasi:** `workflow/outputs/01-product/PRD.md`

**Isi yang perlu diperhatikan:**
- Vision & success metrics
- Target users
- **Features by Priority (P0/P1/P2)** ← Mulai dari P0
- Design direction (color, style)

### 2. ARCHITECTURE.md (Structure)
**Lokasi:** `workflow/outputs/02-engineering/ARCHITECTURE.md`

**Isi yang perlu diperhatikan:**
- Folder structure
- Patterns yang digunakan
- Shared components yang perlu dibuat

### 3. DATABASE_SCHEMA.md (Schema)
**Lokasi:** `workflow/outputs/02-engineering/DATABASE_SCHEMA.md`

**Isi yang perlu diperhatikan:**
- Modified tables (kolom baru)
- New tables (struktur lengkap)
- Migration notes

**Actions:**
```bash
# Setelah update schema.ts:
bun run db:generate   # Generate migration
bun run db:migrate    # Apply migration
```

### 4. TASKS.md (Checklist)
**Lokasi:** `workflow/outputs/02-engineering/TASKS.md`

**Isi yang perlu diperhatikan:**
- Route table (URL → Page)
- Checklist implementasi per phase
- Dependencies antar task

---

## Patterns

- Repository pattern
- Service layer
- Elysia API dengan Inertia
- Svelte pages dengan runes
- UUID v7, ISO timestamps

---

## Testing (QA Agent Responsibility)

**Testing BUKAN tugas Developer Agent.**

Semua testing (unit test, integration test, E2E test) dilakukan oleh **@workflow/agents/qa.md** setelah implementasi selesai dan di-approve client.

### Handoff ke QA

Setelah client approve implementasi:

```
@workflow/agents/qa.md

Development selesai dan di-approve client.
Fitur: [nama fitur]
Branch: [nama branch]
Siap untuk testing.
```
