# Quick Reference

Cheat sheet untuk multi-agent workflow.

---

## Automatic Handoff Flow

```
Client: @ProductAgent Saya mau aplikasi X...
    ↓ (auto)
PA: Selesai → TLA
    ↓ (auto setelah approve)
TLA: Selesai → DevA
    ↓ (auto)
DevA: Selesai → QAA
    ↓ (auto setelah approve)
QAA: Selesai → DOA
    ↓
DOA: Deployed! 🎉
```

---

## Agent Calls

### Start New Project
```
@ProductAgent

Saya mau [aplikasi].
Kebutuhan: [1], [2], [3].
User: [siapa]
Timeline: [kapan]
```

### Manual Override
```
@ProductAgent

Saya mau aplikasi X.
TAPI: Jangan auto-lanjut, saya mau review tiap tahap.
```

### Fix Bug
```
@DeveloperAgent

Fix: [deskripsi bug]
```

---

## Approval Points

| Tahap | Auto-Approve? | Client Action |
|-------|---------------|---------------|
| PA → TLA | ✅ Yes | None |
| TLA → DevA | ⚙️ Optional | Approve desain (atau auto) |
| DevA → QAA | ✅ Yes | None |
| QAA → DOA | ⚙️ Optional | Approve deploy (atau auto) |

---

## Developer Modes

| Mode | Trigger | When to Use |
|------|---------|-------------|
| **One-Shot** | Default | Small project, quick result |
| **Per Feature** | Request | Large project, gradual |
| **Auto-Prioritize** | "Bingung mulai dari mana" | Non-technical client |

---

## Document Locations

```
workflow/outputs/
├── 01-product/       # PA output
├── 02-engineering/   # TLA output
├── 03-tasks/         # Tasks
└── 04-reports/       # QA output
```

---

## Commit Types

| Type | Use |
|------|-----|
| feat | New feature |
| fix | Bug fix |
| refactor | Code improvement |

---

## Severity (QA)

| Level | Blocks Deploy? |
|-------|----------------|
| Critical | ✅ Yes |
| Major | ✅ Yes |
| Minor | ❌ No |
