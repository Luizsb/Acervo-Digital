# Script para criar migrações versionadas (para produção)
# Usa nome automático baseado em timestamp para evitar prompt interativo
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$migrationName = "migration_$timestamp"

Write-Host "Criando migração: $migrationName" -ForegroundColor Yellow
npx prisma migrate dev --name $migrationName

Write-Host "Gerando Prisma Client..." -ForegroundColor Yellow
npx prisma generate

$env:NODE_TLS_REJECT_UNAUTHORIZED = "1"
Write-Host "Migração versionada criada com sucesso!" -ForegroundColor Green

