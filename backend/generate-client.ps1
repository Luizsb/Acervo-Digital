# Script simples para gerar apenas o Prisma Client
# Use este script quando o schema ja esta sincronizado e so precisa regenerar o client

Write-Host "Gerando Prisma Client..." -ForegroundColor Yellow
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"

npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCESSO: Prisma Client gerado com sucesso!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ERRO: Falha ao gerar Prisma Client" -ForegroundColor Red
    Write-Host "Certifique-se de que:" -ForegroundColor Yellow
    Write-Host "   1. Nenhum servidor esta rodando" -ForegroundColor Gray
    Write-Host "   2. Prisma Studio esta fechado" -ForegroundColor Gray
    exit 1
}

$env:NODE_TLS_REJECT_UNAUTHORIZED = "1"

