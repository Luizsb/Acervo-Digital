# 🚀 Guia de Inicialização - Acervo Digital

## Passo a Passo para Iniciar a Aplicação

### 1️⃣ Preparar o Backend

#### 1.1. Verificar/Criar arquivo .env
```powershell
cd backend
# Se não existir, copie o exemplo:
copy env.example .env
```

#### 1.2. Gerar Prisma Client
```powershell
npm run db:generate-only
# ou
.\generate-client.ps1
```

#### 1.3. Verificar se o banco existe
O banco será criado automaticamente na primeira execução, mas você pode verificar:
```powershell
# Verificar se existe
Test-Path prisma\dev.db
```

### 2️⃣ Iniciar o Backend

Em um terminal:
```powershell
cd backend
npm run dev
```

O servidor estará rodando em: `http://localhost:3001`

### 3️⃣ Iniciar o Frontend

Em outro terminal:
```powershell
# Na raiz do projeto
npm run dev
```

O frontend estará rodando em: `http://localhost:5173`

### 4️⃣ Testar o Contador de Visualizações

1. Abra o navegador em `http://localhost:5173`
2. Clique em um ODA para ver os detalhes
3. Verifique no console do navegador se a visualização foi incrementada
4. Recarregue a página - não deve incrementar novamente (já visualizou hoje)

## ✅ Checklist de Inicialização

- [ ] Arquivo `.env` existe no backend
- [ ] Prisma Client gerado (`npm run db:generate-only`)
- [ ] Backend rodando (`npm run dev` no backend)
- [ ] Frontend rodando (`npm run dev` na raiz)
- [ ] Navegador aberto em `http://localhost:5173`

## 🔧 Comandos Úteis

```powershell
# Backend
cd backend
npm run dev              # Iniciar servidor
npm run db:studio        # Abrir Prisma Studio
npm run db:generate-only # Gerar apenas Prisma Client

# Frontend (raiz do projeto)
npm run dev              # Iniciar aplicação
```

## ❌ Problemas Comuns

**Erro: "database is locked"**
- Feche todos os processos Node
- Execute: `npm run db:fix-lock`

**Erro: "Cannot find module '@prisma/client'"**
- Execute: `npm run db:generate-only`

**Erro: "Property 'view' does not exist"**
- Execute: `npm run db:generate-only`


