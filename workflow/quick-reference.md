# Quick Reference

Cheat sheet untuk multi-agent workflow.

---

## Workflow dengan Mandatory Review

```
Client: @ProductAgent Saya mau aplikasi X...
    ↓
PA: Selesai - REVIEW REQUIRED
    ↓ Client: "Approve"
TLA: Selesai - REVIEW REQUIRED
    ↓ Client: "Approve"
DevA: Selesai - REVIEW REQUIRED
    ↓ Client: "Approve"
QAA: Selesai - REVIEW REQUIRED
    ↓ Client: "Approve"
DOA: Deployed! 🎉
```

---

## Agent Calls

### Start New Project
```
@ProductAgent

Saya mau [aplikasi].
Kebutuhan: [1], [2], [3].
```

### Approve & Continue
```
Client: "Approve" atau "Lanjutkan"
```

### Request Changes
```
Client: "Revisi: [detail perubahan]"
```

### Fix Bug
```
@DeveloperAgent

Fix: [deskripsi bug]
```

---

## Review Checklist per Tahap

| Tahap | Client Check |
|-------|--------------|
| **PRD** | Fitur lengkap? Timeline ok? |
| **Tech Design** | Stack sesuai? Architecture scalable? |
| **Implementation** | Fitur berfungsi? UI acceptable? |
| **QA** | All tests pass? Ready for production? |

---

## Developer Modes

| Mode | When to Use |
|------|-------------|
| **One-Shot** | Small project, quick result |
| **Per Feature** | Large project, gradual review |
| **Auto-Prioritize** | Non-technical client |

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

## ⚠️ Important Rules

1. **Every stage has mandatory review**
2. **No auto-skip without client approval**
3. **Client can approve or request changes**
4. **Fast track available if explicitly requested**
