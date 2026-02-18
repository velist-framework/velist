# Stage 1: Build
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build frontend
RUN bun run build

# Stage 2: Production
FROM oven/bun:latest AS production

WORKDIR /app

# Copy built assets and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/db ./db

# Create directories
RUN mkdir -p db storage/backups

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check (using Bun built-in fetch)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

# Start
CMD ["bun", "src/bootstrap.ts"]
