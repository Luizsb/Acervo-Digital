#!/bin/sh
set -e

echo "Aplicando migrações..."
npx prisma migrate deploy

if [ "${SKIP_SEED:-false}" != "true" ]; then
  echo "Carregando dados iniciais..."
  node dist/scripts/seed-database.js
fi

echo "Iniciando API..."
exec node dist/index.js
