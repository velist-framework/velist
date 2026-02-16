# Example Usage Scenarios

Real-world examples menggunakan multi-agent workflow.

---

## Scenario 1: Full Application Development (New Project)

### Konteks
Membangun **SaaS Inventory Management System** dari nol dengan EISK stack.

### Fase 1: Discovery & Planning

#### Step 1: Product Agent - Define Product
```
@ProductAgent

Buat PRD lengkap untuk SaaS Inventory Management System.

**Visi:**
Aplikasi inventory untuk UMKM yang bisa multi-warehouse, 
track stock real-time, dan generate laporan penjualan.

**Core Modules:**
1. Authentication & Authorization (multi-tenant)
2. Warehouse Management (CRUD gudang)
3. Product Management (SKU, kategori, variant)
4. Stock Management (in, out, transfer antar gudang)
5. Supplier Management
6. Purchase Orders
7. Sales Orders
8. Reporting & Analytics (dashboard, export)
9. User Management & RBAC (Admin, Manager, Staff)

**Deliverable:**
- PRD.md lengkap dengan user personas
- USER_STORIES.md (semua modul)
- ROADMAP.md (MVP 8 minggu, Full 16 minggu)
- Prioritisasi MoSCoW per modul
```

**Output:** `outputs/01-product/PRD.md`, `USER_STORIES.md`, `ROADMAP.md`

---

#### Step 2: Tech Lead Agent - System Design
```
@TechLeadAgent

Baca PRD di outputs/01-product/ dan desain sistem Inventory Management.

**Scope:** Full system architecture untuk 16-week roadmap

**Deliverable:**
1. TECH_SPEC.md:
   - Technology stack (EISK + tambahan jika perlu)
   - Architecture patterns (multi-tenancy strategy)
   - Security considerations
   - Scalability plan

2. ARCHITECTURE.md:
   - High-level system diagram
   - Service boundaries
   - Data flow diagrams
   - Deployment architecture

3. DATABASE_SCHEMA.md:
   - ERD lengkap (semua tabel)
   - Indexes & constraints
   - Multi-tenancy approach (tenant_id di setiap tabel)

4. API_CONTRACT.md:
   - REST API design untuk semua modules
   - Authentication flow
   - Rate limiting strategy

5. PROJECT_STRUCTURE.md:
   - Folder structure
   - Naming conventions
   - Feature-based organization

6. TASKS.md breakdown:
   - Sprint 1-4 (MVP): Auth, Warehouse, Product, Stock
   - Sprint 5-8: Supplier, PO, SO, Reporting
```

**Output:** Semua spec di `outputs/02-engineering/`

---

#### Step 3: DevOps Agent - Project Setup
```
@DevOpsAgent

Setup project foundation untuk Inventory SaaS.

**Referensi:** outputs/02-engineering/PROJECT_STRUCTURE.md

**Deliverable:**
1. Project scaffolding:
   - EISK stack initialization
   - Folder structure sesuai spec
   - Base configuration (TypeScript, Tailwind)

2. Database setup:
   - Migration system
   - Seeding strategy
   - Multi-tenancy middleware skeleton

3. CI/CD pipeline:
   - GitHub Actions workflow
   - Automated testing
   - Staging deployment

4. Development environment:
   - docker-compose.yml (dev)
   - Environment templates
   - README untuk onboarding dev

5. DEPLOYMENT_GUIDE.md (staging setup)
```

**Output:** Base project structure + dev environment

---

### Fase 2: MVP Development (Sprint 1-4)

#### Sprint 1: Authentication & Multi-tenancy
```
@DeveloperAgent

Implement Sprint 1: Auth & Multi-tenancy System.

**Referensi:**
- outputs/03-tasks/TASKS.md Sprint 1
- outputs/02-engineering/TECH_SPEC.md (auth section)

**Modules:**
1. User registration dengan tenant creation
2. Login/logout dengan JWT
3. Tenant context middleware
4. Role-based access control (Admin, Manager, Staff)
5. Invitation system (invite user ke tenant)

**Acceptance Criteria:**
- User bisa register dan otomatis create tenant
- Setiap API request punya tenant context
- Role restrictions working
- User bisa invite member ke tenant
```

```
@QAAgent

Review Sprint 1: Auth & Multi-tenancy.

**Scope:** All auth modules

**Security Testing:**
- JWT token security
- Tenant isolation (user A tidak bisa lihat data tenant B)
- Role access restrictions
- SQL injection prevention

**Deliverable:** outputs/04-reports/TEST_REPORT_SPRINT1.md
```

---

#### Sprint 2: Warehouse & Product Management
```
@DeveloperAgent

Implement Sprint 2: Warehouse & Product Management.

**Features:**
1. Warehouse CRUD (multi-warehouse per tenant)
2. Product Master Data (SKU, nama, kategori, unit)
3. Product Variant (size, color, etc)
4. Barcode generation
5. Product categorization

**Database:**
- warehouses table (with tenant_id)
- products table
- product_variants table
- categories table

**UI:**
- Warehouse list, create, edit pages
- Product catalog dengan variant management
- Category tree view
```

---

#### Sprint 3: Stock Management
```
@DeveloperAgent

Implement Sprint 3: Stock Operations.

**Features:**
1. Stock In (receipt from supplier)
2. Stock Out (fulfill sales order)
3. Stock Transfer (antar warehouse)
4. Stock Adjustment (correction, damage)
5. Stock History & Audit Trail

**Complex Logic:**
- FIFO tracking
- Stock reservation (saat SO dibuat)
- Low stock alerts
- Real-time stock calculation
```

---

#### Sprint 4: Dashboard & Reporting Foundation
```
@DeveloperAgent

Implement Sprint 4: Dashboard MVP.

**Features:**
1. Dashboard utama:
   - Total SKUs
   - Total stock value
   - Low stock alerts
   - Recent transactions

2. Basic Reports:
   - Stock levels per warehouse
   - Product movement history
   - Export to CSV
```

---

### Fase 3: Full Feature Development (Sprint 5-8)

#### Sprint 5-6: Supplier & Purchase Orders
```
@DeveloperAgent

Implement Supplier Management & Purchase Order System.

**Supplier Module:**
- Supplier master data
- Supplier performance tracking
- Contact & address management

**Purchase Order:**
- Create PO dari supplier
- PO approval workflow
- Partial receipt handling
- PO status tracking (draft, sent, partial, received)
- Auto-update stock saat receipt
```

---

#### Sprint 7: Sales Orders
```
@DeveloperAgent

Implement Sales Order System.

**Features:**
- Create SO dengan customer info
- Stock reservation saat SO created
- Fulfillment workflow (pick, pack, ship)
- Partial fulfillment support
- SO status tracking
- Invoice generation
```

---

#### Sprint 8: Advanced Reporting
```
@DeveloperAgent

Implement Advanced Reporting & Analytics.

**Reports:**
1. Inventory valuation (FIFO/LIFO)
2. Stock aging report
3. Fast/slow moving items
4. Supplier performance report
5. Sales trend analysis

**Export Formats:**
- PDF (with charts)
- Excel
- CSV
```

---

### Fase 4: Integration & Hardening

#### Integration Testing
```
@QAAgent

End-to-end testing seluruh sistem.

**Test Scope:**
- Complete user workflows:
  1. Register → Create warehouse → Add product → Receive stock
  2. Create SO → Pick → Ship → Generate invoice
  3. Create PO → Receive partial → Complete PO
  4. Transfer stock → Check audit trail

- Performance testing:
  - 10,000 products load time
  - 100 concurrent users
  - Report generation speed

- Security testing:
  - Tenant isolation
  - SQL injection
  - XSS prevention
  - CSRF protection

**Deliverable:** outputs/04-reports/FINAL_TEST_REPORT.md
```

---

#### Production Deployment
```
@DevOpsAgent

Production deployment untuk Inventory SaaS.

**Infrastructure:**
- VPS setup (Ubuntu)
- Docker deployment
- PostgreSQL (production DB)
- Redis (caching & sessions)
- Nginx reverse proxy + SSL
- Backup automation

**Monitoring:**
- Error tracking (Sentry)
- Performance monitoring
- Uptime alerts

**Deliverable:**
- outputs/DEPLOYMENT_GUIDE_PROD.md
- outputs/INFRASTRUCTURE.md
- outputs/RELEASE_NOTES_v1.0.md
```

---

## Scenario 2: Existing Project Enhancement

### Konteks
Tambahkan fitur "Categories" ke aplikasi Invoice yang sudah ada.

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

---

## Scenario 3: Bug Fix

### Konteks
User report: "Invoice amount tidak tersimpan ketika create invoice"

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

---

## Scenario 4: Refactoring

### Konteks
Duplicated validation logic di banyak service files.

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

---

## Scenario 5: Change Request

### Konteks
Setelah fitur Categories selesai, user minta: "Categories harus punya icon juga"

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

---

## Quick Decision Tree

```
Building new app?
- Yes -> @ProductAgent (full PRD) -> @TechLeadAgent (system design) 
         -> @DevOpsAgent (setup) -> @DeveloperAgent (per sprint) 
         -> @QAAgent (per sprint + final)

Adding major feature?
- Yes -> @ProductAgent -> @TechLeadAgent -> @DeveloperAgent -> @QAAgent

Bug report?
- Yes -> @DeveloperAgent (fix) -> @QAAgent (verify)

Code cleanup?
- Yes -> @TechLeadAgent (plan) -> @DeveloperAgent -> @QAAgent

Deploy to production?
- Yes -> @DevOpsAgent

Requirement change?
- Yes -> @ProductAgent (assess) -> @TechLeadAgent (impact) 
         -> @DeveloperAgent -> @QAAgent
```

---

## Tips Penggunaan

### 1. Context Passing
Selalu refer ke dokumen yang sudah ada:
```
@DeveloperAgent

Implement seperti dijelaskan di outputs/02-engineering/TECH_SPEC.md Section 3.
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

Referensi: outputs/04-reports/TEST_REPORT.md
```

### 4. Documentation Updates
Setelah setiap perubahan signifikan:
```
Update outputs/CHANGELOG.md
Update outputs/ROADMAP.md (jika milestone tercapai)
```
