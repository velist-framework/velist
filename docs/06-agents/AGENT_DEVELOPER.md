# 🤖 Developer Agent (DevA) — Instruction Template

## Cara Memanggil

```
@DeveloperAgent

Implementasikan Task-XXX dari docs/03-implementation/TASKS.md

**Task:** [Nama Task]
**User Story:** US-XXX
```

## Output yang Diharapkan

Agent akan menghasilkan:

1. **Kode yang diimplementasikan** sesuai task
2. **docs/03-implementation/IMPLEMENTATION_LOG.md** — Log progress
3. **docs/03-implementation/CHANGELOG.md** — Update jika ada perubahan signifikan

## Checklist Before Coding

- [ ] Baca TECH_SPEC.md dan API_CONTRACT.md
- [ ] Pahami User Story dan Acceptance Criteria
- [ ] Cek dependencies (task yang harus selesai dulu)
- [ ] Review existing code pattern di project

## Checklist Implementation

### Kode Quality
- [ ] TypeScript strict mode compatible
- [ ] No `any` types
- [ ] Error handling lengkap (try-catch untuk async)
- [ ] Validasi input dengan TypeBox
- [ ] UUID v7 untuk semua ID baru
- [ ] ISO string untuk timestamp

### EISK Patterns
- [ ] Repository class untuk DB access
- [ ] Service class untuk business logic
- [ ] API routes menggunakan Elysia
- [ ] Svelte pages menggunakan runes ($props, $state)
- [ ] Inline Tailwind (no component abstraction untuk simple UI)
- [ ] Lucide icons untuk iconography

### Testing (Manual)
- [ ] Happy path tested
- [ ] Error cases tested
- [ ] Edge cases considered
- [ ] No console errors

### Documentation
- [ ] Inline comments untuk logic kompleks
- [ ] IMPLEMENTATION_LOG.md updated
- [ ] CHANGELOG.md updated (jika breaking change)

## Commit Message Format

```
type(scope): description

- type: feat|fix|refactor|docs|test|chore
- scope: feature name (auth, billing, etc)
- description: imperative mood ("add" not "added")

Body (optional but recommended):
- Detail perubahan
- Alasan perubahan
- Breaking changes (jika ada)

Footer:
Closes US-XXX
```

**Contoh:**
```
feat(billing): implement stripe subscription webhook

- Add webhook handler for checkout.session.completed
- Create subscription record on successful payment
- Update user plan tier in database

Closes US-042
```

## Instruksi untuk Tipe Task Berbeda

### 1. New Feature
```
@DeveloperAgent

Implement fitur baru: [Nama Fitur]

**Referensi:**
- Task: docs/03-implementation/TASKS.md Task-005
- Tech Spec: docs/02-engineering/TECH_SPEC.md
- API Contract: docs/02-engineering/API_CONTRACT.md

**Yang perlu dibuat:**
1. Database migration (jika ada schema baru)
2. Repository class
3. Service class dengan validation schema
4. API routes (Elysia)
5. Svelte pages (sesuai spec)

**Acceptance Criteria:**
- [AC 1]
- [AC 2]
```

### 2. Bug Fix
```
@DeveloperAgent

Fix bug: [Deskripsi bug]

**Bug:** [Detail bug]
**Expected:** [Seharusnya apa]
**Actual:** [Saat ini apa]
**Steps to Reproduce:**
1. Step 1
2. Step 2

**Files terkait:** [file paths]

**Catatan:** Cari root cause, jangan hanya treat symptom.
```

### 3. Refactoring
```
@DeveloperAgent

Refactor: [Area yang mau di-refactor]

**Alasan:** [Kenapa perlu refactor]
**Scope:** [Apa saja yang diubah]
**Risiko:** [Apa yang bisa break]

**Deliverable:**
- Kode yang lebih clean
- No functional changes
- All existing tests passing
```

## EISK-Specific Implementation Guide

### Database (Kysely)
```typescript
// repository.ts
import { db } from '../_core/database/connection'
import { uuidv7 } from '../../shared/lib/uuid'

export class InvoiceRepository {
  async findAll() {
    return db.selectFrom('invoices').selectAll().execute()
  }
  
  async findById(id: string) {
    return db.selectFrom('invoices')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst()
  }
  
  async create(data: CreateData) {
    const id = uuidv7()
    const now = new Date().toISOString()
    return db.insertInto('invoices')
      .values({ id, ...data, created_at: now, updated_at: now })
      .returningAll()
      .executeTakeFirst()
  }
  
  async update(id: string, data: UpdateData) {
    return db.updateTable('invoices')
      .set({ ...data, updated_at: new Date().toISOString() })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()
  }
  
  async delete(id: string) {
    return db.deleteFrom('invoices').where('id', '=', id).execute()
  }
}
```

### Service + Validation
```typescript
// service.ts
import { t, type Static } from 'elysia'
import { InvoiceRepository } from './repository'

export const CreateInvoiceSchema = t.Object({
  customer: t.String({ minLength: 1, maxLength: 255 }),
  amount: t.Number({ minimum: 0 }),
  status: t.Union([
    t.Literal('pending'),
    t.Literal('paid'),
    t.Literal('cancelled')
  ])
}, { additionalProperties: false })

export type CreateInvoicePayload = Static<typeof CreateInvoiceSchema>

export class InvoiceService {
  constructor(private repo = new InvoiceRepository()) {}
  
  async getAll() {
    return this.repo.findAll()
  }
  
  async create(payload: CreateInvoicePayload) {
    // Business logic di sini
    return this.repo.create(payload)
  }
}
```

### API Routes
```typescript
// api.ts
import { Elysia } from 'elysia'
import { authApi } from '../_core/auth/api'
import { InvoiceService, CreateInvoiceSchema } from './service'
import { inertia, type Inertia } from '../../inertia/plugin'

export const invoiceApi = new Elysia({ prefix: '/invoices' })
  .use(authApi)
  .auth(true)
  .use(inertia())
  .derive(() => ({ invoiceService: new InvoiceService() }))
  
  // List
  .get('/', async (ctx) => {
    const { inertia, invoiceService } = ctx as typeof ctx & { inertia: Inertia }
    const invoices = await invoiceService.getAll()
    return inertia.render('invoices/Index', { invoices })
  })
  
  // Create form
  .get('/create', (ctx) => {
    const { inertia } = ctx as typeof ctx & { inertia: Inertia }
    return inertia.render('invoices/Create', { errors: {} })
  })
  
  // Store
  .post('/', async (ctx) => {
    const { body, invoiceService, inertia } = ctx as typeof ctx & { inertia: Inertia }
    try {
      await invoiceService.create(body)
      return inertia.redirect('/invoices')
    } catch (error: any) {
      return inertia.render('invoices/Create', { 
        errors: { message: error.message } 
      })
    }
  }, { body: CreateInvoiceSchema })
```

### Svelte Page
```svelte
<!-- pages/Index.svelte -->
<script lang="ts">
  import { useForm } from '@inertiajs/svelte'
  import { Plus, Pencil, Trash } from 'lucide-svelte'
  
  interface Props {
    invoices: Array<{
      id: string
      customer: string
      amount: number
      status: string
    }>
  }
  
  let { invoices }: Props = $props()
  
  const deleteForm = useForm({})
  
  function deleteInvoice(id: string) {
    if (confirm('Delete this invoice?')) {
      $deleteForm.delete(`/invoices/${id}`)
    }
  }
</script>

<div class="p-6 max-w-5xl mx-auto">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Invoices</h1>
    <a href="/invoices/create" class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
      <Plus class="w-4 h-4" />
      New Invoice
    </a>
  </div>
  <!-- ... -->
</div>
```

## Contoh Instruksi Lengkap

```
@DeveloperAgent

Implement Task-007: Create Invoice CRUD

**Referensi:**
- Task: docs/03-implementation/TASKS.md
- Tech Spec: docs/02-engineering/TECH_SPEC.md Section 3.2
- API Contract: docs/02-engineering/API_CONTRACT.md #invoices

**Yang perlu dibuat:**

1. Database migration (jika belum ada):
   - Tabel: invoices
   - Kolom: id, customer, amount, status, created_at, updated_at

2. Repository (src/features/invoices/repository.ts):
   - findAll, findById, create, update, delete

3. Service (src/features/invoices/service.ts):
   - CreateInvoiceSchema, UpdateInvoiceSchema
   - InvoiceService class

4. API (src/features/invoices/api.ts):
   - GET /invoices (list)
   - GET /invoices/create (form)
   - POST /invoices (store)
   - GET /invoices/:id/edit (edit form)
   - PUT /invoices/:id (update)
   - DELETE /invoices/:id (delete)

5. Pages (src/features/invoices/pages/):
   - Index.svelte (list dengan table)
   - Create.svelte (form create)
   - Edit.svelte (form edit)

6. Update bootstrap.ts untuk mount invoiceApi

**Acceptance Criteria:**
- User bisa melihat list invoice
- User bisa create invoice baru
- User bisa edit existing invoice
- User bisa delete invoice
- Validasi input working
- Error handling proper
```
