#!/usr/bin/env bash
# Recuperação de emergência: site em HTTP puro, sem Caddy/HTTPS e sem rebuild.
# Use quando a instância estiver lenta ou o deploy tiver derrubado a web.
set -euo pipefail

cd "${ACERVO_DIR:-$HOME/Acervo-Digital}"

echo "==> Recuperação HTTP (sem HTTPS, sem importar planilha de novo)"

if docker compose ps --services --status running 2>/dev/null | grep -qx caddy; then
  echo "==> Parando o Caddy para liberar as portas 80/443"
  docker compose --profile https stop caddy
  docker compose rm -f caddy
fi

set_env() {
  key="$1"
  value="$2"
  if grep -qE "^${key}=" .env 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${value}|" .env
  else
    printf '%s=%s\n' "$key" "$value" >> .env
  fi
}

# Volta ao layout simples: nginx na porta 80, sem perfil https.
sed -i '/^COMPOSE_PROFILES=/d' .env
sed -i '/^ACERVO_HOSTNAME=/d' .env

set_env WEB_BIND 0.0.0.0
set_env WEB_PORT 80
set_env SKIP_SEED true
set_env CORS_ORIGIN http://13.217.4.132
set_env TRUST_PROXY 1

echo "==> Subindo postgres, api e web (sem rebuild)"
docker compose up -d --no-build

echo "==> Aguardando a API"
for _ in $(seq 1 40); do
  if curl -fsS http://127.0.0.1:3001/health >/dev/null 2>&1; then
    break
  fi
  sleep 3
done

echo "==> Aguardando o site na porta 80"
for _ in $(seq 1 20); do
  if curl -fsS http://127.0.0.1/health >/dev/null 2>&1; then
    echo "Recuperado: http://13.217.4.132"
    docker compose ps
    exit 0
  fi
  sleep 3
done

echo "ERRO: o site não respondeu." >&2
docker compose ps >&2
docker compose logs --tail 40 api >&2
exit 1
