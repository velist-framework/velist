# Development Workflow

Multi-agent workflow dengan **mandatory review points**.

---

## Workflow Flow

```
@ProductAgent
    ↓
[🔍 CLIENT REVIEW: Approve PRD?]
    ↓ YES
@TechLeadAgent
    ↓
[🔍 CLIENT REVIEW: Approve Tech Design?]
    ↓ YES
@DeveloperAgent
    ↓
[🔍 CLIENT REVIEW: Approve Implementation?]
    ↓ YES
@QAAgent
    ↓
[🔍 CLIENT REVIEW: Approve for Deploy?]
    ↓ YES
@DevOpsAgent
    ↓
🎉 DEPLOYED
```

**Setiap tahap ada review point. Tidak ada auto-skip.**

---

## How It Works

1. **Client panggil @ProductAgent** dengan kebutuhan
2. **PA selesai → TUNGGU CLIENT REVIEW**
3. **Client approve → TLA mulai**
4. **TLA selesai → TUNGGU CLIENT REVIEW**
5. **Client approve → DevA mulai**
6. **DevA selesai → TUNGGU CLIENT REVIEW**
7. **Client approve → QA mulai**
8. **QA selesai → TUNGGU CLIENT REVIEW**
9. **Client approve → DOA deploy**

---

## Agents

| Agent | Output | Review Point |
|-------|--------|--------------|
| @ProductAgent | PRD, User Stories, Roadmap | Approve requirements? |
| @TechLeadAgent | Tech Spec, Architecture, Tasks | Approve design? |
| @DeveloperAgent | Working code | Approve implementation? |
| @QAAgent | Test Report | Approve for production? |
| @DevOpsAgent | Live application | - |

---

## Resources

- [**examples.md**](examples.md) - Real scenarios dengan review points
- [**quick-reference.md**](quick-reference.md) - Cheat sheet

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

Then call @ProductAgent.
