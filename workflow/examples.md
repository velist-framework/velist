# Example Usage Scenarios

Real-world examples menggunakan multi-agent workflow.

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

**PA akan tanya clarifying questions, lalu buat PRD, User Stories, Roadmap.**

---

### Step 2: Tech Lead Agent
```
@TechLeadAgent

Lanjutkan dari Product Agent.

Saya butuh desain teknis sebelum development dimulai.
```

**TLA akan baca output PA, lalu buat Tech Spec, Architecture, API Contract, Database Schema, dan Task breakdown.**

---

### Step 3: Developer Agent (3 Modes)

#### Mode A: One-Shot Development (Semua Fitur Sekaligus)
```
@DeveloperAgent

Implement semua fitur inventory system.
```

**DevA akan:**
- Baca Tech Spec dan semua tasks
- Implement seluruh modul secara berurutan
- Bikin semua database, API, UI
- Update progress setiap selesai modul

*Cocok untuk: Project kecil, atau client mau lihat hasil cepat*

---

#### Mode B: Per Fitur/Modul
```
@DeveloperAgent

Implement modul Warehouse Management.
```

atau

```
@DeveloperAgent

Implement fitur Purchase Order.
```

**DevA akan:**
- Implement modul tersebut lengkap (DB, API, UI)
- Test modul tersebut
- Siap untuk modul berikutnya

*Cocok untuk: Project besar, ingin test per modul*

---

#### Mode C: Auto-Prioritize (Client Bingung Mau Mulai Dari Mana)
```
@DeveloperAgent

Saya mau bikin aplikasi inventory tapi bingung mulai dari mana.
Bantu saya tentukan fitur apa yang harus dikerjakan duluan.
```

**DevA akan:**
- Analisis Tech Spec dan Tasks
- Kasih list prioritas fitur:
  ```
  1. **Authentication & Multi-tenant** (Foundation)
     - User bisa login
     - Data terisolasi per company
     
  2. **Warehouse Management** (Core Data)
     - Setup gudang
     - Struktur data dasar
     
  3. **Product Catalog** (Core Data)
     - Master data produk
     - 
  4. **Stock Operations** (Main Feature)
     - Barang masuk/keluar
     
  5. **Purchase Order** (Operational)
  6. **Sales Order** (Operational)
  7. **Reporting** (Nice to have)
  ```
- Recommend mana yang dikerjakan dulu
- Tunggu konfirmasi client sebelum mulai

*Cocok untuk: Client non-technical, bingung prioritas*

---

### Step 4: QA Agent
```
@QAAgent

Test aplikasi inventory.
```

**QAA akan test semua fitur dan buat report.**

---

### Step 5: DevOps Agent
```
@DevOpsAgent

Deploy ke production.
```

**DOA akan deploy dan setup monitoring.**

---

## Scenario 2: Feature Enhancement

```
@ProductAgent

Saya punya aplikasi invoice, mau tambah fitur kategori.

Invoice bisa dikategorikan (Marketing, Operasional, Software)
dan bisa filter by kategori.
```

```
@TechLeadAgent

Lanjutkan dari Product Agent.
```

```
@DeveloperAgent

Implement fitur kategori.
```

```
@QAAgent

Test fitur kategori.
```

---

## Scenario 3: Bug Fix

```
@DeveloperAgent

Ada bug: amount invoice tidak tersimpan.

Input $100, tersimpan $0. Field lain normal.
```

```
@QAAgent

Verify fix.
```

---

## Scenario 4: Refactoring

```
@TechLeadAgent

Ada duplicated validation di 5 file.
Mau di-extract jadi shared utilities.
```

```
@DeveloperAgent

Implement refactor.
```

```
@QAAgent

Regression test.
```

---

## Scenario 5: Change Request

```
@ProductAgent

Change request: Kategori yang sudah jalan mau ditambah icon.
```

```
@TechLeadAgent

Lanjutkan dari Product Agent.
```

```
@DeveloperAgent

Update fitur kategori tambah icon.
```

---

## Catatan

### Project Sudah Ready
Starter project EISK ini sudah include:
- ✅ Project structure
- ✅ Database setup (SQLite)
- ✅ Authentication system
- ✅ Development environment
- ✅ Build configuration

DevOps Agent hanya perlu untuk **deployment ke production**.

### Development Workflow
1. Clone project ini
2. `bun install`
3. `bun run db:migrate`
4. `bun run dev`
5. Mulai development dengan agent-agent

### Developer Agent Modes

| Mode | Instruksi | Kapan Pakai |
|------|-----------|-------------|
| One-Shot | "Implement semua fitur" | Project kecil, mau cepat |
| Per Fitur | "Implement [nama fitur]" | Project besar, gradual |
| Auto-Prioritize | "Bingung mulai dari mana" | Client non-technical |

---

## Prinsip Utama

### 1. Client Ngomong Business, Bukan Technical
❌ "Buatkan PRD, user stories, dan roadmap"
✅ "Saya mau aplikasi inventory untuk UMKM..."

### 2. Agent Tahu Job Description Masing-Masing
❌ "Baca outputs/01-product/ lalu buat TECH_SPEC.md"
✅ "Lanjutkan dari Product Agent"

### 3. Minimal Context Passing
❌ Deskripsi panjang apa yang harus dikerjakan
✅ Cukup sebut sprint/fitur yang dimaksud

### 4. Agent Initiative
Agent bertanya jika perlu clarifikasi, bukan client yang harus detailkan semua.
