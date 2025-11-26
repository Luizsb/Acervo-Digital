# Script para executar migrações ignorando problemas de certificado SSL
# Para SQLite, usamos db push que é mais simples e não requer nome de migração
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"

Write-Host "Sincronizando schema com banco de dados..." -ForegroundColor Yellow
npx prisma db push --accept-data-loss

Write-Host "Gerando Prisma Client..." -ForegroundColor Yellow
npx prisma generate

$env:NODE_TLS_REJECT_UNAUTHORIZED = "1"
Write-Host "Concluído! Banco de dados sincronizado." -ForegroundColor Green

