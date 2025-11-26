# Script para iniciar a aplicacao Acervo Digital
# Inicia backend e frontend em terminais separados

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Acervo Digital - Inicializacao" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPath = "backend"
$frontendPath = "."

# Verificar se estamos no diretorio correto
if (-not (Test-Path $backendPath)) {
    Write-Host "ERRO: Execute este script na raiz do projeto!" -ForegroundColor Red
    exit 1
}

# 1. Verificar/Criar .env no backend
Write-Host "[1/4] Verificando configuracao do backend..." -ForegroundColor Yellow
if (-not (Test-Path "$backendPath\.env")) {
    if (Test-Path "$backendPath\env.example") {
        Write-Host "   Criando arquivo .env a partir do exemplo..." -ForegroundColor Gray
        Copy-Item "$backendPath\env.example" "$backendPath\.env"
        Write-Host "   Arquivo .env criado!" -ForegroundColor Green
    } else {
        Write-Host "   AVISO: env.example nao encontrado!" -ForegroundColor Yellow
    }
} else {
    Write-Host "   Arquivo .env ja existe" -ForegroundColor Green
}

# 2. Gerar Prisma Client
Write-Host ""
Write-Host "[2/4] Gerando Prisma Client..." -ForegroundColor Yellow
Set-Location $backendPath
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"
npx prisma generate 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Prisma Client gerado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "   AVISO: Erro ao gerar Prisma Client. Tente manualmente: npm run db:generate-only" -ForegroundColor Yellow
}
$env:NODE_TLS_REJECT_UNAUTHORIZED = "1"
Set-Location ..

# 3. Verificar dependencias
Write-Host ""
Write-Host "[3/4] Verificando dependencias..." -ForegroundColor Yellow
if (-not (Test-Path "$backendPath\node_modules")) {
    Write-Host "   Instalando dependencias do backend..." -ForegroundColor Gray
    Set-Location $backendPath
    npm install
    Set-Location ..
}
if (-not (Test-Path "node_modules")) {
    Write-Host "   Instalando dependencias do frontend..." -ForegroundColor Gray
    npm install
}

# 4. Iniciar aplicacoes
Write-Host ""
Write-Host "[4/4] Iniciando aplicacoes..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend sera iniciado em: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend sera iniciado em: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Ctrl+C para parar ambos os servidores" -ForegroundColor Yellow
Write-Host ""

# Iniciar backend em novo terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\$backendPath'; Write-Host 'Backend - Acervo Digital' -ForegroundColor Green; Write-Host 'Servidor rodando em http://localhost:3001' -ForegroundColor Cyan; npm run dev"

# Aguardar um pouco para o backend iniciar
Start-Sleep -Seconds 3

# Iniciar frontend em novo terminal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Frontend - Acervo Digital' -ForegroundColor Green; Write-Host 'Aplicacao rodando em http://localhost:5173' -ForegroundColor Cyan; npm run dev"

Write-Host "Aplicacoes iniciadas!" -ForegroundColor Green
Write-Host ""
Write-Host "Aguarde alguns segundos para os servidores iniciarem completamente." -ForegroundColor Yellow
Write-Host "Depois abra: http://localhost:5173" -ForegroundColor Cyan


