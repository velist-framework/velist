# 🤖 Product Agent (PA) — Instruction Template

## Cara Memanggil

```
@ProductAgent

[Deskripsikan kebutuhan/ide fitur di sini]

Contoh:
"Saya ingin membuat fitur subscription/billing untuk SaaS. User bisa 
subscribe ke plan (Free, Pro, Enterprise), manage payment method, 
dan melihat invoice history."
```

## Output yang Diharapkan

Agent akan menghasilkan:

1. **docs/01-product/PRD.md** — Product Requirements Document
2. **docs/01-product/USER_STORIES.md** — Daftar user stories
3. **docs/01-product/ROADMAP.md** — Prioritisasi & timeline

## Checklist Output

- [ ] PRD lengkap dengan:
  - [ ] Problem Statement
  - [ ] Target Users / Personas
  - [ ] Goals & Success Metrics
  - [ ] Feature List (dengan prioritas MoSCoW)
  - [ ] Non-Functional Requirements
  
- [ ] User Stories mengikuti format:
  ```
  ## US-XXX: [Judul]
  **As a** [user type]
  **I want** [action]
  **So that** [benefit]
  
  **Acceptance Criteria:**
  1. [Kriteria 1]
  2. [Kriteria 2]
  
  **Priority:** Must/Should/Could/Won't
  **Estimate:** [XS/S/M/L/XL]
  ```

- [ ] ROADMAP dengan milestone jelas

## Constraints untuk EISK Stack

- Gunakan terminology yang sesuai: "page" untuk UI, "API" untuk endpoint
- Pertimbangkan autentikasi yang sudah ada (JWT-based)
- Perhatikan SQLite limitations (tidak semua fitur SQL advanced tersedia)

## Contoh Instruksi Lengkap

```
@ProductAgent

Saya ingin menambahkan fitur "Team/Workspace" ke aplikasi ini.

**Konteks:**
- Saat ini aplikasi single-user per account
- User ingin bisa invite member ke workspace
- Setiap workspace punya resource terpisah

**Yang perlu didefinisikan:**
1. Role & permission system (Owner, Admin, Member)
2. Invite flow (email invitation)
3. Resource isolation (data hanya visible dalam workspace)
4. Billing implications (per-user vs per-workspace)

**Deliverable:**
- PRD lengkap
- User Stories dengan AC yang jelas
- ROADMAP dengan 3 fase rollout
```
