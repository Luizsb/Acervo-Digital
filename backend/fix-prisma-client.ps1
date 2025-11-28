# Script para parar processos Node e regenerar Prisma Client

Write-Host "Parando processos Node.js..." -ForegroundColor Yellow

# Parar todos os processos Node
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Encontrados $($nodeProcesses.Count) processo(s) Node.js. Fechando..." -ForegroundColor Yellow
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    Write-Host "Processos Node.js fechados." -ForegroundColor Green
} else {
    Write-Host "Nenhum processo Node.js encontrado." -ForegroundColor Green
}

# Aguardar um pouco mais para garantir que os arquivos foram liberados
Start-Sleep -Seconds 2

Write-Host "`nSincronizando schema do banco de dados..." -ForegroundColor Yellow
npx prisma db push --accept-data-loss

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao sincronizar schema. Verifique o log acima." -ForegroundColor Red
    exit 1
}

Write-Host "`nRegenerando Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao regenerar Prisma Client. Verifique o log acima." -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Prisma Client regenerado com sucesso!" -ForegroundColor Green
