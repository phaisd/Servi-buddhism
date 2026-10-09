#!/bin/sh
set -e

echo "==> [Vibe Framework] Production Container Initializing..."

# Run Prisma schema migrations if DATABASE_URL is present
if [ -n "$DATABASE_URL" ]; then
  echo "==> [Database] Deploying Prisma database migrations..."
  prisma migrate deploy || npx prisma migrate deploy || echo "==> [Warning] Database migration failed or already applied"
fi

echo "==> [App] Starting Next.js Standalone Production Server on port ${PORT:-3000}..."
exec "$@"
