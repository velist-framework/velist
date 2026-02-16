# 🤖 Tech Lead Agent (TLA) — Instruction Template

## Cara Memanggil

```
@TechLeadAgent

Baca PRD di docs/01-product/PRD.md dan buat Technical Specification.

Fitur yang akan dibuat: [nama fitur]
```

## Output yang Diharapkan

Agent akan menghasilkan:

1. **docs/02-engineering/TECH_SPEC.md** — Spesifikasi teknis
2. **docs/02-engineering/ARCHITECTURE.md** — Arsitektur sistem
3. **docs/02-engineering/API_CONTRACT.md** — API specification
4. **docs/02-engineering/DATABASE_SCHEMA.md** — Schema changes
5. **docs/03-implementation/TASKS.md** — Development tasks

## Checklist Output

### TECH_SPEC.md
- [ ] Technology Stack (pilih yang sudah ada di project)
- [ ] Architecture Overview (diagram/logical flow)
- [ ] Data Flow Diagram
- [ ] Security Considerations
- [ ] Error Handling Strategy
- [ ] Performance Considerations

### ARCHITECTURE.md
- [ ] Folder Structure (sesuai vertical slicing)
- [ ] Component Diagram
- [ ] Integration Points

### API_CONTRACT.md
```
## [METHOD] /path/to/endpoint

**Description:** [Deskripsi]

**Auth Required:** Yes/No

**Request:**
```json
{
  "field": "type"
}
```

**Response 200:**
```json
{
  "data": {}
}
```

**Response Error:**
```json
{
  "error": "message"
}
```
```

### DATABASE_SCHEMA.md
- [ ] New Tables (dengan kolom lengkap)
- [ ] Modified Tables
- [ ] Indexes
- [ ] Foreign Key Relationships
- [ ] Migration SQL (opsional)

### TASKS.md
```markdown
## Task List: [Feature Name]

### Task-001: [Nama Task]
- **Type:** Feature/Bug/Refactor
- **Assignee:** DevA
- **Estimasi:** X jam
- **Dependencies:** [Task yang harus selesai dulu]
- **User Story:** US-XXX
- **Description:** [Detail pekerjaan]
- **Files:**
  - `src/features/[name]/api.ts`
  - `src/features/[name]/service.ts`
- **Acceptance Criteria:**
  1. [AC 1]
  2. [AC 2]
```

## EISK-Specific Guidelines

### Folder Structure Pattern
```
src/features/[feature-name]/
├── api.ts              # Elysia routes
├── service.ts          # Business logic
├── repository.ts       # Database access (Kysely)
├── types.ts            # TypeScript types
├── schemas.ts          # TypeBox schemas
└── pages/              # Svelte pages (Inertia)
    ├── Index.svelte
    ├── Create.svelte
    └── Edit.svelte
```

### Code Patterns

**Repository Pattern:**
```typescript
// repository.ts
import { db } from '../_core/database/connection'
import { uuidv7 } from '../../shared/lib/uuid'

export class FeatureRepository {
  async findAll() {
    return db.selectFrom('table').selectAll().execute()
  }
  // ...
}
```

**Service Pattern:**
```typescript
// service.ts
import { t, type Static } from 'elysia'

export const CreateSchema = t.Object({
  // fields
}, { additionalProperties: false })

export type CreatePayload = Static<typeof CreateSchema>

export class FeatureService {
  constructor(private repo = new FeatureRepository()) {}
  // ...
}
```

**API Pattern:**
```typescript
// api.ts
import { Elysia } from 'elysia'
import { authApi } from '../_core/auth/api'
import { inertia } from '../../inertia/plugin'

export const featureApi = new Elysia({ prefix: '/features' })
  .use(authApi)
  .auth(true)
  .use(inertia())
  .derive(() => ({ service: new FeatureService() }))
  // ... routes
```

## Contoh Instruksi Lengkap

```
@TechLeadAgent

Baca PRD di docs/01-product/PRD.md (fitur Team/Workspace).

Buat technical specification lengkap dengan:

1. Database schema changes (tabel teams, team_members, invitations)
2. API endpoints untuk:
   - CRUD workspace
   - Invite member
   - Accept/reject invitation
   - Switch active workspace
3. UI pages yang dibutuhkan
4. Authorization strategy (middleware untuk cek workspace access)
5. Task breakdown per feature

Perhatikan:
- Gunakan existing auth system (JWT)
- Workspace context perlu disimpan di session/localStorage
- Multi-tenancy: semua query perlu filter by workspace_id
```
