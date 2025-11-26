# Script para corrigir Prisma Client corrompido
# Remove o client antigo e regenera do zero

Write-Host "Corrigindo Prisma Client..." -ForegroundColor Yellow
Write-Host ""

# 1. Parar processos Node
Write-Host "[1/4] Verificando processos Node..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Encontrados processos Node. Fechando..." -ForegroundColor Gray
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   Processos fechados." -ForegroundColor Green
} else {
    Write-Host "   Nenhum processo Node encontrado." -ForegroundColor Green
}

# 2. Remover Prisma Client antigo
Write-Host ""
Write-Host "[2/4] Removendo Prisma Client antigo..." -ForegroundColor Yellow
$prismaClientPath = "node_modules\.prisma"
if (Test-Path $prismaClientPath) {
    Remove-Item $prismaClientPath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   Prisma Client removido." -ForegroundColor Green
} else {
    Write-Host "   Prisma Client nao encontrado (ok)." -ForegroundColor Gray
}

# 3. Remover locks do SQLite
Write-Host ""
Write-Host "[3/4] Removendo locks do SQLite..." -ForegroundColor Yellow
$lockPath = "prisma\dev.db-wal"
$shmPath = "prisma\dev.db-shm"
if (Test-Path $lockPath) {
    Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
    Write-Host "   Arquivo WAL removido." -ForegroundColor Green
}
if (Test-Path $shmPath) {
    Remove-Item $shmPath -Force -ErrorAction SilentlyContinue
    Write-Host "   Arquivo SHM removido." -ForegroundColor Green
}

# 4. Regenerar Prisma Client
Write-Host ""
Write-Host "[4/4] Regenerando Prisma Client..." -ForegroundColor Yellow
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"

try {
    npx prisma generate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "SUCESSO: Prisma Client regenerado com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Agora voce pode:" -ForegroundColor Cyan
        Write-Host "   1. Iniciar o servidor: npm run dev" -ForegroundColor Gray
        Write-Host "   2. Abrir Prisma Studio: npm run db:studio" -ForegroundColor Gray
    } else {
        throw "Prisma generate falhou"
    }
} catch {
    Write-Host ""
    Write-Host "ERRO: Falha ao regenerar Prisma Client" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Tente manualmente:" -ForegroundColor Yellow
    Write-Host "   npx prisma generate" -ForegroundColor Gray
    exit 1
}

$env:NODE_TLS_REJECT_UNAUTHORIZED = "1"

