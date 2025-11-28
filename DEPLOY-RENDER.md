# 🚀 Guia de Deploy no Render.com

## ✅ Backend - CONCLUÍDO

- **URL**: `https://acervo-digital-xbp3.onrender.com`
- **Status**: ✅ Online e funcionando

## 📋 Próximos Passos

### 1. Atualizar CORS no Backend

1. No Render, vá no serviço do backend
2. Clique em **Environment**
3. Adicione/Atualize a variável:
   - **Key**: `CORS_ORIGIN`
   - **Value**: `https://acervo-digital-frontend.onrender.com` (ou a URL que o Render gerar)
   - ⚠️ Se ainda não souber a URL do frontend, deixe vazio temporariamente e atualize depois

### 2. Criar Static Site (Frontend)

1. No dashboard do Render, clique em **New +** → **Static Site**
2. Conecte o repositório GitHub (se ainda não conectou)
3. Configure:
   - **Name**: `acervo-digital-frontend` (ou outro nome)
   - **Branch**: `main`
   - **Root Directory**: (deixar **VAZIO** - raiz do projeto)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Clique em **Advanced** e adicione **Environment Variables**:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://acervo-digital-xbp3.onrender.com/api`
5. Clique em **Create Static Site**

### 3. Após o Deploy do Frontend

1. Copie a URL do frontend (ex: `https://acervo-digital-frontend.onrender.com`)
2. Volte no backend → **Environment**
3. Atualize `CORS_ORIGIN` com a URL do frontend
4. O backend vai reiniciar automaticamente

### 4. Testar

1. Acesse a URL do frontend
2. Verifique se carrega os ODAs do backend
3. Teste login/registro
4. Teste favoritos

## 🔧 Configurações Finais

### Backend (Environment Variables)
```
DATABASE_URL=file:./prisma/dev.db
JWT_SECRET=<sua-chave-secreta>
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=<deixar-vazio-ou-usar-$PORT>
CORS_ORIGIN=https://acervo-digital-frontend.onrender.com
```

### Frontend (Environment Variables)
```
VITE_API_URL=https://acervo-digital-xbp3.onrender.com/api
```

## ⚠️ Observações Importantes

1. **SQLite no Render**: O banco SQLite funciona, mas os dados podem ser perdidos se o serviço reiniciar. Para produção, considere migrar para PostgreSQL.

2. **Instância Gratuita**: O Render desliga serviços gratuitos após 15 minutos de inatividade. O primeiro acesso pode levar ~50 segundos para "acordar".

3. **Auto-Deploy**: Por padrão, o Render faz deploy automático a cada push no `main`. Você pode desabilitar isso nas configurações.

## 🔧 Troubleshooting

### Erro: "Unable to open the database file"

**Problema**: O banco SQLite não foi criado durante o build.

**Solução**:
1. No Render, vá no serviço do backend → **Settings**
2. Atualize o **Build Command** para:
   ```
   npm install && npx prisma generate && npx prisma db push && npm run build
   ```
3. Verifique se o **DATABASE_URL** está correto em **Environment**:
   ```
   DATABASE_URL=file:./prisma/dev.db
   ```
4. Faça um novo deploy (Manual Deploy → Deploy latest commit)

### Banco vazio (sem ODAs)

**Problema**: O banco foi criado mas está vazio, sem os ODAs do seed.

**Solução**:
1. No Render, vá no serviço do backend → **Settings**
2. Atualize o **Build Command** para incluir o seed:
   ```
   npm install && npx prisma generate && npx prisma db push && npm run build && npm run db:seed
   ```
   ⚠️ **Nota**: O `tsx` precisa estar em `dependencies` (não `devDependencies`) para funcionar no Render.
3. Ou, se preferir executar manualmente após o deploy:
   - Use o **Shell** do Render (disponível no dashboard)
   - Execute: `cd backend && npm run db:seed`

## 🎉 Pronto!

Após seguir esses passos, sua aplicação estará totalmente online!

## 🔍 Como Acessar o Banco de Dados no Render

### ✅ Opção 1: Endpoints de Admin (GRATUITO - Recomendado)

Endpoints HTTP para consultar o banco sem precisar do Shell pago:

**Estatísticas do banco:**
```
GET https://acervo-digital-xbp3.onrender.com/api/admin/stats
```
Retorna: quantidade de usuários, ODAs, favoritos e visualizações.

**Listar usuários:**
```
GET https://acervo-digital-xbp3.onrender.com/api/admin/users
```
Retorna: lista de todos os usuários com informações básicas.

**Listar ODAs (resumo):**
```
GET https://acervo-digital-xbp3.onrender.com/api/admin/odas?limit=10
```
Retorna: resumo dos ODAs (padrão: 10, use `?limit=50` para mais).

**Listar favoritos:**
```
GET https://acervo-digital-xbp3.onrender.com/api/admin/favorites
```
Retorna: lista de todos os favoritos com informações do usuário e ODA.

**Exemplo de uso no navegador:**
- Acesse: `https://acervo-digital-xbp3.onrender.com/api/admin/stats`
- Ou use ferramentas como Postman, Insomnia, ou curl

### Opção 2: Shell do Render (PAGO)

⚠️ **Nota**: O Shell do Render é uma funcionalidade paga. Use os endpoints acima se não tiver acesso.

Se tiver acesso ao Shell:
1. No dashboard do Render, vá no serviço do backend
2. Clique em **Shell** (no menu lateral ou no topo)
3. Execute os comandos:

```bash
cd backend
npm run db:query
```

### Opção 3: Prisma Studio (Requer Shell)

No Shell do Render:
```bash
cd backend
npx prisma studio --port 5555 --hostname 0.0.0.0
```

⚠️ **Nota**: O Prisma Studio precisa de configuração adicional para ser acessível externamente no Render.

