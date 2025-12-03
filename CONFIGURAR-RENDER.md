# ⚙️ Configurar Render Manualmente

**IMPORTANTE:** Mesmo tendo o `render.yaml`, você DEVE verificar e configurar manualmente no painel do Render para garantir que tudo está correto.

## 📋 Backend (Web Service)

### Configurações Básicas

1. Acesse o serviço `acervo-digital-api` no painel do Render
2. Vá em **Settings** (Configurações)
3. Configure:

   - **Name**: `acervo-digital-api`
   - **Environment**: `Node`
   - **Region**: Escolha a mais próxima
   - **Branch**: `main`
   - **Root Directory**: `server` ⚠️ **CRÍTICO!**

### Build & Start Commands

**Build Command:**
```bash
npm install && npm run build && cp ../public/bncc.db ./public/bncc.db 2>/dev/null || cp ../public/bncc.db . 2>/dev/null || true
```

**Start Command:**
```bash
npm run start:prod
```

**⚠️ IMPORTANTE:** Como o Root Directory está configurado como `server`, NÃO inclua `cd server` nos comandos!

### Environment Variables

Adicione as seguintes variáveis de ambiente:

```
NODE_ENV=production
PORT=3001
DATABASE_URL=file:./prisma/dev.db
CORS_ORIGIN=https://acervo-digital-frontend.onrender.com
```

**Nota sobre DATABASE_URL:**
- Estamos usando SQLite: `file:./prisma/dev.db`
- ⚠️ **ATENÇÃO**: SQLite no Render pode ter problemas porque o sistema de arquivos é efêmero
- O banco pode ser perdido entre deploys
- Para produção, considere migrar para PostgreSQL (gratuito no Render)

## 📋 Frontend (Static Site)

### Configurações Básicas

1. **Nome do Serviço**: `acervo-digital-frontend`
2. **Tipo**: `Static Site`
3. **Branch**: `main`
4. **Root Directory**: `.` (raiz do projeto)

### Build & Publish

**Build Command:**
```bash
npm install && npm run build
```

**Publish Directory:**
```
dist
```

### Environment Variables

```
VITE_API_URL=https://acervo-digital-xbp3.onrender.com/api
```

**Nota:** Substitua `acervo-digital-xbp3.onrender.com` pela URL real do seu backend.

## 🗄️ Database (SQLite)

**Nota:** Estamos usando SQLite localmente. No Render, o SQLite funciona, mas:
- O sistema de arquivos é efêmero
- O banco pode ser perdido entre deploys
- Para produção estável, considere migrar para PostgreSQL

### Se quiser usar PostgreSQL no Render:

1. Crie um **PostgreSQL Database** no Render
2. Copie a **Internal Database URL**
3. Atualize o `DATABASE_URL` no backend para: `postgresql://user:password@host:port/database`
4. Atualize o `server/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Execute as migrations novamente

## ✅ Verificar Configuração

Após configurar, verifique:

1. **Backend:**
   - Root Directory está como `server`?
   - Build Command está correto?
   - Start Command é `npm run start:prod`?
   - DATABASE_URL está configurado?

2. **Frontend:**
   - Root Directory está como `.` (raiz)?
   - Build Command está correto?
   - Publish Directory é `dist`?
   - VITE_API_URL aponta para o backend correto?

3. **Database:**
   - DATABASE_URL está como `file:./prisma/dev.db`?
   - ⚠️ Lembre-se: SQLite no Render pode perder dados entre deploys

## 🚀 Após o Deploy

1. **Verificar se as migrations foram executadas:**
   - Veja os logs do backend
   - Deve aparecer: `✅ Applied migration: ...`

2. **Executar migração BNCC:**
   ```bash
   curl -X POST https://seu-backend.onrender.com/api/bncc/migrate
   ```

3. **Verificar se funcionou:**
   ```bash
   curl https://seu-backend.onrender.com/api/bncc
   ```

## 🔍 Troubleshooting

### Build falha

- Verifique se o Root Directory está correto
- Verifique se todas as dependências estão no `package.json`
- Veja os logs de build para erros específicos

### Servidor não inicia

- Verifique se o Start Command está correto
- Verifique se o DATABASE_URL está configurado
- Veja os logs do servidor

### Banco não encontrado

- Verifique se o DATABASE_URL está correto
- Verifique se as migrations foram executadas (veja logs)
- Execute manualmente: `npx prisma migrate deploy` (via SSH ou shell)

### CORS Error

- Verifique se CORS_ORIGIN no backend aponta para a URL do frontend
- Verifique se VITE_API_URL no frontend aponta para a URL do backend

