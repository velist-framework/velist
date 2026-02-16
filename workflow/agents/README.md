# Agents

Template instruksi untuk setiap agent.

## File to Agent Call Mapping

| File | Call As | Description |
|------|---------|-------------|
| `product.md` | `@ProductAgent` | Define requirements |
| `tech-lead.md` | `@TechLeadAgent` | Design system |
| `developer.md` | `@DeveloperAgent` | Implement code |
| `qa.md` | `@QAAgent` | Test & review |
| `devops.md` | `@DevOpsAgent` | Deploy & operate |

## Usage Format

Panggil agent dengan PascalCase tanpa spasi:

```
@ProductAgent

[Deskripsikan task]
```

Jangan gunakan spasi:
- ❌ `@Product Agent`
- ✅ `@ProductAgent`

## Available Agents

| Agent | Purpose |
|-------|---------|
| `@ProductAgent` | Requirements & roadmap |
| `@TechLeadAgent` | Architecture & design |
| `@DeveloperAgent` | Code implementation |
| `@QAAgent` | Testing & review |
| `@DevOpsAgent` | Deployment & ops |
