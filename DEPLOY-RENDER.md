# Guia de Deploy no Render

Este guia explica como fazer deploy do Acervo Digital no Render.

## 📋 Pré-requisitos

- Conta no Render (https://render.com)
- Repositório no GitHub configurado

## 🚀 Opção 1: Deploy Manual (Recomendado)

### 1. Backend (Web Service)

1. No painel do Render, clique em **"New +"** → **"Web Service"**
2. Conecte seu repositório GitHub: `Luizsb/Acervo-Digital`
3. Configure:
   - **Name**: `acervo-digital-api`
   - **Environment**: `Node`
   - **Region**: Escolha a mais próxima
   - **Branch**: `main`
   - **Root Directory**: `server` (IMPORTANTE!)
   - **Build Command**: 
     ```bash
     npm install && npm run prisma:generate && npm run build
     ```
   - **Start Command**: 
     ```bash
     npm start
     ```

4. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=file:./prisma/dev.db
   CORS_ORIGIN=https://seu-frontend.onrender.com
   ```

### 2. Frontend (Static Site)

1. No painel do Render, clique em **"New +"** → **"Static Site"**
2. Conecte seu repositório GitHub: `Luizsb/Acervo-Digital`
3. Configure:
   - **Name**: `acervo-digital-frontend`
   - **Branch**: `main`
   - **Root Directory**: `.` (raiz do projeto)
   - **Build Command**: 
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory**: `dist`

4. **Environment Variables**:
   ```
   VITE_API_URL=https://acervo-digital-api.onrender.com/api
   ```
   (Substitua pela URL real do seu backend)

### 3. Atualizar CORS após deploy

Após o frontend ser deployado, atualize a variável `CORS_ORIGIN` no backend com a URL do frontend.

## 🚀 Opção 2: Deploy Automático com render.yaml

O arquivo `render.yaml` já está configurado. No Render:

1. Vá em **"New +"** → **"Blueprint"**
2. Conecte o repositório
3. O Render detectará automaticamente o `render.yaml` e criará os serviços

## ⚠️ Problemas Comuns

### Erro: "Build failed"

**Solução**: Verifique se:
- O Root Directory do backend está como `server`
- Todas as dependências estão no `package.json`
- O Prisma está sendo gerado antes do build

### Erro: "Cannot find module"

**Solução**: 
- Certifique-se que o build command inclui `npm install`
- Verifique se o `prisma:generate` está sendo executado

### Erro: "Database connection failed"

**Solução**: 
- SQLite pode não funcionar bem no Render
- Considere usar PostgreSQL (gratuito no Render)
- Atualize o `DATABASE_URL` para uma conexão PostgreSQL

## 📝 Notas Importantes

1. **SQLite no Render**: O SQLite pode ter problemas em ambientes serverless. Considere migrar para PostgreSQL.
2. **Build Time**: O primeiro build pode demorar alguns minutos.
3. **Environment Variables**: Sempre configure as variáveis de ambiente antes do deploy.

## 🔄 Atualizações

Após fazer push para o GitHub, o Render fará deploy automático se estiver configurado.

