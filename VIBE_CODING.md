# Vibe Coding Workflow for EISK Stack

> **Vibe Coding**: Iterative AI-assisted development with structured capture, review, and refinement cycles.

---

## 🎯 Philosophy

Vibe coding dengan AI bukan sekadar "minta AI ngerjain", tapi:

1. **Intent-driven**: Mulai dari problem/goal, bukan langsung kode
2. **Iterative refinement**: Siklus prompt → review → refine → capture
3. **Documented journey**: Setiap keputusan dan iterasi tercatat
4. **Reusable patterns**: Hasil vibe coding jadi template untuk masa depan

---

## 🔄 The Vibe Coding Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                     VIBE CODING CYCLE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  INTENT  │───→│  DESIGN  │───→│  IMPLEMENT│───→│  VERIFY  │  │
│  │  (What)  │    │  (How)   │    │  (Code)   │    │  (Test)  │  │
│  └──────────┘    └──────────┘    └──────────┘    └────┬─────┘  │
│       ↑                                               │         │
│       └───────────────────────────────────────────────┘         │
│                    (Refine & Capture)                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1. INTENT Phase

**Goal**: Definisikan APA yang mau dibangun dengan jelas

**Template**:
```markdown
## Feature Intent: [Nama Fitur]

### Problem Statement
User butuh [fitur] karena [alasannya]

### Success Criteria
- [ ] Kriteria 1
- [ ] Kriteria 2

### Constraints
- Must use: [teknologi/stack requirement]
- Must not: [batasan]

### Reference/Context
- [Link ke spec/dokumen]
- [Screenshot/mockup]
```

**Contoh**:
```markdown
## Feature Intent: Invoice Management

### Problem Statement
User perlu mengelola invoice customer dengan status pembayaran

### Success Criteria
- [ ] CRUD invoice dengan validasi
- [ ] Filter by status (pending/paid/cancelled)
- [ ] Export ke PDF
- [ ] Kirim email notifikasi

### Constraints
- Must use: UUID v7, TypeBox validation
- Must not: External payment gateway (manual dulu)

### Reference
- Figma: [link]
- User story: #123
```

### 2. DESIGN Phase

**Goal**: Rancang solusi TANPA menulis kode implementasi

**Output**:
- Database schema changes
- API endpoint design
- Component structure
- Flow diagram (opsional)

**Template**:
```markdown
## Design: [Nama Fitur]

### Database Schema
```typescript
// Tambahan ke DatabaseSchema
invoices: {
  id: string
  customer_name: string
  amount: number
  status: 'pending' | 'paid' | 'cancelled'
  due_date: string
  paid_at: string | null
  created_at: string
  updated_at: string
}
```

### API Design
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /invoices | List dengan filter |
| POST | /invoices | Create new |
| GET | /invoices/:id | Detail |
| PUT | /invoices/:id | Update |
| DELETE | /invoices/:id | Soft delete |

### Component Hierarchy
```
Invoices/
├── Index.svelte (list + filter)
├── Create.svelte (form)
├── Edit.svelte (form + status update)
└── Show.svelte (detail + actions)
```

### Business Rules
1. Invoice tidak bisa dihapus kalau status = paid
2. Auto-set paid_at ketika status berubah ke paid
3. Validasi due_date harus di masa depan
```

### 3. IMPLEMENT Phase

**Goal**: AI generate kode berdasarkan design

**Prompt Structure**:
```markdown
Implement [Nama Fitur] following EISK Stack conventions:

[DESIGN DOCUMENT]

Requirements:
1. Follow vertical feature slicing
2. Use TypeBox for validation
3. UUID v7 for IDs
4. Snake_case for DB columns
5. Tailwind inline styling (no components)

Generate:
1. Repository (with pagination)
2. Service (with TypeBox schemas)
3. API routes (protected)
4. Svelte pages (Index, Create, Edit)
5. Migration file
```

### 4. VERIFY Phase

**Goal**: Validasi hasil implementasi

**Checklist**:
- [ ] TypeScript tidak ada error
- [ ] Database migration berjalan
- [ ] Fitur bisa diakses di browser
- [ ] Validation berfungsi
- [ ] Error handling proper

**Commands**:
```bash
# Type check
bun run typecheck

# Run migrations
bun run db:migrate

# Test in browser
bun run dev

# E2E test (if exists)
npx playwright test [feature]
```

### 5. CAPTURE Phase

**Goal**: Dokumentasikan hasil untuk reusable

**File**: `vibe-captures/[timestamp]-[feature].md`

**Template**:
```markdown
# Vibe Capture: [Feature Name]
**Date**: YYYY-MM-DD  
**Intent**: [Link ke intent doc]  
**Design**: [Link ke design doc]

## Final Implementation
[Link ke commit/files]

## Key Decisions
1. **Decision**: [Apa yang diputuskan]
   **Rationale**: [Kenapa]
   
2. **Decision**: ...

## Challenges & Solutions
| Challenge | Solution |
|-----------|----------|
| [Problem] | [How solved] |

## Reusable Patterns
```typescript
// Pattern yang bisa dipakai lagi
```

## AI Prompts Used
[Copy paste prompts yang efektif]

## Time Spent
- Design: X min
- Implementation: X min
- Verification: X min
- Total: X min

## Lessons Learned
- [Insight 1]
- [Insight 2]
```

---

## 📁 Vibe Coding Project Structure

```
project/
├── vibe-coding/              # Vibe coding workspace
│   ├── intents/              # Intent documents
│   │   ├── 2026-02-16-invoice-management.md
│   │   └── README.md         # Index semua intents
│   ├── designs/              # Design documents
│   │   ├── 2026-02-16-invoice-design.md
│   │   └── README.md
│   ├── captures/             # Completed captures
│   │   ├── 2026-02-16-15-30-invoice-management.md
│   │   └── README.md
│   └── sessions/             # Active sessions
│       └── current.md        # Session yang sedang berjalan
│
├── .kimi/
│   └── prompts/              # Reusable AI prompts
│       ├── 01-intent.md
│       ├── 02-design.md
│       ├── 03-implement-crud.md
│       ├── 04-implement-auth.md
│       └── 05-review.md
│
├── scripts/
│   └── vibe-tools/           # Automation scripts
│       ├── start-session.ts
│       ├── capture-session.ts
│       └── list-captures.ts
│
└── AGENTS.md                 # Reference untuk AI
```

---

## 🚀 Starting a Vibe Coding Session

### Quick Start

```bash
# 1. Start new session
bun run vibe:start "Invoice Management System"

# Ini akan membuat:
# - vibe-coding/sessions/current.md
# - vibe-coding/intents/YYYY-MM-DD-[slug].md
```

### Manual Flow

```bash
# 1. Create intent document
mkdir -p vibe-coding/intents
cat > vibe-coding/intents/2026-02-16-invoice.md << 'EOF'
## Feature Intent: Invoice Management
[isi intent]
EOF

# 2. AI-assisted design
# Copy intent ke chat, minta AI buatkan design doc

# 3. Save design
cat > vibe-coding/designs/2026-02-16-invoice.md << 'EOF'
## Design: Invoice Management
[isi design]
EOF

# 4. Implement with AI
# Use design doc sebagai context

# 5. Capture session
bun run vibe:capture "Invoice Management"
```

---

## 🎭 AI Personas for Vibe Coding

### 1. The Architect (Design Phase)

**Prompt prefix**:
```markdown
You are a senior software architect. Your job is to design systems, NOT write implementation code.

Given this feature intent, create:
1. Database schema design
2. API contract
3. Component structure
4. Business rules

Focus on clarity and correctness. Use TypeScript types for clarity.
```

### 2. The Craftsman (Implement Phase)

**Prompt prefix**:
```markdown
You are an expert TypeScript/Svelte developer following EISK Stack conventions.

Implement the attached design with:
- Clean, readable code
- Proper error handling
- Type safety
- No shortcuts

Follow the patterns in .cursorrules and AGENTS.md exactly.
```

### 3. The Reviewer (Verify Phase)

**Prompt prefix**:
```markdown
You are a code reviewer. Review the implementation against the design.

Check for:
1. Correctness (does it match design?)
2. Convention compliance (follows EISK patterns?)
3. Edge cases (what could go wrong?)
4. Security issues

Provide specific, actionable feedback.
```

---

## 📝 Vibe Coding Session Template

Copy this untuk setiap session:

```markdown
# Vibe Session: [Feature Name]
**Status**: 🟡 In Progress  
**Started**: YYYY-MM-DD HH:MM  
**Intent**: [Link]  
**Design**: [Link]

## Current Phase
- [x] Intent
- [x] Design
- [ ] Implement
- [ ] Verify
- [ ] Capture

## Conversation Log

### Turn 1: Intent Clarification
**Me**: [Prompt]

**AI**: [Response]

**Decision**: [Apa yang diputuskan]

### Turn 2: Design Review
**Me**: [Prompt]

**AI**: [Response]

**Changes**: [Perubahan dari design awal]

### Turn 3: Implementation
...

## Blockers
- [ ] [Blocker 1]

## Next Actions
1. [ ] Action 1
2. [ ] Action 2
```

---

## 🎨 Best Practices

### DO ✅

- **Start with intent**, jangan langsung "buatkan fitur X"
- **Satu fitur = satu session**, jangan campur-campur
- **Capture segera** setelah selesai, jangan ditunda
- **Commit message deskriptif**: `feat(invoices): add CRUD with pagination`
- **Reuse captures** sebagai referensi untuk fitur serupa

### DON'T ❌

- Jangan skip design phase langsung coding
- Jangan biarkan session tanpa capture
- Jangan tanya "ini bener gak?" tanpa context lengkap
- Jangan mix bahasa Indonesia dan Inggris dalam satu session

### PROMPT PATTERNS

**❌ Bad Prompt**:
```
buatkan fitur invoice
```

**✅ Good Prompt**:
```markdown
## Feature Intent: Invoice Management

### Context
Sistem butuh mengelola invoice untuk customer dengan lifecycle:
- Draft → Sent → Paid/Cancelled

### Requirements
1. CRUD invoice dengan line items
2. Status workflow dengan validasi
3. PDF export (client-side dulu)
4. Email notification (placeholder)

### Database
Table: invoices, invoice_items

Generate design doc terlebih dahulu.
```

---

## 📊 Vibe Coding Metrics

Track ini untuk improve workflow:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Intent → Design time | < 15 min | Timestamp di session |
| Design → Implement time | < 30 min | Timestamp di session |
| Verification cycles | < 3 | Jumlah "fix ini" prompts |
| Reuse rate | > 50% | Berapa kali pattern dipakai ulang |

---

## 🔗 Integration with Existing Tools

### With Cursor

1. Buka file intent di Cursor
2. Select all → Cmd+K (AI Chat dengan context file)
3. Hasil design save ke file design
4. Continue dengan implement

### With Claude Code

```bash
# Claude akan membaca .claude.md otomatis
# Gunakan @ untuk reference files:
@intent.md @design.md implement this feature
```

### With Kimi CLI

```bash
# Kimi membaca VIBE_CODING.md dan AGENTS.md
# Gunakan untuk review:
kimi review src/features/invoices/
```

---

## 🎯 Example Complete Session

Lihat folder `vibe-coding/examples/` untuk:
- `invoice-management/` - Complete session dari intent sampai capture
- `user-profile/` - Session dengan iteration/refinement
- `api-integration/` - Session untuk external API integration

---

## 🚀 Next Steps

1. **Setup workspace**:
   ```bash
   mkdir -p vibe-coding/{intents,designs,captures,sessions}
   ```

2. **Read examples** di `vibe-coding/examples/`

3. **Start first session** dengan fitur kecil

4. **Iterate** dan refine workflow sesuai kebutuhan tim

---

## 📚 References

- [AGENTS.md](./AGENTS.md) - Technical patterns
- [.cursorrules](./.cursorrules) - Cursor IDE patterns  
- [.claude.md](./.claude.md) - Claude Code patterns
- [AI_STARTER_GUIDE.md](./AI_STARTER_GUIDE.md) - Panduan memulai project baru

---

> **Remember**: Vibe coding adalah tentang **kecepatan dengan kualitas**, bukan kecepatan tanpa arah. Document your journey!
