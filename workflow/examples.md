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

### Step 3: DevOps Agent
```
@DevOpsAgent

Setup project dan development environment.

Stack: EISK (Elysia + Inertia + Svelte + Kysely)
```

**DOA akan scaffold project, setup CI/CD, dan siapkan dev environment.**

---

### Step 4: Developer Agent (Per Sprint)
```
@DeveloperAgent

Sprint 1: Authentication dan multi-tenant.
```

**DevA akan baca Tech Spec dan Tasks, lalu implement fitur authentication.**

```
@DeveloperAgent

Sprint 2: Warehouse dan Product management.
```

**DevA akan lanjut ke modul berikutnya.**

---

### Step 5: QA Agent
```
@QAAgent

Test Sprint 1.
```

**QAA akan test dan buat report.**

```
@QAAgent

End-to-end test seluruh aplikasi sebelum production.
```

---

### Step 6: DevOps Agent
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

## Prinsip Utama

### 1. Client Ngomong Business, Bukan Technical
❌ "Buatkan PRD, user stories, dan roadmap"
✅ "Saya mau aplikasi inventory untuk UMKM..."

### 2. Agent Tahu Job Description Masing-Masing
❌ "Baca outputs/01-product/ lalu buat TECH_SPEC.md"
✅ "Lanjutkan dari Product Agent"

### 3. Minimal Context Passing
❌ Deskripsi panjang apa yang harus dikerjakan
✅ Cukup sebut sprint/feature yang dimaksud

### 4. Agent Initiative
Agent bertanya jika perlu clarifikasi, bukan client yang harus detailkan semua.
