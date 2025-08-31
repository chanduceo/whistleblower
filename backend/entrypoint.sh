#!/usr/bin/env sh
set -e

# Wait for Postgres to be available
# uses psql (install in runtime if needed) — fallback simple wait loop
host=$(echo "${DATABASE_URL}" | awk -F[/:@] '{print $5}')
port=$(echo "${DATABASE_URL}" | awk -F[/:@] '{print $6}')

# Simple wait loop (30s timeout)
count=0
until nc -z "$host" "$port" >/dev/null 2>&1 || [ $count -ge 30 ]; do
  echo "Waiting for postgres ${host}:${port}..."
  count=$((count + 1))
  sleep 1
done

# Generate prisma client (if not present)
if [ ! -d "./node_modules/.prisma" ]; then
  echo "Running prisma generate..."
  npx prisma generate || true
fi

# Run migrations (safe) and seed
echo "Running prisma migrate deploy (if migrations exist)..."
npx prisma migrate deploy || echo "migrate deploy failed or no migrations (dev mode?)"

# Run optional seed if environment variable set
if [ "${PRISMA_SEED_ON_START}" = "1" ]; then
  echo "Running seed..."
  node --loader ts-node/esm prisma/seed.ts || true
fi

# Start the server
echo "Starting app..."
node dist/index.js