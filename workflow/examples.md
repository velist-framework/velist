# Example Usage Scenarios

Real-world examples menggunakan multi-agent workflow.

---

## Scenario 1: Full Application Development (New Project)

### Konteks
Client ingin membangun **SaaS Inventory Management System** dari nol.

### Fase 1: Discovery & Planning

#### Step 1: Product Agent - Client Needs
```
@ProductAgent

Saya mau bikin aplikasi inventory untuk UMKM.

**Yang saya butuhkan:**
- Bisa kelola beberapa gudang (multi-warehouse)
- Track stok barang real-time
- Bisa buat purchase order ke supplier
- Bisa buat sales order dari customer
- Ada laporan penjualan dan stok
- Bisa multi-user dengan level akses beda-beda

**User yang akan pakai:**
- Owner UMKM (lihat laporan semua cabang)
- Manager per gudang (kelola stok gudangnya)
- Staff (input barang masuk/keluar)

**Timeline:** Mau launch MVP dalam 2 bulan, full fitur 4 bulan.

Tolong analisis dan buatkan dokumentasi lengkapnya.
```

**PA Output (decide sendiri):** `outputs/01-product/PRD.md`, `USER_STORIES.md`, `ROADMAP.md`

---

#### Step 2: Tech Lead Agent - Technical Design
```
@TechLeadAgent

Baca kebutuhan dari Product Agent di outputs/01-product/

Bikin desain teknis lengkap untuk sistem ini.
Yang perlu saya tahu:
- Tech stack apa yang cocok
- Database schema seperti apa
- API structure
- Cara handle multi-tenant (tiap UMKM data terpisah)
- Estimasi task per sprint

Saya butuh ini sebelum development dimulai.
```

**TLA Output:** `TECH_SPEC.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `API_CONTRACT.md`, `TASKS.md`

---

#### Step 3: DevOps Agent - Project Setup
```
@DevOpsAgent

Setup project baru untuk Inventory SaaS.

Tech stack: EISK (Elysia + Inertia + Svelte + Kysely)
Butuh juga: CI/CD, staging environment, database setup.

Bikinkan struktur project dan development environment
biar developer bisa langsung mulai coding.
```

**DOA Output:** Project scaffolding, CI/CD config, dev environment

---

### Fase 2: MVP Development (Sprint 1-4)

#### Sprint 1: Authentication & Multi-tenancy
```
@DeveloperAgent

Sprint 1: Buat sistem login dan multi-tenant.

Referensi desain: outputs/02-engineering/

Fitur yang harus jalan:
1. User bisa register, otomatis create company/tenant
2. Login dengan JWT
3. Setiap API request tahu ini tenant mana
4. Role: Owner, Manager, Staff (beda akses)
5. Owner bisa invite user ke company-nya

Testing: Login sebagai user A, pastikan tidak bisa lihat data user B.
```

```
@QAAgent

Test Sprint 1: Auth & Multi-tenancy.

Yang harus dicek:
- JWT aman?
- Tenant A tidak bisa akses data Tenant B?
- Role restriction jalan?
- SQL injection aman?

Buatkan report hasil testing.
```

---

#### Sprint 2: Warehouse & Product Management
```
@DeveloperAgent

Sprint 2: Warehouse dan Product.

Fitur:
1. CRUD gudang (tiap company bisa punya banyak gudang)
2. CRUD produk (SKU, nama, kategori, satuan)
3. Produk bisa punya varian (ukuran, warna)
4. Generate barcode
5. Kategorisasi produk (tree view)

Database schema sudah ada di engineering spec.
```

---

#### Sprint 3: Stock Management
```
@DeveloperAgent

Sprint 3: Operasi stok.

Fitur:
1. Barang masuk (dari supplier)
2. Barang keluar (untuk sales order)
3. Transfer antar gudang
4. Adjustment stok (rusak, hilang, correction)
5. History perubahan stok

Logic yang penting:
- FIFO tracking
- Stok realtime
- Alert kalau stok dibawah minimum
```

---

#### Sprint 4: Dashboard & Reporting Foundation
```
@DeveloperAgent

Sprint 4: Dashboard dan laporan dasar.

Fitur:
1. Dashboard utama:
   - Total SKU
   - Nilai stok keseluruhan
   - Stok yang mau habis (alert)
   - Transaksi terakhir

2. Laporan:
   - Stok per gudang
   - Pergerakan barang
   - Export CSV
```

---

### Fase 3: Full Feature Development (Sprint 5-8)

#### Sprint 5-6: Supplier & Purchase Orders
```
@DeveloperAgent

Sprint 5-6: Supplier dan Purchase Order.

Fitur:
1. Master data supplier
2. Track performa supplier
3. Create Purchase Order ke supplier
4. PO bisa partial receive
5. Status PO: draft, sent, partial, received
6. Auto-update stok saat terima barang
```

---

#### Sprint 7: Sales Orders
```
@DeveloperAgent

Sprint 7: Sales Order.

Fitur:
1. Create SO dengan data customer
2. Saat SO dibuat, stok reserved
3. Proses fulfillment: pick, pack, ship
4. Bisa partial fulfillment
5. Status tracking
6. Generate invoice
```

---

#### Sprint 8: Advanced Reporting
```
@DeveloperAgent

Sprint 8: Laporan lanjutan.

Laporan yang dibutuhkan:
1. Valuasi stok (FIFO)
2. Stok aging (barang lama)
3. Fast/slow moving items
4. Performa supplier
5. Sales trend

Export: PDF (dengan chart), Excel, CSV
```

---

### Fase 4: Integration & Hardening

#### Integration Testing
```
@QAAgent

End-to-end testing seluruh aplikasi.

Test scenario lengkap:
1. Register → Create gudang → Tambah produk → Terima barang
2. Create SO → Pick → Ship → Invoice
3. Create PO → Terima partial → Complete
4. Transfer stok → Cek audit trail

Performance test:
- Load 10,000 produk
- 100 user concurrent
- Speed report generation

Security test:
- Tenant isolation
- SQL injection
- XSS

Buat report lengkap.
```

---

#### Production Deployment
```
@DevOpsAgent

Deploy ke production.

Infrastruktur:
- VPS (Ubuntu)
- Docker
- PostgreSQL production
- Redis (cache)
- Nginx + SSL
- Backup otomatis

Monitoring: Error tracking, performance, uptime alerts.

Saya butuh guide lengkap cara deploy dan maintain.
```

---

## Scenario 2: Existing Project Enhancement

### Konteks
Client punya aplikasi Invoice, mau tambah fitur Categories.

```
@ProductAgent

Saya punya aplikasi invoice, mau ditambahin fitur kategori.

Kebutuhan:
- User bisa bikin kategori (misal: Marketing, Operasional, Software)
- Invoice bisa di-assign ke kategori
- Bisa filter invoice by kategori
- Kategori default "Uncategorized"

Ini untuk membantu user mengelompokkan invoice.
```

---

## Scenario 3: Bug Fix

### Konteks
User lapor bug.

```
@DeveloperAgent

Ada bug: amount invoice tidak tersimpan.

Keluhan user:
- Input amount $100
- Setelah save muncul $0
- Field lain (customer, status) tersimpan normal

Cara reproduce:
1. Go to /invoices/create
2. Isi customer: "Test"
3. Isi amount: 100
4. Submit
5. Di list muncul $0

Yang diharapkan: Amount tersimpan sesuai input
Yang terjadi: Amount selalu 0

Tolong cari root cause dan fix.
```

---

## Scenario 4: Refactoring

### Konteks
Code quality issue.

```
@TechLeadAgent

Ada duplicated validation di banyak file.
UUID validation sama persis ada di 5 file,
email validation di 3 file.

Saya mau di-extract jadi shared utilities.
Pastikan tidak ada functional changes,
semua existing tests tetap passing.

Buatkan plan dan task breakdown.
```

---

## Scenario 5: Change Request

### Konteks
Requirement berubah setelah fitur selesai.

```
@ProductAgent

Change request untuk fitur kategori.

Sebelumnya: Kategori punya name dan color
Sekarang mau: Tambah icon juga

Alasan: User lebih cepat recognize icon daripada baca text.

Tolong analisis impact dan update dokumentasi.
```

---

## Decision Tree (Client Perspective)

```
Mau bikin aplikasi baru?
- Ya -> @ProductAgent (ceritakan kebutuhan bisnis)
       -> @TechLeadAgent (minta desain teknis)
       -> @DevOpsAgent (minta setup project)
       -> @DeveloperAgent (per fitur/sprint)
       -> @QAAgent (test per fitur)

Mau nambah fitur?
- Ya -> @ProductAgent (ceritakan fitur yang diinginkan)
       -> @TechLeadAgent (desain teknis)
       -> @DeveloperAgent (implementasi)
       -> @QAAgent (testing)

Ada bug?
- Ya -> @DeveloperAgent (deskripsikan bug)
       -> @QAAgent (verifikasi fix)

Mau deploy?
- Ya -> @DevOpsAgent (minta deploy ke staging/production)
```

---

## Prinsip Penting

### 1. Client Speak Business Language
❌ **Jangan:** "Buatkan PRD, user stories, roadmap"
✅ **Do:** "Saya mau aplikasi inventory untuk UMKM..."

Agent yang tentukan deliverables sesuai kebutuhan.

### 2. Refer to Previous Work
```
@TechLeadAgent

Baca kebutuhan dari Product Agent di outputs/01-product/
Bikin desain teknis lengkap.
```

### 3. Specific for Developer
```
@DeveloperAgent

Sprint 3: Buat fitur operasi stok.
Referensi desain: outputs/02-engineering/

Yang harus ada:
1. Barang masuk
2. Barang keluar
3. Transfer antar gudang
4. History
```

### 4. Natural Language
```
@QAAgent

Test aplikasi ini.
Pastikan:
- Tenant A tidak bisa lihat data Tenant B
- JWT aman
- Tidak ada SQL injection

Buatkan report hasilnya.
```
