# ==============================================================================
# Production Dockerfile for Vibe Framework & Buddhist Portal
# Built with Next.js 16 (Standalone Output) and Node.js 22 Alpine
# Minimal attack surface, zero extraneous dev tooling, non-root execution
# ==============================================================================

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install curl (for healthchecks), openssl (for prisma runtime), and dumb-init (signal forwarding)
RUN apk add --no-cache curl openssl dumb-init libc6-compat

# Create non-root group and user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public static files
COPY public ./public

# Setup prerender cache directory permissions
RUN mkdir -p .next && chown -R nextjs:nodejs /app

# Copy standalone build output and static bundle
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static
COPY --chown=nextjs:nodejs prisma ./prisma

# Run as non-privileged user
USER nextjs

EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
