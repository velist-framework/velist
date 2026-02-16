# Example Usage Scenarios

Real-world examples menggunakan multi-agent workflow.

---

## Cara Panggil Agent

Format lengkap:
```
@workflow/agents/[nama-file].md [instruksi]
```

Contoh:
```
@workflow/agents/product.md Saya mau bikin aplikasi todolist.
```

---

## Mandatory Review Points

Setiap agent **WAJIB** menunggu client review dan approve sebelum handoff.

```
@workflow/agents/product.md [instruksi]
    ↓
[Client Review: Approve PRD?]
    ↓ YES
@workflow/agents/tech-lead.md Lanjutkan dari Product Agent
    ↓
[Client Review: Approve Tech Design?]
    ↓ YES
@workflow/agents/developer.md [instruksi]
    ↓
[Client Review: Approve Implementation?]
    ↓ YES
@workflow/agents/qa.md Test aplikasi
    ↓
[Client Review: Approve for Deploy?]
    ↓ YES
@workflow/agents/devops.md Deploy ke production
    ↓
🎉 DEPLOYED
```

---

## Scenario 1: Full Application Development

### Step 1: Product Agent
```
@workflow/agents/product.md

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
[ ] Approve - Lanjut ke @workflow/agents/tech-lead.md
[ ] Request Changes - Berikan feedback
```

**Client:** "Approve" → Lanjut ke TLA

---

### Step 2: Tech Lead Agent

```
@workflow/agents/tech-lead.md

Lanjutkan dari Product Agent.
Kebutuhan produk sudah di-approve client.
```

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
[ ] Approve - Lanjut ke @workflow/agents/developer.md
[ ] Request Changes - Berikan feedback
```

**Client:** "Approve" → Lanjut ke DevA

---

### Step 3: Developer Agent

**Mode A: One-Shot (Default)**
```
@workflow/agents/developer.md

Implement semua fitur inventory system.
```

**DevA Output:**
```
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
[ ] Approve - Lanjut ke @workflow/agents/qa.md
[ ] Request Changes - Berikan feedback
```

**Mode B: Per Fitur**
```
@workflow/agents/developer.md

Implement modul Warehouse Management.
```

**Client:** "Approve" → Lanjut ke QAA

---

### Step 4: QA Agent

```
@workflow/agents/qa.md

Test aplikasi inventory.
```

**QAA Output:**
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

```
@workflow/agents/devops.md

Deploy ke production.
```

**DOA Output:**
```
✅ DEPLOYMENT SELESAI

🌐 Production URL: https://app.example.com
✅ Health Check: PASS
✅ SSL: Active
✅ Monitoring: Active

🎉 APLIKASI SUDAH LIVE!
```

---

## Scenario 2: Feature Enhancement

```
@workflow/agents/product.md

Saya punya aplikasi invoice, mau tambah fitur kategori.

Invoice bisa dikategorikan dan filter by kategori.
```

**Client:** "Approve" →

```
@workflow/agents/tech-lead.md

Lanjutkan dari Product Agent.
```

**Client:** "Approve" →

```
@workflow/agents/developer.md

Implement fitur kategori.
```

**Client:** "Approve" →

```
@workflow/agents/qa.md

Test fitur kategori.
```

**Client:** "Approve" →

```
@workflow/agents/devops.md

Deploy ke production.
```

---

## Scenario 3: Bug Fix

```
@workflow/agents/developer.md

Fix bug: amount invoice tidak tersimpan.

Input $100, tersimpan $0.
```

**Client:** "Approve" →

```
@workflow/agents/qa.md

Verify bug fix.
```

---

## Quick Reference

| Panggil | Deskripsi |
|---------|-----------|
| `@workflow/agents/product.md` | Define product requirements |
| `@workflow/agents/tech-lead.md` | Design technical architecture |
| `@workflow/agents/developer.md` | Implement code |
| `@workflow/agents/qa.md` | Test and review |
| `@workflow/agents/devops.md` | Deploy to production |

---

## Catatan

- Setiap agent file (`product.md`, `tech-lead.md`, dll.) berisi **instruksi lengkap** untuk agent tersebut
- Agent files saling **independen** dan self-contained
- File `workflow/README.md` dan `workflow/examples.md` hanya untuk **referensi manusia**
- Untuk development, **cukup panggil agent file langsung**
