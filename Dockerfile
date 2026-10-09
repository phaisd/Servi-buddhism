# ==============================================================================
# Multi-Stage Production Dockerfile for Vibe Framework & Buddhist Portal
# Built with Next.js 16 (Standalone Output) and Node.js 22 Alpine
# ==============================================================================

# Stage 1: Base Alpine Environment
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Stage 2: Dependencies Installation
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Stage 3: Builder (Generate Prisma & Next.js Build)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js Application in Standalone Mode
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Stage 4: Production Runner (Minimal Attack Surface, Non-Root Execution)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install curl (for healthchecks) and dumb-init (for proper PID 1 signal forwarding)
RUN apk add --no-cache curl dumb-init

# Create non-root group and user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public static files
COPY --from=builder /app/public ./public

# Setup prerender cache directory permissions
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build output and static bundle
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy Entrypoint Script
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh && chown nextjs:nodejs ./docker-entrypoint.sh

# Run as non-privileged user
USER nextjs

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--", "./docker-entrypoint.sh"]
CMD ["node", "server.js"]
