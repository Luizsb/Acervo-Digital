# 🚀 Como Iniciar a Aplicação

## Opção 1: Script Automático (Recomendado)

Execute na raiz do projeto:

```powershell
.\start-app.ps1
```

Este script vai:
- ✅ Verificar/criar arquivo `.env`
- ✅ Gerar Prisma Client
- ✅ Instalar dependências (se necessário)
- ✅ Iniciar backend e frontend em terminais separados

## Opção 2: Manual (Passo a Passo)

### Terminal 1 - Backend

```powershell
cd backend

# 1. Gerar Prisma Client (se ainda não foi feito)
npm run db:generate-only

# 2. Iniciar servidor
npm run dev
```

O backend estará em: **http://localhost:3001**

### Terminal 2 - Frontend

```powershell
# Na raiz do projeto (não dentro de backend)

# Iniciar aplicação
npm run dev
```

O frontend estará em: **http://localhost:5173**

## ✅ Verificar se está funcionando

1. Abra o navegador em: **http://localhost:5173**
2. Você deve ver a interface do Acervo Digital
3. Clique em um ODA para testar o contador de visualizações
4. Verifique o console do navegador (F12) para ver os logs de visualização

## 🔧 Comandos Úteis

### Backend
```powershell
cd backend
npm run dev              # Iniciar servidor
npm run db:studio        # Abrir Prisma Studio (interface visual do banco)
npm run db:generate-only # Gerar Prisma Client
npm run db:seed          # Popular banco com dados de exemplo
```

### Frontend
```powershell
# Na raiz do projeto
npm run dev              # Iniciar aplicação
```

## ❌ Problemas?

**"database is locked"**
```powershell
cd backend
npm run db:fix-lock
```

**"Cannot find module '@prisma/client'"**
```powershell
cd backend
npm run db:generate-only
```

**Erros de TypeScript no backend**
```powershell
cd backend
npm run db:generate-only
```

## 📝 Notas

- O banco de dados SQLite será criado automaticamente na primeira execução
- O arquivo do banco fica em: `backend/prisma/dev.db`
- Para ver os dados no banco, use: `npm run db:studio` (no backend)

