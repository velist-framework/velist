# Development Workflow

Multi-agent workflow system dengan **automatic handoff**.

---

## How It Works

```
Client: @ProductAgent Saya mau aplikasi X...
    ↓ (auto)
PA: Selesai define product
    ↓ (auto)
TLA: Selesai desain teknis
    ↓ (auto setelah approve)
DevA: Selesai implement
    ↓ (auto)
QAA: Selesai test
    ↓ (auto setelah approve)
DOA: Deployed! 🎉
```

**Client cukup:**
1. Deskripsikan kebutuhan ke @ProductAgent
2. Approve di titik-titik tertentu (opsional)
3. Terima hasil akhir

---

## Agents

| Agent | Triggers | Auto Next |
|-------|----------|-----------|
| @ProductAgent | Client request | @TechLeadAgent |
| @TechLeadAgent | PA complete | @DeveloperAgent* |
| @DeveloperAgent | TLA complete | @QAAgent |
| @QAAgent | Dev complete | @DevOpsAgent** |
| @DevOpsAgent | QA complete | Done 🎉 |

\* Setelah client approve (atau auto-approve)
\*\* Setelah client approve deploy (atau auto-deploy)

---

## Agent Documentation

- [**agents/product.md**](agents/product.md) - Define requirements
- [**agents/tech-lead.md**](agents/tech-lead.md) - Design system
- [**agents/developer.md**](agents/developer.md) - Implement (3 modes)
- [**agents/qa.md**](agents/qa.md) - Test & review
- [**agents/devops.md**](agents/devops.md) - Deploy

---

## Resources

- [**examples.md**](examples.md) - Real scenarios with auto handoff
- [**quick-reference.md**](quick-reference.md) - Cheat sheet

---

## Quick Start

### Build New App (Auto Mode)
```
@ProductAgent Saya mau aplikasi inventory...
[...deskripsikan kebutuhan...]
```

Tunggu sampai selesai. Agent-agent akan otomatis lanjut.

### Build New App (Manual Mode)
```
@ProductAgent Saya mau aplikasi X. 
Tapi saya mau review setiap tahap.
```

PA akan selesai dan **wait**, tidak auto-lanjut. Client approve untuk next step.

---

## Project Setup (Already Done)

This starter includes:
- ✅ EISK stack ready
- ✅ Database (SQLite)
- ✅ Authentication
- ✅ Dev environment

Just run:
```bash
bun install
bun run db:migrate
bun run dev
```

Then call @ProductAgent.

---

## Workflow Outputs

Agent outputs stored in `outputs/`:

```
outputs/
├── 01-product/           # @ProductAgent
├── 02-engineering/       # @TechLeadAgent
├── 03-tasks/             # Task breakdowns
└── 04-reports/           # @QAAgent
```
