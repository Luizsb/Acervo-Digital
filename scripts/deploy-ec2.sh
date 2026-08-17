#!/usr/bin/env bash
# Atualiza a instância para o commit mais recente de main e confirma que a API subiu.
# Roda na EC2, chamado pelo GitHub Actions ou manualmente via SSH.
set -euo pipefail

cd "${ACERVO_DIR:-$HOME/Acervo-Digital}"

echo "==> Buscando a versão publicada em main"
git fetch --prune origin main
# reset garante que a instância fique idêntica ao repositório mesmo que algum
# arquivo versionado tenha sido editado à mão. O .env não é versionado e sobrevive.
git reset --hard origin/main
git log -1 --pretty='Commit atual: %h %s'

echo "==> Reconstruindo os containers"
docker compose up -d --build

echo "==> Aguardando a API responder"
for _ in $(seq 1 30); do
  if curl -fsS http://127.0.0.1/health >/dev/null 2>&1; then
    echo "Deploy concluído: a API respondeu em /health."
    # Imagens antigas acumulam alguns GB por deploy e o disco desta instância é pequeno.
    docker image prune -f >/dev/null
    exit 0
  fi
  sleep 5
done

echo "ERRO: a API não respondeu em /health depois do deploy." >&2
docker compose ps >&2
docker compose logs --tail 50 api >&2
exit 1
