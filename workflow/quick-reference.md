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

### @DeveloperAgent (3 Modes)

**Mode 1: One-Shot (All Features)**
```
@DeveloperAgent

Implement semua fitur.
```

**Mode 2: Per Feature**
```
@DeveloperAgent

Implement [nama fitur/modul].
```

**Mode 3: Auto-Prioritize**
```
@DeveloperAgent

Saya bingung mulai dari mana.
Kasih list prioritas fitur.
```

### @QAAgent
```
@QAAgent

Test [aplikasi/fitur].
```

atau

```
@QAAgent

Verify fix.
```

### @DevOpsAgent
```
@DevOpsAgent

Deploy ke [staging/production].
```

---

## Developer Agent Modes

| Mode | Use Case | Client Says |
|------|----------|-------------|
| **One-Shot** | Project kecil, mau cepat | "Implement semua fitur" |
| **Per Feature** | Project besar, gradual | "Implement modul Warehouse" |
| **Auto-Prioritize** | Client bingung | "Saya bingung mulai dari mana" |

---

## Workflow Patterns

### New Application

**One-Shot:**
```
1. @ProductAgent     -> Define product
2. @TechLeadAgent    -> Design system
3. @DeveloperAgent   -> Implement ALL
4. @QAAgent          -> Test all
5. @DevOpsAgent      -> Deploy
```

**Per Feature:**
```
1. @ProductAgent     -> Define product
2. @TechLeadAgent    -> Design system
3. @DeveloperAgent   -> Feature 1
4. @QAAgent          -> Test Feature 1
5. Repeat 3-4 for next features
6. @DevOpsAgent      -> Deploy
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
