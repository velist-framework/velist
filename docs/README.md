# Project Documentation

Dokumentasi lengkap untuk project EISK Invoice Management menggunakan Multi-Agent Workflow.

---

## Workflow Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   @ProductAgent │ --> │ @TechLeadAgent  │ --> │ @DeveloperAgent │
│   (DISCOVER)    │     │    (DESIGN)     │     │   (DEVELOP)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        v
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ @DevOpsAgent    | <-- |   @QAAgent      | <-- │  Code Complete  |
│   (DEPLOY)      |     │   (REVIEW)      |     │                 |
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Folder Structure

| Folder | Agent | Purpose |
|--------|-------|---------|
| `00-meta/` | All | Project charter, decision log |
| `01-product/` | PA | PRD, user stories, roadmap |
| `02-engineering/` | TLA | Tech specs, architecture, API |
| `03-implementation/` | DevA | Tasks, progress log, changelog |
| `04-testing/` | QAA | Test plans, test reports |
| `05-deployment/` | DOA | Deployment guides, infrastructure |
| `06-agents/` | All | Agent instructions and templates |

---

## How to Start

### New Feature

1. **@ProductAgent** - Define requirements
   ```
   @ProductAgent Saya ingin membuat fitur [X]...
   ```

2. **@TechLeadAgent** - Design architecture
   ```
   @TechLeadAgent Baca PRD di docs/01-product/ dan buat spec...
   ```

3. **@DeveloperAgent** - Implement
   ```
   @DeveloperAgent Implement Task-XXX dari TASKS.md...
   ```

4. **@QAAgent** - Review
   ```
   @QAAgent Review implementasi Task-XXX...
   ```

5. **@DevOpsAgent** - Deploy (optional)
   ```
   @DevOpsAgent Deploy ke production...
   ```

---

## Agent Documentation

See `06-agents/` folder for detailed agent instructions:

- **AGENT_PRODUCT.md** - Product Agent guide
- **AGENT_TECH_LEAD.md** - Tech Lead Agent guide
- **AGENT_DEVELOPER.md** - Developer Agent guide
- **AGENT_QA.md** - QA Agent guide
- **AGENT_DEVOPS.md** - DevOps Agent guide
- **EXAMPLE_SCENARIOS.md** - Real-world examples
- **QUICK_REFERENCE.md** - Cheat sheet

---

## EISK Stack Context

This project uses:
- **E**lysia - Backend framework
- **I**nertia.js - SPA bridge
- **S**velte 5 - Frontend framework
- **K**ysely - SQL query builder

See `AGENTS.md` in project root for coding conventions.
