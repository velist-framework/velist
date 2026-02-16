# Quick Reference - Multi-Agent Workflow

Cheat sheet untuk memanggil agent dengan cepat.

---

## Agent Call Templates

### @ProductAgent
```
@ProductAgent

[Nama Fitur] - [Deskripsi singkat]

User Story:
Sebagai [user], saya ingin [action], agar [benefit]

Acceptance Criteria:
1. [Kriteria 1]
2. [Kriteria 2]
3. [Kriteria 3]

Deliverable:
- PRD.md
- USER_STORIES.md
- ROADMAP.md
```

### @TechLeadAgent
```
@TechLeadAgent

Design: [Nama Fitur]

Referensi:
- PRD: docs/01-product/PRD.md

Deliverable:
- TECH_SPEC.md
- ARCHITECTURE.md
- API_CONTRACT.md
- DATABASE_SCHEMA.md
- TASKS.md
```

### @DeveloperAgent
```
@DeveloperAgent

Implement: [Task Name]

Referensi:
- Task: docs/03-implementation/TASKS.md [Task-XXX]
- Tech Spec: docs/02-engineering/TECH_SPEC.md [Section]

Acceptance Criteria:
- [AC 1]
- [AC 2]

Files:
- [List files yang perlu dibuat/diubah]
```

### @QAAgent
```
@QAAgent

Review: [Nama Fitur/Task]

Scope:
- [Files yang direview]

Acceptance Criteria:
- [AC 1]
- [AC 2]

Deliverable:
- TEST_REPORT.md
```

### @DevOpsAgent
```
@DevOpsAgent

[Deploy/Setup/Infrastructure task]

Environment: [staging/production]
Changes: [Database/API/UI]
Deliverable: [DEPLOYMENT_GUIDE/Config files]
```

---

## Common Patterns

### New Feature (Full Flow)
```
1. @ProductAgent -> [PRD]
2. @TechLeadAgent -> [TECH_SPEC, TASKS]
3. @DeveloperAgent Task-001 -> [Code]
4. @QAAgent -> [Review]
5. @DeveloperAgent (fix if needed)
6. @DevOpsAgent (deploy)
```

### Bug Fix (Fast Track)
```
1. @DeveloperAgent -> [Fix]
2. @QAAgent -> [Verify]
3. @DevOpsAgent (deploy if critical)
```

### Refactoring
```
1. @TechLeadAgent -> [Refactor Plan]
2. @DeveloperAgent -> [Refactored Code]
3. @QAAgent -> [Regression Test]
```

---

## Document Checklist

| Fase | Dokumen | Dibuat Oleh | Template |
|------|---------|-------------|----------|
| Discover | PRD.md | PA | docs/06-agents/AGENT_PRODUCT.md |
| Discover | USER_STORIES.md | PA | docs/06-agents/AGENT_PRODUCT.md |
| Discover | ROADMAP.md | PA | docs/06-agents/AGENT_PRODUCT.md |
| Design | TECH_SPEC.md | TLA | docs/06-agents/AGENT_TECH_LEAD.md |
| Design | ARCHITECTURE.md | TLA | docs/06-agents/AGENT_TECH_LEAD.md |
| Design | API_CONTRACT.md | TLA | docs/06-agents/AGENT_TECH_LEAD.md |
| Design | DATABASE_SCHEMA.md | TLA | docs/06-agents/AGENT_TECH_LEAD.md |
| Design | TASKS.md | TLA | docs/06-agents/AGENT_TECH_LEAD.md |
| Develop | IMPLEMENTATION_LOG.md | DevA | docs/06-agents/AGENT_DEVELOPER.md |
| Develop | CHANGELOG.md | DevA | docs/06-agents/AGENT_DEVELOPER.md |
| Test | TEST_REPORT.md | QAA | docs/06-agents/AGENT_QA.md |
| Deploy | DEPLOYMENT_GUIDE.md | DOA | docs/06-agents/AGENT_DEVOPS.md |
| Deploy | INFRASTRUCTURE.md | DOA | docs/06-agents/AGENT_DEVOPS.md |
| Deploy | RELEASE_NOTES.md | DOA | docs/06-agents/AGENT_DEVOPS.md |

---

## Severity Levels (for QA)

| Level | Action |
|-------|--------|
| Critical | Must fix before merge |
| Major | Must fix before merge |
| Minor | Should fix, can follow-up |
| Suggestion | Optional |

---

## Commit Message Types

| Type | Use Case |
|------|----------|
| feat | New feature |
| fix | Bug fix |
| refactor | Code change, no functional change |
| docs | Documentation only |
| test | Adding tests |
| chore | Maintenance tasks |

---

## Quick Commands

### Database
```bash
bun run db:generate    # Generate migration
bun run db:migrate     # Run migrations
bun run db:seed        # Seed data
bun run db:refresh     # Reset + migrate + seed
```

### Development
```bash
bun run dev            # Full dev mode
bun run dev:server     # Backend only
bun run dev:client     # Frontend only
bun run build          # Production build
bun run typecheck      # Type checking
```

### Testing
```bash
npx playwright test    # E2E tests
```

---

## Emergency Contacts (Metaphorical)

| Issue | Call |
|-------|------|
| Requirement unclear | @ProductAgent |
| Technical block | @TechLeadAgent |
| Implementation stuck | @DeveloperAgent (re-scope) |
| Bug in production | @DeveloperAgent + @DevOpsAgent |
| Deploy failed | @DevOpsAgent |
