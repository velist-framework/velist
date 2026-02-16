# Quick Reference

Cheat sheet untuk multi-agent workflow.

---

## Agent Calls (Minimal)

### @ProductAgent
```
@ProductAgent

Saya mau [deskripsi aplikasi/fitur].
Kebutuhan: [point 1], [point 2], [point 3].
User: [siapa yang pakai]
Timeline: [kapan butuh]
```

### @TechLeadAgent
```
@TechLeadAgent

Lanjutkan dari Product Agent.
```

atau

```
@TechLeadAgent

Desain teknis untuk [fitur].
```

### @DeveloperAgent
```
@DeveloperAgent

Sprint X: [nama modul].
```

atau

```
@DeveloperAgent

Implement [fitur].
```

atau

```
@DeveloperAgent

Fix bug: [deskripsi bug].
```

### @QAAgent
```
@QAAgent

Test [sprint/fitur].
```

atau

```
@QAAgent

Verify fix.
```

### @DevOpsAgent
```
@DevOpsAgent

Setup project.
```

atau

```
@DevOpsAgent

Deploy ke [staging/production].
```

---

## Workflow Patterns

### New Application
```
1. @ProductAgent     -> Define product
2. @TechLeadAgent    -> Design system
3. @DevOpsAgent      -> Setup project
4. @DeveloperAgent   -> Implement sprint 1
5. @QAAgent          -> Test sprint 1
6. Repeat 4-5 for next sprints
7. @DevOpsAgent      -> Deploy production
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

## Document Locations

| Type | Location |
|------|----------|
| Product docs | `workflow/outputs/01-product/` |
| Engineering | `workflow/outputs/02-engineering/` |
| Tasks | `workflow/outputs/03-tasks/` |
| Reports | `workflow/outputs/04-reports/` |

---

## Commit Types

| Type | Use |
|------|-----|
| feat | New feature |
| fix | Bug fix |
| refactor | Code improvement |
| docs | Documentation |
| test | Tests |
| chore | Maintenance |

---

## Severity (QA)

| Level | Action |
|-------|--------|
| Critical | Must fix |
| Major | Must fix |
| Minor | Should fix |
| Suggestion | Optional |
