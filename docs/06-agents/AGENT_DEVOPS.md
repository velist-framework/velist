# 🤖 DevOps Agent (DOA) — Instruction Template

## Cara Memanggil

```
@DevOpsAgent

[Deskripsikan kebutuhan deployment/infrastructure]

Contoh:
"Setup deployment pipeline untuk production dengan Docker dan GitHub Actions"
```

## Output yang Diharapkan

Agent akan menghasilkan:

1. **docs/05-deployment/DEPLOYMENT_GUIDE.md** — Step-by-step deploy
2. **docs/05-deployment/INFRASTRUCTURE.md** — Setup infrastructure
3. **Configuration files** — Docker, CI/CD scripts
4. **docs/05-deployment/RELEASE_NOTES.md** — Per release (generated)

## Checklist Output

### DEPLOYMENT_GUIDE.md
- [ ] Prerequisites
- [ ] Environment setup
- [ ] Build steps
- [ ] Deployment steps (staging & production)
- [ ] Rollback procedure
- [ ] Troubleshooting guide

### INFRASTRUCTURE.md
- [ ] Architecture diagram
- [ ] Resource requirements
- [ ] Environment variables reference
- [ ] Backup strategy
- [ ] Monitoring setup

### CI/CD Configuration
- [ ] Build pipeline
- [ ] Test automation
- [ ] Deployment automation
- [ ] Environment promotion

## Instruksi untuk Situasi Berbeda

### 1. Initial Setup
```
@DevOpsAgent

Setup production deployment untuk EISK app.

**Requirements:**
- Docker containerization
- GitHub Actions CI/CD
- Deploy ke VPS (Ubuntu)
- SQLite database on persistent volume
- SSL dengan Let's Encrypt
- Reverse proxy (nginx)

**Deliverable:**
1. Dockerfile
2. docker-compose.yml (production)
3. .github/workflows/deploy.yml
4. nginx config
5. DEPLOYMENT_GUIDE.md lengkap
```

### 2. New Release Deploy
```
@DevOpsAgent

Prepare release v1.2.0 untuk deployment.

**Changelog:**
- docs/03-implementation/CHANGELOG.md

**Database:**
- Apakah ada migrations baru?
- Apakah ada data migration?

**Tasks:**
1. Generate RELEASE_NOTES.md untuk v1.2.0
2. Create git tag v1.2.0
3. Update deployment scripts jika perlu
4. Provide rollback plan
```

### 3. Infrastructure Update
```
@DevOpsAgent

Update infrastructure setup.

**Changes needed:**
- Add Redis untuk caching
- Setup log aggregation
- Add health check endpoint

**Deliverable:**
- Updated docker-compose.yml
- Updated deployment scripts
- Updated INFRASTRUCTURE.md
```

## EISK-Specific Deployment Notes

### Dockerfile Pattern
```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build frontend
RUN bun run build

# Production stage
FROM oven/bun:1-slim
WORKDIR /app

# Copy built assets
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./
COPY --from=base /app/src ./src
COPY --from=base /app/db ./db

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "src/bootstrap.ts"]
```

### Docker Compose
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
      - ./db:/app/db  # Persist SQLite
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### GitHub Actions Workflow
```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install
      
      - name: Run tests
        run: bun test
      
      - name: Build
        run: bun run build
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/app
            git pull origin main
            docker-compose down
            docker-compose up -d --build
```

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code review approved
- [ ] Database migrations prepared
- [ ] Environment variables documented
- [ ] Rollback plan ready

### Deployment
- [ ] Backup database
- [ ] Deploy to staging first
- [ ] Smoke test staging
- [ ] Deploy to production
- [ ] Verify health checks
- [ ] Monitor logs for errors

### Post-Deployment
- [ ] Verify all features working
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Notify stakeholders
- [ ] Update RELEASE_NOTES.md

## Rollback Procedure

```markdown
## Emergency Rollback

If deployment fails:

1. **Stop new containers:**
   ```bash
   docker-compose down
   ```

2. **Restore previous version:**
   ```bash
   git checkout [previous-tag]
   docker-compose up -d --build
   ```

3. **Restore database (if needed):**
   ```bash
   cp /backup/db-[timestamp].sqlite ./db/app.sqlite
   ```

4. **Verify rollback:**
   ```bash
   curl http://localhost:3000/health
   ```

5. **Notify team and investigate issue**
```

## Monitoring Setup

```
@DevOpsAgent

Setup monitoring untuk EISK app.

**Requirements:**
- Application health checks
- Error tracking (Sentry)
- Log aggregation
- Performance monitoring

**Deliverable:**
1. Health check endpoint di app
2. Sentry integration
3. Log rotation setup
4. Monitoring dashboard config
```

## Contoh Instruksi Lengkap

```
@DevOpsAgent

Setup complete production deployment untuk EISK stack app.

**Current State:**
- App running locally dengan bun
- SQLite database
- Belum ada containerization

**Target:**
- Docker containerization
- GitHub Actions CI/CD
- Deploy ke VPS (Ubuntu 22.04)
- SSL dengan Let's Encrypt + nginx
- Automated deployment on tag push
- Database backup automation

**Deliverable:**
1. Dockerfile (multi-stage build)
2. docker-compose.prod.yml
3. .github/workflows/deploy.yml
4. nginx.conf (reverse proxy + SSL)
5. scripts/backup.sh (database backup)
6. docs/05-deployment/DEPLOYMENT_GUIDE.md (lengkap)
7. docs/05-deployment/INFRASTRUCTURE.md

**Security requirements:**
- Environment variables managed securely
- No secrets in code
- Non-root user di container
```
