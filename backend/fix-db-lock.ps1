# Script para resolver problema de "database is locked"
# Fecha processos que podem estar usando o banco e regenera o Prisma Client

Write-Host "Verificando processos que podem estar usando o banco..." -ForegroundColor Yellow

# Tentar encontrar processos Node que podem estar usando o banco
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "ATENCAO: Encontrados processos Node rodando:" -ForegroundColor Yellow
    $nodeProcesses | ForEach-Object {
        Write-Host "   - PID: $($_.Id) - $($_.ProcessName)" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "Dica: Feche o servidor (Ctrl+C) ou Prisma Studio antes de continuar" -ForegroundColor Cyan
    Write-Host ""
    $continue = Read-Host "Deseja fechar TODOS os processos Node automaticamente? (S/N)"
    if ($continue -eq "S" -or $continue -eq "s") {
        Write-Host "Fechando processos Node..." -ForegroundColor Yellow
        $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "Processos fechados." -ForegroundColor Green
    } else {
        Write-Host "Operacao cancelada. Feche os processos manualmente e tente novamente." -ForegroundColor Yellow
        exit
    }
}

# Verificar se o arquivo de lock existe e tentar remove-lo
$dbPath = "prisma\dev.db"
$lockPath = "prisma\dev.db-wal"
$shmPath = "prisma\dev.db-shm"

Write-Host ""
Write-Host "Tentando remover locks do SQLite..." -ForegroundColor Yellow

if (Test-Path $lockPath) {
    Write-Host "   Removendo $lockPath..." -ForegroundColor Gray
    Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
    if ($?) {
        Write-Host "   Arquivo removido com sucesso." -ForegroundColor Green
    }
}

if (Test-Path $shmPath) {
    Write-Host "   Removendo $shmPath..." -ForegroundColor Gray
    Remove-Item $shmPath -Force -ErrorAction SilentlyContinue
    if ($?) {
        Write-Host "   Arquivo removido com sucesso." -ForegroundColor Green
    }
}

# Aguardar um pouco para garantir que os locks foram liberados
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Regenerando Prisma Client..." -ForegroundColor Yellow
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"

try {
    # Tentar apenas gerar o client (nao precisa de push se o schema ja esta sincronizado)
    npx prisma generate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "SUCESSO: Prisma Client regenerado com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Agora voce pode:" -ForegroundColor Cyan
        Write-Host "   1. Iniciar o servidor: npm run dev" -ForegroundColor Gray
        Write-Host "   2. Os erros de TypeScript devem ter desaparecido" -ForegroundColor Gray
    } else {
        throw "Prisma generate falhou com codigo $LASTEXITCODE"
    }
} catch {
    Write-Host ""
    Write-Host "ERRO ao regenerar Prisma Client:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Solucao alternativa:" -ForegroundColor Cyan
    Write-Host "   1. Certifique-se de que TODOS os processos Node estao fechados" -ForegroundColor Gray
    Write-Host "   2. Execute manualmente: npm run db:generate" -ForegroundColor Gray
    Write-Host "   3. Ou tente: npx prisma generate" -ForegroundColor Gray
    exit 1
}

$env:NODE_TLS_REJECT_UNAUTHORIZED = "1"
