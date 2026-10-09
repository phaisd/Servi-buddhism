#!/bin/sh
set -e

echo "==> [Vibe Framework] Production Container Initializing..."

# Run Prisma schema migrations if DATABASE_URL is present
if [ -n "$DATABASE_URL" ]; then
  echo "==> [Database] Deploying Prisma database migrations..."
  if [ -f "./node_modules/prisma/build/index.js" ]; then
    node ./node_modules/prisma/build/index.js migrate deploy || echo "==> [Warning] Database migration failed or already applied"
  else
    echo "==> [Notice] Prisma CLI not bundled in runner stage, skipping automatic migration"
  fi
fi

echo "==> [App] Starting Next.js Standalone Production Server on port ${PORT:-3000}..."
exec "$@"
