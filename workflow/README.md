# Development Workflow

Multi-agent workflow dengan **mandatory review points**.

---

## Cara Penggunaan

### Format Panggil Agent

```
@workflow/agents/[nama-file].md [instruksi]
```

**Contoh:**
```
@workflow/agents/product.md Saya mau bikin aplikasi todolist.
```

### File ke Agent Mapping

| Panggil | File yang Dibaca | Deskripsi |
|---------|------------------|-----------|
| `@workflow/agents/product.md` | `agents/product.md` | Define requirements |
| `@workflow/agents/tech-lead.md` | `agents/tech-lead.md` | Design system |
| `@workflow/agents/developer.md` | `agents/developer.md` | Implement code |
| `@workflow/agents/qa.md` | `agents/qa.md` | Test & review |
| `@workflow/agents/devops.md` | `agents/devops.md` | Deploy & operate |

**Catatan:** Setiap agent file berisi instruksi lengkap untuk agent tersebut. File ini saling independen.

---

## Workflow Flow

```
@workflow/agents/product.md Saya mau aplikasi X...
    ↓
[🔍 CLIENT REVIEW: Approve PRD?]
    ↓ YES
@workflow/agents/tech-lead.md Lanjutkan dari Product Agent
    ↓
[🔍 CLIENT REVIEW: Approve Tech Design?]
    ↓ YES
@workflow/agents/developer.md Implement fitur...
    ↓
[🔍 CLIENT REVIEW: Approve Implementation?]
    ↓ YES
@workflow/agents/qa.md Test aplikasi
    ↓
[🔍 CLIENT REVIEW: Approve for Deploy?]
    ↓ YES
@workflow/agents/devops.md Deploy ke production
    ↓
🎉 DEPLOYED
```

**Setiap tahap ada review point. Tidak ada auto-skip.**

---

## Inertia.js Architecture

**Project ini menggunakan Inertia.js:**
- **Backend:** Elysia render Svelte pages langsung
- **No REST API:** Data lewat page props
- **Routing:** URL-based (GET /items, POST /items)
- **Forms:** Inertia useForm, bukan fetch/axios

### Output Tech Lead Agent

- ❌ `API_CONTRACT.md` (tidak perlu)
- ✅ `PAGE_ROUTES.md` (routes & page props)
- ✅ `ARCHITECTURE.md` (folder structure)
- ✅ `DATABASE_SCHEMA.md`
- ✅ `TECH_SPEC.md`

---

## Contoh Penggunaan Lengkap

### 1. Mulai Project Baru

```
@workflow/agents/product.md

Saya mau bikin aplikasi todolist.
[...deskripsikan kebutuhan...]
```

**PA akan:**
1. Interview jika perlu
2. Buat PRD, User Stories, Roadmap
3. Present ke client
4. Tunggu review & approve

**Setelah client approve:**
```
@workflow/agents/tech-lead.md

Lanjutkan dari Product Agent.
Kebutuhan produk sudah di-approve client.
Baca di workflow/outputs/01-product/
```

### 2. Fix Bug

```
@workflow/agents/developer.md

Fix bug: todo tidak bisa di-save.
```

---

## Resources

File-file berikut adalah **referensi untuk manusia** (tidak perlu dibaca agent):

| File | Purpose |
|------|---------|
| `workflow/README.md` | Dokumen ini - overview workflow |
| `workflow/examples.md` | Contoh skenario lengkap |
| `workflow/quick-reference.md` | Cheat sheet |
| `workflow/agents/README.md` | Daftar agents |

**Untuk development, cukup panggil agent file langsung.**

---

## Project Setup (Already Done)

Starter project Velist includes:
- ✅ Project structure
- ✅ Database setup (SQLite)
- ✅ Authentication system
- ✅ Inertia.js integration
- ✅ Development environment
- ✅ Build configuration

DevOps Agent hanya perlu untuk **deployment ke production**.

### Development Workflow
1. Clone project ini
2. `bun install`
3. `bun run db:migrate`
4. `bun run dev`
5. Mulai development dengan agent-agent

---

## Agent Outputs

Hasil kerja agent tersimpan di:

```
workflow/outputs/
├── 01-product/           # @workflow/agents/product.md
│   └── PRD.md            # 1 file saja
├── 02-engineering/       # @workflow/agents/tech-lead.md
│   ├── ARCHITECTURE.md   # Struktur folder & patterns
│   ├── DATABASE_SCHEMA.md # Schema changes
│   └── TASKS.md          # Routes + checklist
└── 04-reports/           # @workflow/agents/qa.md
    └── TEST_REPORT.md
```
