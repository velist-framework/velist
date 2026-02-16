# Development Workflow

Multi-agent workflow system untuk development yang terstruktur dan scalable.

---

## Agents

| Agent | File | Role |
|-------|------|------|
| @ProductAgent | [`agents/product.md`](agents/product.md) | Define what to build |
| @TechLeadAgent | [`agents/tech-lead.md`](agents/tech-lead.md) | Define how to build |
| @DeveloperAgent | [`agents/developer.md`](agents/developer.md) | Implement the code |
| @QAAgent | [`agents/qa.md`](agents/qa.md) | Review and test |
| @DevOpsAgent | [`agents/devops.md`](agents/devops.md) | Deploy and operate |

---

## Workflow Outputs

Hasil kerja agents disimpan di `outputs/`:

```
outputs/
├── 01-product/           # @ProductAgent output
│   ├── PRD.md
│   ├── USER_STORIES.md
│   └── ROADMAP.md
├── 02-engineering/       # @TechLeadAgent output
│   ├── TECH_SPEC.md
│   ├── ARCHITECTURE.md
│   ├── API_CONTRACT.md
│   └── DATABASE_SCHEMA.md
├── 03-tasks/             # Task management
│   └── TASKS.md
└── 04-reports/           # @QAAgent output
    └── TEST_REPORT.md
```

---

## Quick Start

### 1. New Feature
```
@ProductAgent -> @TechLeadAgent -> @DeveloperAgent -> @QAAgent -> @DevOpsAgent
```

### 2. Bug Fix
```
@DeveloperAgent -> @QAAgent
```

### 3. Refactoring
```
@TechLeadAgent -> @DeveloperAgent -> @QAAgent
```

---

## Resources

- [**examples.md**](examples.md) - Real-world usage scenarios
- [**quick-reference.md**](quick-reference.md) - Cheat sheet for agents

---

## EISK Stack Context

This project uses: **E**lysia + **I**nertia + **S**velte + **K**ysely

See `AGENTS.md` in project root for coding conventions.
