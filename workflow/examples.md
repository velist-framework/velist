# Example Usage Scenarios

Dokumen ini berisi contoh nyata bagaimana menggunakan workflow multi-agent dalam berbagai situasi.

---

## Scenario 1: New Feature Development

### Konteks
Kamu ingin menambahkan fitur "Categories" untuk mengelompokkan invoices.

### Workflow

#### Step 1: Product Agent
```
@ProductAgent

Saya ingin menambahkan fitur "Categories" untuk invoices.

Context:
- User punya banyak invoices dan ingin mengelompokkan them
- Contoh: "Marketing", "Operations", "Software"

Requirements:
1. CRUD categories (Create, Read, Update, Delete)
2. Assign category ke invoice
3. Filter invoices by category
4. Default category "Uncategorized"

Deliverable:
- PRD lengkap
- User Stories dengan AC
- ROADMAP (3 sprints)
```

**Output:** `docs/01-product/PRD.md`, `USER_STORIES.md`, `ROADMAP.md`

---

#### Step 2: Tech Lead Agent
```
@TechLeadAgent

Baca PRD di docs/01-product/PRD.md (fitur Categories).

Buat technical specification lengkap:

1. Database schema (tabel categories, tambah category_id ke invoices)
2. API endpoints untuk CRUD categories
3. Update invoice API untuk support category
4. UI pages: Category list, Create, Edit
5. Update Invoice pages untuk dropdown category

Perhatikan:
- Soft delete untuk categories (jangan hapus data)
- Validasi: category name unique per user
- Default category auto-create untuk user baru
```

**Output:** `TECH_SPEC.md`, `ARCHITECTURE.md`, `API_CONTRACT.md`, `DATABASE_SCHEMA.md`, `TASKS.md`

---

#### Step 3: Developer Agent - Task 1
```
@DeveloperAgent

Implement Task-001: Setup database dan repository untuk Categories.

Referensi:
- Task: docs/03-implementation/TASKS.md Task-001
- Tech Spec: Section 2.1 Database Schema

Yang perlu dibuat:
1. Migration SQL untuk tabel categories
2. Update DatabaseSchema interface di connection.ts
3. CategoryRepository dengan methods:
   - findAllByUser(userId)
   - findById(id)
   - create(data)
   - update(id, data)
   - softDelete(id)

Notes:
- Gunakan uuidv7 untuk ID
- Soft delete pakai deleted_at timestamp
```

**Output:** Kode repository + migration

---

#### Step 4: Developer Agent - Task 2
```
@DeveloperAgent

Implement Task-002: Category API endpoints.

Dependencies: Task-001 (selesai)

Yang perlu dibuat:
1. CategoryService dengan validation schemas
2. Category API routes (Elysia)
3. Mount di bootstrap.ts

Endpoints:
- GET /categories (list)
- POST /categories (create)
- PUT /categories/:id (update)
- DELETE /categories/:id (soft delete)

Validation:
- name: required, min 1, max 100 chars
- color: optional hex color
```

**Output:** `src/features/categories/service.ts`, `api.ts`

---

#### Step 5: Developer Agent - Task 3
```
@DeveloperAgent

Implement Task-003: Category UI pages.

Yang perlu dibuat:
1. src/features/categories/pages/Index.svelte (list)
2. src/features/categories/pages/Create.svelte
3. src/features/categories/pages/Edit.svelte

Design:
- List: grid of category cards dengan color indicator
- Create/Edit: form dengan name dan color picker
- Delete: confirmation modal

Integration:
- Update invoices/Index.svelte untuk filter by category
- Update invoices/Create.svelte untuk dropdown category
```

**Output:** Svelte pages

---

#### Step 6: QA Agent
```
@QAAgent

Review implementasi fitur Categories.

Scope:
- Task-001, Task-002, Task-003
- All files di src/features/categories/
- Updates di invoices pages

Acceptance Criteria:
1. User bisa create category baru
2. User bisa edit category
3. User bisa delete category (soft delete)
4. Category muncul di invoice form
5. Invoices bisa difilter by category

Test:
- Code review
- Functional testing
- Edge cases (duplicate name, empty name)
```

**Output:** `TEST_REPORT.md` dengan status APPROVED/CHANGES_REQUESTED

---

#### Step 7: DevOps Agent (Jika deployment)
```
@DevOpsAgent

Deploy fitur Categories ke production.

Changes:
- Database migration baru
- API endpoints baru
- UI pages baru

Check:
1. Jalankan migration
2. Smoke test
3. Monitor errors

Rollback plan ready? Yes/No
```

---

## Scenario 2: Bug Fix

### Konteks
User report: "Invoice amount tidak tersimpan ketika create invoice"

### Workflow

```
@DeveloperAgent

Fix bug: Invoice amount tidak tersimpan.

Bug Report:
- User create invoice dengan amount $100
- Setelah save, amount muncul $0
- Other fields (customer, status) tersimpan normal

Steps to Reproduce:
1. Go to /invoices/create
2. Fill customer: "Test"
3. Fill amount: 100
4. Submit
5. Check list: amount shows $0

Expected: Amount tersimpan sesuai input
Actual: Amount selalu 0

Files terkait:
- src/features/invoices/api.ts
- src/features/invoices/service.ts
- src/features/invoices/repository.ts
- src/features/invoices/pages/Create.svelte

Task:
1. Identify root cause
2. Fix the bug
3. Test fix
4. Update CHANGELOG.md
```

Setelah implementasi:

```
@QAAgent

Verify fix untuk bug invoice amount.

Fix: [deskripsi fix dari DevA]

Test:
1. Reproduce original bug
2. Verify fix works
3. Test edge cases (0, negative, very large numbers)
4. Regression test (other fields masih work)
```

---

## Scenario 3: Refactoring

### Konteks
Duplicated validation logic di banyak service files.

### Workflow

#### Step 1: Tech Lead Agent
```
@TechLeadAgent

Refactor plan: Extract common validation logic.

Problem:
- UUID validation duplicated di 5 files
- Email validation duplicated di 3 files
- Pagination params validation duplicated

Target:
- Create shared validation utilities
- Update all services untuk menggunakan utilities
- No functional changes

Deliverable:
1. Refactor plan
2. Updated TASKS.md
3. Risk assessment
```

#### Step 2: Developer Agent
```
@DeveloperAgent

Refactor: Extract validation utilities.

Plan:
1. Create src/shared/lib/validation.ts
2. Extract common validators:
   - uuidValidator
   - emailValidator
   - paginationSchema
3. Update services untuk menggunakan shared validators
4. Run tests untuk ensure no regression

Files to modify:
- New: src/shared/lib/validation.ts
- Update: src/features/*/service.ts

Constraints:
- No functional changes
- All existing tests harus pass
```

#### Step 3: QA Agent
```
@QAAgent

Review refactoring: Validation utilities.

Focus:
- Code quality improvement
- No functional changes
- All AC tetap working

Test:
- Regression testing untuk semua fitur
- Code review
- Verify no logic changes
```

---

## Scenario 4: Change Request (Requirement Change)

### Konteks
Setelah fitur Categories selesai, user minta: "Categories harus punya icon juga"

### Workflow

#### Step 1: Product Agent (Change Assessment)
```
@ProductAgent

Change Request untuk fitur Categories.

Current: Categories punya name dan color
Requested: Tambah icon untuk setiap category
Reason: Visual recognition lebih cepat daripada baca text

Deliverable:
- Update PRD dengan icon requirement
- Update affected User Stories
- Update ROADMAP
```

#### Step 2: Tech Lead Agent (Impact Analysis)
```
@TechLeadAgent

Analisis impact dari change request: Add icon ke categories.

Current State: Categories sudah di production
Changes needed:
1. Database: tambah icon column
2. API: update schemas dan validation
3. UI: icon picker di form, display icon di list
4. Migration: existing data default icon

Deliverable:
- Updated TECH_SPEC.md
- Updated TASKS.md (migration + UI update)
- Migration plan untuk existing data
```

#### Step 3: Developer Agent
```
@DeveloperAgent

Implement change: Add icon ke categories.

Tasks:
1. Migration: alter table categories add icon column
2. Update CategoryRepository
3. Update CategoryService schemas
4. Update Category API
5. Update UI: icon picker (gunakan lucide icons)
6. Update existing pages untuk display icon

Data migration:
- Existing categories: default icon "Folder"
- User bisa edit untuk ganti icon
```

---

## Scenario 5: New Project Setup

### Konteks
Starting fresh dengan EISK stack.

### Workflow

```
@ProductAgent

Define MVP untuk Invoice Management System.

Core features:
1. User authentication (register, login, logout)
2. Invoice CRUD
3. Dashboard dengan summary
4. Export invoices to CSV

Deliverable:
- PRD untuk MVP
- User Stories
- ROADMAP (4 weeks)
```

```
@TechLeadAgent

Setup EISK project structure untuk Invoice Management System.

Stack: Elysia + Inertia + Svelte + Kysely + SQLite

Deliverable:
1. Project folder structure
2. Database schema (users, invoices)
3. API design
4. UI mockup/wireframe description
5. TASKS.md untuk Week 1
```

```
@DeveloperAgent

Implement Week 1 tasks: Authentication system.

Referensi: TASKS.md Week 1

Features:
1. User registration
2. User login
3. Protected routes
4. Logout

Deliverable:
- Complete auth feature
- Working login/register pages
- JWT authentication
```

---

## Quick Decision Tree

```
Need new feature?
- Yes -> @ProductAgent -> @TechLeadAgent -> @DeveloperAgent -> @QAAgent -> @DevOpsAgent (optional)

Bug report?
- Yes -> @DeveloperAgent (fix) -> @QAAgent (verify)

Code cleanup?
- Yes -> @TechLeadAgent (plan) -> @DeveloperAgent -> @QAAgent

Deploy to production?
- Yes -> @DevOpsAgent

Requirement change?
- Yes -> @ProductAgent (assess) -> @TechLeadAgent (impact) -> @DeveloperAgent -> @QAAgent
```

---

## Tips Penggunaan

### 1. Context Passing
Selalu refer ke dokumen yang sudah ada:
```
@DeveloperAgent

Implement seperti dijelaskan di docs/02-engineering/TECH_SPEC.md Section 3.
```

### 2. Iterative Development
Jika task besar, pecah menjadi beberapa iterasi:
```
@DeveloperAgent Iteration 1: Setup database
@DeveloperAgent Iteration 2: API endpoints
@DeveloperAgent Iteration 3: UI pages
```

### 3. Feedback Loop
Jika QA menemukan issue, loop balik ke Developer:
```
@DeveloperAgent

Fix issues dari QA review:
- Issue #1: [deskripsi]
- Issue #2: [deskripsi]

Referensi: docs/04-testing/TEST_REPORT.md
```

### 4. Documentation Updates
Setelah setiap perubahan signifikan:
```
Update docs/03-implementation/CHANGELOG.md
Update docs/01-product/ROADMAP.md (jika milestone tercapai)
```
