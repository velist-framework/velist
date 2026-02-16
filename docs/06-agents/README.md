# Multi-Agent Workflow System

Sistem workflow menggunakan multiple specialized agents untuk development yang terstruktur dan scalable.

---

## Agent Available

| Agent | File | Role |
|-------|------|------|
| @ProductAgent | AGENT_PRODUCT.md | Define what to build |
| @TechLeadAgent | AGENT_TECH_LEAD.md | Define how to build |
| @DeveloperAgent | AGENT_DEVELOPER.md | Implement the code |
| @QAAgent | AGENT_QA.md | Review and test |
| @DevOpsAgent | AGENT_DEVOPS.md | Deploy and operate |

---

## Quick Start

### 1. New Feature Development

```
Step 1: @ProductAgent -> Define requirements
Step 2: @TechLeadAgent -> Design architecture
Step 3: @DeveloperAgent -> Implement tasks
Step 4: @QAAgent -> Review and test
Step 5: @DevOpsAgent -> Deploy (optional)
```

### 2. Bug Fix

```
Step 1: @DeveloperAgent -> Fix the bug
Step 2: @QAAgent -> Verify the fix
```

### 3. Refactoring

```
Step 1: @TechLeadAgent -> Plan refactoring
Step 2: @DeveloperAgent -> Execute
Step 3: @QAAgent -> Regression test
```

---

## Document Structure

```
docs/
├── 00-meta/              # Project meta information
├── 01-product/           # Product requirements (PA)
├── 02-engineering/       # Technical specs (TLA)
├── 03-implementation/    # Tasks and progress (DevA)
├── 04-testing/           # Test reports (QAA)
├── 05-deployment/        # Deployment guides (DOA)
└── 06-agents/            # Agent instructions (this folder)
```

---

## How to Call an Agent

Cukup mention agent name di awal instruksi:

```
@ProductAgent

Saya ingin membuat fitur [nama fitur].
...
```

Atau

```
@DeveloperAgent

Implement task [task-name] dari TASKS.md.
...
```

---

## Resources

- **Quick Reference**: QUICK_REFERENCE.md - Cheat sheet
- **Example Scenarios**: EXAMPLE_SCENARIOS.md - Situasi nyata
- **Agent Templates**: AGENT_*.md - Instruksi per agent

---

## Best Practices

1. **Always reference existing docs** - Jangan reinvent the wheel
2. **One agent at a time** - Fokus pada satu responsibility
3. **Update docs after changes** - Keep documentation in sync
4. **Small, iterative tasks** - Lebih baik banyak task kecil dari satu task besar
5. **QA before merge** - Selalu review sebelum merge ke main
