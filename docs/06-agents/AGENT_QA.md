# 🤖 QA Agent (QAA) — Instruction Template

## Cara Memanggil

```
@QAAgent

Review PR untuk fitur: [Nama Fitur]

**PR:** [Link/Deskripsi perubahan]
**Task:** Task-XXX
**User Story:** US-XXX
```

## Output yang Diharapkan

Agent akan menghasilkan:

1. **docs/04-testing/TEST_REPORT.md** — Hasil testing
2. **Review comments** pada kode (jika ada issue)
3. **Approval/Rejection** dengan alasan

## Checklist Review

### 1. Code Review

#### Readability & Style
- [ ] Kode mudah dibaca
- [ ] Naming conventions sesuai project
- [ ] Tidak ada magic numbers/strings
- [ ] Function/class tidak terlalu besar (SRP)

#### EISK Patterns
- [ ] Repository pattern digunakan dengan benar
- [ ] Service layer ada business logic (bukan hanya proxy)
- [ ] API routes menggunakan proper Elysia patterns
- [ ] Svelte pages menggunakan runes ($props, $state)
- [ ] Inline Tailwind classes (no unnecessary components)

#### Type Safety
- [ ] No `any` types
- [ ] Props interfaces didefinisikan
- [ ] Return types explicit (untuk functions penting)

#### Error Handling
- [ ] Async operations ada try-catch
- [ ] Error messages user-friendly
- [ ] Edge cases ditangani

#### Security
- [ ] Input validation dengan TypeBox
- [ ] No SQL injection vulnerability
- [ ] No XSS vulnerability
- [ ] Auth check di protected routes
- [ ] No sensitive data di response

### 2. Functional Testing

#### Acceptance Criteria Verification
```
US-XXX: [Judul User Story]

AC 1: [Deskripsi AC]
Status: ✅ PASS / ❌ FAIL
Notes: [Catatan]

AC 2: [Deskripsi AC]
Status: ✅ PASS / ❌ FAIL
Notes: [Catatan]
```

#### Edge Cases
- [ ] Empty state (no data)
- [ ] Boundary values (min/max input)
- [ ] Concurrent operations
- [ ] Network failure simulation
- [ ] Invalid input variations

### 3. Integration Testing
- [ ] Feature works dengan existing features
- [ ] Database migrations berjalan smooth
- [ ] API contracts honored

### 4. Performance Check
- [ ] No N+1 queries
- [ ] Database queries optimized (indexes digunakan)
- [ ] UI responsive (no blocking operations)

## Test Report Template

```markdown
# Test Report: [Feature Name]

**Date:** YYYY-MM-DD
**Tester:** QA Agent
**PR:** [Reference]

## Summary
- **Status:** APPROVED / CHANGES REQUESTED / REJECTED
- **Issues Found:** X
- **Critical:** X
- **Major:** X
- **Minor:** X

## Code Review

### Findings
| # | Location | Issue | Severity | Suggestion |
|---|----------|-------|----------|------------|
| 1 | file.ts:42 | ... | Critical | ... |

## Functional Testing

### Acceptance Criteria
- AC 1: ✅ PASS
- AC 2: ❌ FAIL - [Explanation]

### Edge Cases Tested
- [List edge cases dengan status]

## Recommendations
1. [Recommendation 1]
2. [Recommendation 2]
```

## Instruksi untuk Situasi Berbeda

### Routine PR Review
```
@QAAgent

Review PR untuk Task-010: Implement user profile page.

**Files changed:**
- src/features/profile/api.ts
- src/features/profile/service.ts
- src/features/profile/pages/Index.svelte
- src/features/profile/pages/Edit.svelte

**Acceptance Criteria:**
1. User bisa melihat profile mereka
2. User bisa edit profile (name, email)
3. Validasi email format
4. Success/error feedback

Lakukan code review dan functional testing.
```

### Bug Fix Verification
```
@QAAgent

Verify fix untuk bug: [Deskripsi bug]

**Bug:** [Detail]
**Fix:** [Apa yang diubah]
**Expected:** [Behavior yang benar]

Test:
1. Reproduce scenario yang menyebabkan bug
2. Verify bug tidak lagi terjadi
3. Test edge cases terkait
4. Regression test (pastikan tidak break fitur lain)
```

### Security Audit
```
@QAAgent

Security review untuk fitur: [Nama fitur]

**Focus:**
- Input validation
- Auth/authorization checks
- Data exposure
- Injection vulnerabilities

Lakukan security-focused code review.
```

## Severity Levels

| Level | Definition | Example | Action Required |
|-------|------------|---------|-----------------|
| **Critical** | Security risk, data loss, system crash | SQL injection, delete wrong data | Must fix before merge |
| **Major** | Feature not working as spec | AC not met, error not handled | Must fix before merge |
| **Minor** | Code quality, minor UX issue | Naming unclear, redundant code | Should fix, can be follow-up |
| **Suggestion** | Improvement idea | Refactor opportunity | Optional |

## Contoh Output Review

```
@QAAgent Review Result:

## Status: CHANGES REQUESTED ⚠️

### Critical Issues
1. **src/features/invoices/api.ts:45** — SQL Injection risk
   - Query menggunakan string concatenation
   - Fix: Gunakan parameterized query dari Kysely

### Major Issues
2. **Missing error handling** — Try-catch tidak ada di database calls
   - Jika DB error, user dapat stack trace
   - Fix: Wrap dengan try-catch, return user-friendly error

### Minor Issues
3. **Variable naming** — `x` di line 23 sebaiknya `invoiceCount`

### Suggestions
4. Consider extracting validation logic ke helper function

### AC Verification
- ✅ AC 1: User bisa melihat list invoice
- ✅ AC 2: User bisa create invoice
- ❌ AC 3: Validation error messages — masih generic, belum spesifik per field

Please address critical & major issues before merge.
```
