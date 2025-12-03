# 🔧 Correções para Deploy no Render

## Problema Identificado

O deploy está falhando provavelmente porque:
1. O Prisma precisa ser gerado antes do build
2. O caminho do schema pode estar incorreto
3. O SQLite pode não funcionar bem no Render

## ✅ Soluções Aplicadas

1. ✅ Adicionado `postinstall` script para gerar Prisma automaticamente
2. ✅ Corrigido `outDir` no `vite.config.ts` de `build` para `dist`
3. ✅ Criado `render.yaml` para deploy automático
4. ✅ Criado guia de deploy (`DEPLOY-RENDER.md`)

## 📝 Configuração no Render

### Backend (Web Service)

**Configurações Importantes:**
- **Root Directory**: `server` ⚠️ CRÍTICO!
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Environment Variables:**
```
NODE_ENV=production
PORT=3001
DATABASE_URL=file:./prisma/dev.db
CORS_ORIGIN=https://seu-frontend.onrender.com
```

### Frontend (Static Site)

**Configurações:**
- **Root Directory**: `.` (raiz)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

**Environment Variables:**
```
VITE_API_URL=https://acervo-digital-api.onrender.com/api
```

## ⚠️ Problema com SQLite no Render

O SQLite pode não funcionar bem no Render porque:
- O sistema de arquivos é efêmero
- Pode ser limpo entre deploys

**Solução Recomendada**: Migrar para PostgreSQL (gratuito no Render)

### Como migrar para PostgreSQL:

1. No Render, crie um **PostgreSQL Database**
2. Copie a **Internal Database URL**
3. Atualize o `DATABASE_URL` no backend:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```
4. Atualize o `schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. Execute as migrations:
   ```bash
   npx prisma migrate deploy
   ```

## 🔍 Verificar Logs de Erro

No painel do Render, vá em **Logs** para ver o erro exato. Os erros mais comuns são:

1. **"Cannot find module '@prisma/client'"**
   - Solução: Adicione `prisma generate` no build command

2. **"EACCES: permission denied"**
   - Solução: Problema com SQLite, migre para PostgreSQL

3. **"Build command failed"**
   - Solução: Verifique se o Root Directory está correto (`server` para backend)

## 🚀 Próximos Passos

1. Verifique os logs no Render para identificar o erro específico
2. Se for problema com SQLite, migre para PostgreSQL
3. Certifique-se que o Root Directory está como `server` no backend
4. Verifique se todas as variáveis de ambiente estão configuradas

