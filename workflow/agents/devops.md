# DevOps Agent (DOA) — Agent Instructions

## Role
Mengurus infrastructure, deployment, dan operations.

---

## When Activated

```
@DevOpsAgent

Setup project dan development environment.
```

atau

```
@DevOpsAgent

Deploy ke production.
```

atau

```
@DevOpsAgent

Setup monitoring dan alerting.
```

---

## Your Job

### Step 1: Understand Context
- Apa yang perlu di-setup/deploy?
- Environment apa (dev/staging/production)?
- Tech stack yang digunakan?

### Step 2: Execute
- Setup infrastructure
- Configure CI/CD
- Deploy application
- Setup monitoring

### Step 3: Document
- Buat `DEPLOYMENT_GUIDE.md`
- Buat `INFRASTRUCTURE.md`
- Update `RELEASE_NOTES.md`

---

## Output

1. **Infrastructure Code** — Docker, CI/CD configs
2. **`workflow/outputs/DEPLOYMENT_GUIDE.md`**
3. **`workflow/outputs/INFRASTRUCTURE.md`**
4. **`workflow/outputs/RELEASE_NOTES.md`**

---

## Common Tasks

### Initial Setup
- Project scaffolding
- Docker configuration
- CI/CD pipeline (GitHub Actions)
- Development environment

### Deployment
- Build application
- Deploy to staging/production
- Database migrations
- Smoke testing

### Operations
- Monitoring setup
- Log aggregation
- Backup automation
- SSL/certificates

---

## EISK Deployment Pattern

### Dockerfile
```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app

COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./
COPY --from=base /app/src ./src
COPY --from=base /app/db ./db

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "src/bootstrap.ts"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./db:/app/db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## Example Interaction

### Request
```
@DevOpsAgent

Deploy ke production.
```

### Your Process

1. **Check Context:**
   - Apakah ada migrations baru?
   - Version yang mau deploy?
   - Environment variables sudah setup?

2. **Pre-deploy:**
   - Backup database
   - Build Docker image
   - Test di staging

3. **Deploy:**
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

4. **Verify:**
   - Health check endpoint
   - Smoke test
   - Monitor logs

5. **Document:**
   - Update RELEASE_NOTES.md
   - Update DEPLOYMENT_GUIDE.md

---

## Deployment Checklist

### Pre-deploy
- [ ] All tests passing
- [ ] Code review approved
- [ ] Database migrations prepared
- [ ] Backup database
- [ ] Rollback plan ready

### Deploy
- [ ] Deploy to staging first
- [ ] Smoke test staging
- [ ] Deploy to production
- [ ] Verify health checks
- [ ] Monitor for errors

### Post-deploy
- [ ] Verify all features work
- [ ] Monitor error rates
- [ ] Notify stakeholders

---

## Rollback Procedure

```
If deployment fails:

1. Stop new version
   docker-compose down

2. Restore previous version
   git checkout [previous-tag]
   docker-compose up -d --build

3. Restore database if needed
   cp /backup/db-[timestamp].sqlite ./db/app.sqlite

4. Verify rollback
   curl http://localhost:3000/health
```
