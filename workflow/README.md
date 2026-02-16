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

## Quick Start

### New Application
```
1. @ProductAgent     -> Define product
2. @TechLeadAgent    -> Design system
3. @DeveloperAgent   -> Implement per sprint
4. @QAAgent          -> Test per sprint
5. @DevOpsAgent      -> Deploy production
```

### New Feature
```
1. @ProductAgent     -> Define feature
2. @TechLeadAgent    -> Design feature
3. @DeveloperAgent   -> Implement
4. @QAAgent          -> Test
```

### Bug Fix
```
1. @DeveloperAgent   -> Fix
2. @QAAgent          -> Verify
```

---

## Resources

- [**examples.md**](examples.md) - Real-world usage scenarios
- [**quick-reference.md**](quick-reference.md) - Cheat sheet for agents

---

## Project Setup (Already Done)

This starter project includes:
- ✅ EISK stack (Elysia, Inertia, Svelte, Kysely)
- ✅ Database (SQLite) with migrations
- ✅ Authentication system
- ✅ Development environment
- ✅ Build configuration

Just run:
```bash
bun install
bun run db:migrate
bun run dev
```

Then start with agents.

---

## Workflow Outputs

Agent outputs are stored in `outputs/`:

```
outputs/
├── 01-product/           # @ProductAgent
├── 02-engineering/       # @TechLeadAgent
├── 03-tasks/             # Task breakdowns
└── 04-reports/           # @QAAgent
```
