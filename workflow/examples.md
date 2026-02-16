# Example Usage Scenarios

Real-world examples menggunakan multi-agent workflow.

---

## Agent Call Format

Gunakan PascalCase tanpa spasi:
- `@ProductAgent` (bukan `@Product Agent`)
- `@TechLeadAgent` (bukan `@Tech Lead Agent`)
- `@DeveloperAgent`
- `@QAAgent`
- `@DevOpsAgent`

---

## Mandatory Review Points

Setiap agent **WAJIB** menunggu client review dan approve sebelum handoff.

```
@ProductAgent
    ↓
[Client Review: Approve PRD?]
    ↓ YES
@TechLeadAgent
    ↓
[Client Review: Approve Tech Design?]
    ↓ YES
@DeveloperAgent
    ↓
[Client Review: Approve Implementation?]
    ↓ YES
@QAAgent
    ↓
[Client Review: Approve for Deploy?]
    ↓ YES
@DevOpsAgent
    ↓
🎉 DEPLOYED
```

---

## Scenario 1: Full Application Development

### Step 1: Product Agent
```
@ProductAgent

Saya mau bikin aplikasi inventory untuk UMKM.

Kebutuhan:
- Kelola beberapa gudang
- Track stok real-time  
- Purchase order ke supplier
- Sales order dari customer
- Laporan penjualan dan stok
- Multi-user dengan beda akses

User: Owner, Manager, Staff
Timeline: MVP 2 bulan, full 4 bulan
```

**PA Output:**
```
✅ PRODUCT DOCUMENTATION SELESAI

📄 Deliverables:
- PRD.md (Product Requirements)
- USER_STORIES.md (24 user stories)
- ROADMAP.md (8 sprint / 16 minggu)

📋 Summary:
• 7 fitur utama
• 3 user types
• MVP: Sprint 1-4
• Full: Sprint 5-8

🔍 REVIEW REQUIRED

Silakan review dokumen di workflow/outputs/01-product/

Apakah PRD ini sudah sesuai kebutuhan?
[ ] Approve - Lanjut ke @TechLeadAgent
[ ] Request Changes - Berikan feedback
```

**Client:** "Approve" → Lanjut ke TLA

---

### Step 2: Tech Lead Agent

**TLA akan baca output PA, lalu buat:**
- ✅ TECH_SPEC.md
- ✅ ARCHITECTURE.md
- ✅ API_CONTRACT.md
- ✅ DATABASE_SCHEMA.md
- ✅ TASKS.md

**TLA Output:**
```
✅ TECHNICAL DESIGN SELESAI

📄 Deliverables:
- TECH_SPEC.md (Stack, patterns, security)
- ARCHITECTURE.md (System design)
- API_CONTRACT.md (25 endpoints)
- DATABASE_SCHEMA.md (8 tabel)
- TASKS.md (40 tasks, 8 sprint)

🔧 Tech Stack:
• Backend: Elysia + Bun
• Frontend: Svelte 5 + Inertia
• Database: SQLite
• Auth: JWT

📊 Timeline: 16 minggu (8 sprint)

🔍 REVIEW REQUIRED

Silakan review dokumen di workflow/outputs/02-engineering/

Apakah desain teknis ini acceptable?
[ ] Approve - Lanjut ke @DeveloperAgent
[ ] Request Changes - Berikan feedback
```

**Client:** "Approve" → Lanjut ke DevA

---

### Step 3: Developer Agent

**DevA akan implement sesuai mode:**

**Mode A: One-Shot (Default)**
```
DevA: Implement semua fitur...
[Progress update setiap modul]

✅ IMPLEMENTATION SELESAI

📦 Modules Completed:
• ✅ Authentication & Multi-tenant
• ✅ Warehouse Management
• ✅ Product Catalog
• ✅ Stock Operations
• ✅ Purchase Order
• ✅ Sales Order
• ✅ Reporting & Dashboard

🔍 REVIEW REQUIRED

Silakan test aplikasi di localhost:3000

Apakah implementasi ini sesuai ekspektasi?
[ ] Approve - Lanjut ke @QAAgent
[ ] Request Changes - Berikan feedback
```

**Mode B: Per Fitur**
```
DevA: Implement modul Warehouse...

✅ WAREHOUSE MODULE SELESAI

🔍 REVIEW REQUIRED

Silakan test modul Warehouse.
Lanjut ke Product Catalog?
[ ] Approve & Continue
[ ] Request Changes
```

**Client:** "Approve" → Lanjut ke QAA

---

### Step 4: QA Agent

**QAA akan test dan buat report:**

```
✅ TESTING SELESAI

📊 TEST REPORT

Status: APPROVED with minor notes

✅ All Acceptance Criteria: PASS
✅ Security Tests: PASS
✅ Performance Tests: PASS

📝 Minor Notes (non-blocking):
• Typo di error message (bisa fix later)

🔍 FINAL REVIEW BEFORE DEPLOY

Apakah aplikasi siap deploy ke production?
[ ] Approve - Deploy ke production
[ ] Request Changes - Perlu perbaikan
[ ] Reject - Major issues found
```

**Client:** "Approve" → Lanjut ke DOA

---

### Step 5: DevOps Agent

**DOA akan deploy:**

```
✅ DEPLOYMENT SELESAI

🌐 Production URL: https://app.example.com
✅ Health Check: PASS
✅ SSL: Active
✅ Monitoring: Active

📋 Production Checklist:
[✓] Database migrated
[✓] Environment configured
[✓] Backups scheduled
[✓] Health monitoring active

🎉 APLIKASI SUDAH LIVE!

📖 Dokumentasi:
- DEPLOYMENT_GUIDE.md
- INFRASTRUCTURE.md
- RELEASE_NOTES.md

Selamat menggunakan! 🚀
```

---

## Scenario 2: Feature Enhancement

```
@ProductAgent

Saya punya aplikasi invoice, mau tambah fitur kategori.

Invoice bisa dikategorikan dan filter by kategori.
```

**PA Output:**
```
✅ FITUR KATEGORI - DEFINED

User Stories:
• US-001: Create category
• US-002: Edit category
• US-003: Delete category
• US-004: Assign invoice to category
• US-005: Filter by category

🔍 REVIEW REQUIRED

Approve untuk desain teknis?
[ ] Approve - Lanjut ke @TechLeadAgent
[ ] Request Changes
```

**Client:** "Approve"

→ **@TechLeadAgent** → Design → **Review** → Approve

→ **@DeveloperAgent** → Implement → **Review** → Approve

→ **@QAAgent** → Test → **Review** → Approve

→ **@DevOpsAgent** → Deploy

---

## Scenario 3: Bug Fix

```
@DeveloperAgent

Fix bug: amount invoice tidak tersimpan.

Input $100, tersimpan $0.
```

**DevA Output:**
```
✅ BUG FIX SELESAI

Root Cause: Type coercion error di amount field
Fix: Explicit number conversion

🔍 REVIEW REQUIRED

Silakan verify fix di localhost:5173/invoices/create

Bug sudah teratasi?
[ ] Approve - Lanjut ke @QAAgent verify
[ ] Reject - Bug masih ada
```

**Client:** "Approve"

→ **@QAAgent** → Verify → **Review** → Approve → Done

---

## Review Checklist per Tahap

### 1. Product Review
- [ ] Fitur lengkap sesuai kebutuhan
- [ ] User personas sesuai target
- [ ] Timeline acceptable
- [ ] Prioritas fitur sesuai

### 2. Tech Design Review
- [ ] Tech stack sesuai
- [ ] Architecture scalable
- [ ] Security adequate
- [ ] Timeline realistic

### 3. Implementation Review
- [ ] Fitur berfungsi
- [ ] UI/UX acceptable
- [ ] Performance ok
- [ ] Bug-free (major)

### 4. QA Review
- [ ] All tests pass
- [ ] No critical/major issues
- [ ] Ready for production

---

## Catatan Penting

⚠️ **Setiap tahap WAJIB ada review point.**

Tidak ada auto-skip review.

Ini untuk memastikan:
- ✅ Kualitas terjaga
- ✅ Client puas dengan hasil
- ✅ Tidak ada surprise di akhir

---

## File to Agent Mapping

| File | Agent Call |
|------|-----------|
| `workflow/agents/product.md` | `@ProductAgent` |
| `workflow/agents/tech-lead.md` | `@TechLeadAgent` |
| `workflow/agents/developer.md` | `@DeveloperAgent` |
| `workflow/agents/qa.md` | `@QAAgent` |
| `workflow/agents/devops.md` | `@DevOpsAgent` |
