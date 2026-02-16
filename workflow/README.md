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

## Contoh Penggunaan Lengkap

### 1. Mulai Project Baru

```
@workflow/agents/product.md

Saya mau bikin aplikasi todolist.

Fitur:
- Bisa bikin todo list
- Set deadline
- Mark as complete
- Filter by status

User: Personal use
Timeline: 1 minggu
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
Kebutuhan sudah di-approve client.
```

### 2. Fix Bug

```
@workflow/agents/developer.md

Fix bug: todo tidak bisa di-save.
Error: "Failed to save" muncul setiap kali create todo.
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

Starter project EISK includes:
- ✅ Project structure ready
- ✅ Database (SQLite)
- ✅ Authentication
- ✅ Dev environment

Run:
```bash
bun install
bun run db:migrate
bun run dev
```

Then call agent.

---

## Agent Outputs

Hasil kerja agent tersimpan di:

```
workflow/outputs/
├── 01-product/       # Product Agent output
├── 02-engineering/   # Tech Lead Agent output
├── 03-tasks/         # Task breakdowns
└── 04-reports/       # QA Agent output
```

Agent-agent bisa membaca output agent lain dari folder ini.
