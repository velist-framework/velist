# Example Usage Scenarios

Real-world examples menggunakan multi-agent workflow.

---

## Automatic Handoff Rule

Setelah satu agent selesai, **agent berikutnya otomatis dilanjutkan** tanpa perlu client panggil lagi.

| Agent | Selesai → Lanjut ke |
|-------|---------------------|
| @ProductAgent | @TechLeadAgent (otomatis) |
| @TechLeadAgent | @DeveloperAgent (otomatis) |
| @DeveloperAgent | @QAAgent (otomatis) |
| @QAAgent | @DevOpsAgent (jika deploy) atau Client (jika revisi) |

Client hanya perlu **approve** atau **request changes** di setiap tahap.

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
- ✅ PRD.md
- ✅ USER_STORIES.md
- ✅ ROADMAP.md

**Otomatis lanjut ke Tech Lead Agent →**

---

### Step 2: Tech Lead Agent (Auto)

**TLA akan baca output PA, lalu buat:**
- ✅ TECH_SPEC.md
- ✅ ARCHITECTURE.md
- ✅ API_CONTRACT.md
- ✅ DATABASE_SCHEMA.md
- ✅ TASKS.md

**TLA present ke client:**
```
Desain teknis selesai.

Stack: EISK + SQLite
Database: 8 tabel utama
API: 25 endpoints
Timeline: 8 sprint (16 minggu)

Approve untuk mulai development? (Y/n)
```

**Client approve → Otomatis lanjut ke Developer Agent →**

---

### Step 3: Developer Agent (3 Modes)

**Mode A: One-Shot (Default)**
```
DevA akan implement semua fitur sekaligus.

Progress:
- ✅ Auth & Multi-tenant
- ✅ Warehouse Management
- ✅ Product Catalog
- ✅ Stock Operations
- ✅ Purchase Order
- ✅ Sales Order
- ✅ Reporting

Semua fitur selesai. Lanjut ke QA?
```

**Mode B: Per Fitur (Request)**
```
DevA: Mau per fitur atau sekaligus?

Client: Per fitur

DevA: OK, mulai dari Warehouse.
[Implement Warehouse]
Selesai. Lanjut ke Product Catalog? (Y/n)
```

**Mode C: Auto-Prioritize (Jika client bingung)**
```
DevA: Ini prioritas fitur:

Phase 1: Foundation
1. Authentication
2. Multi-tenant

Phase 2: Core
3. Warehouse
4. Product

Mulai dari mana? Atau semua?

Client: Semua

DevA: OK, implement semua.
```

**Dev selesai → Otomatis lanjut ke QA Agent →**

---

### Step 4: QA Agent (Auto)

**QAA akan test dan buat report:**
```
TEST REPORT

Status: APPROVED dengan catatan minor

Issues:
- Minor: Typo di error message (bisa fix later)

Semua fitur working. Deploy ke production?
```

**Client approve → Otomatis lanjut ke DevOps Agent →**

---

### Step 5: DevOps Agent (Auto)

**DOA akan deploy:**
```
Deployed ke production!

URL: https://app.example.com
Health: OK
Monitoring: Active

Project selesai! 🎉
```

---

## Workflow Singkat

```
@ProductAgent Saya mau aplikasi X...
    ↓ (auto)
@TechLeadAgent Desain teknis...
    ↓ (auto setelah approve)
@DeveloperAgent Implement...
    ↓ (auto)
@QAAgent Test...
    ↓ (auto setelah approve)
@DevOpsAgent Deploy!
    ↓
🎉 Selesai!
```

**Client cukup:**
1. Deskripsikan kebutuhan
2. Approve desain teknis (opsional, bisa auto-approve)
3. Approve untuk deploy (opsional, bisa auto-deploy)

---

## Scenario 2: Feature Enhancement (Auto Flow)

```
@ProductAgent

Saya punya aplikasi invoice, mau tambah fitur kategori.

Invoice bisa dikategorikan dan filter by kategori.
    ↓ (auto)
@TechLeadAgent

Desain fitur kategori selesai.
- Tambah tabel categories
- Update invoice API
- UI dropdown kategori

Approve? (Y/n)
    ↓ (auto setelah approve)
@DeveloperAgent

Implement fitur kategori selesai.
    ↓ (auto)
@QAAgent

Fitur kategori tested ✅
Deploy ke production? (Y/n)
    ↓ (auto setelah approve)
@DevOpsAgent

Deployed! 🎉
```

---

## Scenario 3: Bug Fix (Quick Flow)

```
@DeveloperAgent

Ada bug: amount invoice tidak tersimpan.
    ↓ (auto setelah fix)
@QAAgent

Bug fix verified ✅
```

---

## Scenario 4: Manual Mode (Jika Perlu)

Jika client mau kontrol manual, bisa dengan **menahan auto-lanjut**:

```
@ProductAgent

Saya mau aplikasi X. 
TAPI: Saya mau review desain teknis dulu sebelum development.
```

PA akan selesai, **tidak auto-lanjut**, tunggu client panggil TLA manual:

```
@TechLeadAgent

OK, lanjutkan desain teknis.
```

---

## Keuntungan Auto Handoff

| Sebelum | Sesudah |
|---------|---------|
| Client panggil 5 agent manual | Client panggil 1 agent, sisanya auto |
| Banyak context switching | Seamless flow |
| Client harus ingat urutan | Agent yang manage workflow |
| Lama | Cepat |

---

## Catatan

### Project Sudah Ready
Starter project EISK ini sudah include:
- ✅ Project structure
- ✅ Database setup (SQLite)
- ✅ Authentication system
- ✅ Development environment
- ✅ Build configuration

### Approval Points
Client bisa set auto-approve di:
- ✅ Desain teknis (langsung dev tanpa review)
- ✅ Deploy (langsung deploy setelah QA pass)

Atau manual approve untuk kontrol penuh.
