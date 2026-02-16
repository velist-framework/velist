# Docker Deployment

Deploy EISK Stack using Docker for consistent environments across development and production.

## Quick Start

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or with Docker
docker build -t eisk-app .
docker run -p 3000:3000 -v $(pwd)/db:/app/db eisk-app
```

## Dockerfile

Create `Dockerfile`:

```dockerfile
# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source and build
COPY . .
RUN bun run build

# Production stage
FROM oven/bun:1-slim AS runner

WORKDIR /app

# Create non-root user
RUN groupadd -r eisk && useradd -r -g eisk eisk

# Copy built assets and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./

# Install production dependencies only
RUN bun install --production --frozen-lockfile

# Create database directory
RUN mkdir -p /app/db && chown -R eisk:eisk /app/db

# Switch to non-root user
USER eisk

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["bun", "src/bootstrap.ts"]
```

## Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - JWT_SECRET=${JWT_SECRET}
      - APP_VERSION=${APP_VERSION:-1.0.0}
    volumes:
      # Persist database
      - ./db:/app/db
      # Persist logs
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
    profiles:
      - with-nginx
```

## Environment Variables

Create `.env.production`:

```bash
NODE_ENV=production
PORT=3000
APP_VERSION=1.0.0

# Security (REQUIRED - change these!)
JWT_SECRET=your-super-secret-256-bit-key-min-32-chars

# Optional
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
TRUST_PROXY=true
LOG_LEVEL=info
```

## Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream eisk_app {
        server app:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        # SSL certificates
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css application/json application/javascript text/xml;

        # Static assets (cached)
        location /dist/ {
            alias /app/dist/;
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }

        # Proxy to EISK app
        location / {
            proxy_pass http://eisk_app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
        }
    }
}
```

## Deployment Steps

### 1. Prepare Server

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Transfer Files

```bash
# From local machine
rsync -avz --exclude node_modules --exclude db --exclude .git . user@server:/opt/eisk-app/
```

### 3. Setup Environment

```bash
# On server
cd /opt/eisk-app

# Generate secure JWT secret
openssl rand -base64 32

# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=3000
APP_VERSION=1.0.0
JWT_SECRET=YOUR_GENERATED_SECRET
EOF
```

### 4. Deploy

```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Run migrations
docker-compose exec app bun run db:migrate

# Seed database (optional)
docker-compose exec app bun run db:seed
```

### 5. SSL Certificates (Let's Encrypt)

```bash
# Install certbot
docker run -it --rm \
  -v $(pwd)/ssl:/etc/letsencrypt \
  -v $(pwd)/certbot-data:/data/letsencrypt \
  certbot/certbot certonly \
  --standalone \
  -d your-domain.com

# Auto-renewal cron job
echo "0 12 * * * docker run -it --rm -v $(pwd)/ssl:/etc/letsencrypt -v $(pwd)/certbot-data:/data/letsencrypt certbot/certbot renew --quiet" | sudo crontab -
```

## Docker Commands Reference

```bash
# Build image
docker build -t eisk-app .

# Run container
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/db:/app/db \
  -e NODE_ENV=production \
  -e JWT_SECRET=secret \
  --name eisk-app \
  eisk-app

# View logs
docker logs -f eisk-app

# Execute commands
docker exec -it eisk-app bun run db:migrate

# Stop and remove
docker stop eisk-app && docker rm eisk-app

# Update deployment
docker pull eisk-app:latest
docker stop eisk-app
docker rm eisk-app
docker run -d ... # same as above
```

## Production Checklist

- [ ] Changed default JWT_SECRET
- [ ] Set NODE_ENV=production
- [ ] Enabled HTTPS with valid SSL
- [ ] Configured firewall (allow 80, 443, block 3000)
- [ ] Database persistence configured
- [ ] Log rotation setup
- [ ] Health checks enabled
- [ ] Monitoring/alerts configured
- [ ] Backup strategy for database
- [ ] Auto-restart enabled

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Check environment
docker-compose exec app env

# Verify database permissions
docker-compose exec app ls -la /app/db
```

### Database issues

```bash
# Reset database (DANGER: data loss)
docker-compose down
docker-compose rm -v
docker-compose up -d
docker-compose exec app bun run db:migrate
```

### Memory issues

```bash
# Check memory usage
docker stats

# Add memory limit to docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

## Multi-Stage Optimization

For smaller images:

```dockerfile
# Final stage with distroless
FROM gcr.io/distroless/cc-debian11

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /root/.bun/bin/bun /usr/local/bin/bun

EXPOSE 3000
CMD ["bun", "src/bootstrap.ts"]
```

This produces ~50MB images vs ~150MB for standard images.
