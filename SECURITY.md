# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Disclose Publicly

Please **DO NOT** create a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Send security reports to: **security@eisk-stack.dev**

Include the following information:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)
- Your contact information for follow-up

### 3. Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 5 business days
- **Resolution plan**: Within 10 business days
- **Fix release**: Depends on severity (see below)

### 4. Severity Classification

| Severity | Response Time | Release Time | Examples |
|----------|--------------|--------------|----------|
| Critical | 24 hours | 7 days | RCE, SQL injection, auth bypass |
| High | 48 hours | 14 days | XSS, CSRF, data exposure |
| Medium | 5 days | 30 days | DoS, information disclosure |
| Low | 10 days | Next release | Best practice violations |

## Security Best Practices

When using EISK Stack in production:

### 1. Environment Variables

```bash
# Required
NODE_ENV=production
JWT_SECRET=your-256-bit-secret-minimum-32-chars

# Optional but recommended
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
TRUST_PROXY=true
```

### 2. JWT Secret

Generate a strong JWT secret:

```bash
# Generate 256-bit secret
openssl rand -base64 32
```

### 3. HTTPS Only

Always use HTTPS in production:

```typescript
// bootstrap.ts
if (process.env.NODE_ENV === 'production') {
  app.use(helmet())
}
```

### 4. Rate Limiting

Implement rate limiting for auth endpoints:

```typescript
import { rateLimit } from 'elysia-rate-limit'

app.use(rateLimit({
  max: 5,
  window: 60000, // 1 minute
  path: ['/auth/login', '/auth/register']
}))
```

### 5. Input Validation

Always validate input with TypeBox:

```typescript
.post('/', async (ctx) => {
  // Validation happens automatically via TypeBox
  const { body } = ctx
}, {
  body: t.Object({
    email: t.String({ format: 'email' }),
    password: t.String({ minLength: 8 })
  })
})
```

### 6. SQL Injection Prevention

Kysely automatically parameterizes queries. Never concatenate SQL:

```typescript
// ✅ Safe - Kysely parameterizes this
await db.selectFrom('users')
  .where('email', '=', userInput)
  .execute()

// ❌ Dangerous - Never do this
await db.executeRaw(`SELECT * FROM users WHERE email = '${userInput}'`)
```

### 7. XSS Prevention

The custom Inertia plugin escapes HTML automatically:

```typescript
// In src/inertia/plugin.ts
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
```

### 8. CSRF Protection

Inertia.js includes CSRF protection via XSRF-TOKEN cookie.

### 9. Dependency Updates

Regularly update dependencies:

```bash
bun update
bun audit
```

## Security Features

### Current Implementation

| Feature | Status | Notes |
|---------|--------|-------|
| Password hashing | ✅ | Bun.password with bcrypt |
| JWT tokens | ✅ | HTTP-only cookies |
| XSS protection | ✅ | HTML escaping in Inertia |
| CSRF protection | ✅ | Via Inertia.js |
| SQL injection prevention | ✅ | Kysely parameterized queries |
| Secure headers | ⚠️ | Helmet available but disabled in dev |

### Planned

| Feature | Priority | ETA |
|---------|----------|-----|
| Rate limiting | High | v0.2.0 |
| Request signing | Medium | v0.3.0 |
| Audit logging | Medium | v0.3.0 |
| 2FA support | Low | v1.0.0 |

## Known Limitations

1. **SQLite**: Not suitable for high-concurrency writes
2. **File uploads**: No built-in virus scanning
3. **Session storage**: In-memory only (SQLite), consider Redis for scale

## Security Checklist

Before deploying to production:

- [ ] Changed default JWT_SECRET
- [ ] Set NODE_ENV=production
- [ ] Enabled HTTPS
- [ ] Configured secure cookies
- [ ] Added rate limiting
- [ ] Enabled security headers (helmet)
- [ ] Removed debug logging
- [ ] Reviewed CORS settings
- [ ] Database backups configured
- [ ] Monitoring/alerting setup

## Acknowledgments

We thank the following security researchers who have responsibly disclosed vulnerabilities:

*None yet - be the first!*

## Contact

For security concerns:
- Email: security@eisk-stack.dev
- GPG Key: [Download]() (fingerprint: TBD)

For general questions, use GitHub Issues or Discussions.
