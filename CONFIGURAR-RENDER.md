# 🚀 Configurar Render para Usar Supabase

## 📋 O que fazer no Render:

### 1. Acessar o Render Dashboard
https://dashboard.render.com

### 2. Configurar Backend (acervo-digital-api)

1. Clique no serviço **acervo-digital-api**
2. Vá em **Environment** (menu lateral)
3. Encontre a variável **DATABASE_URL**
4. Clique para editar
5. Cole a connection string do Supabase:

```
postgresql://postgres:MZDL%40teCg2Xxg3f@db.adungjmhuibxvgiqrume.supabase.co:5432/postgres?sslmode=require&connect_timeout=10
```

**IMPORTANTE**: 
- Substitua `MZDL%40teCg2Xxg3f` pela sua senha do Supabase (codificada)
- Se a senha mudar, atualize aqui também

6. Clique em **Save Changes**

### 3. Verificar outras variáveis

Certifique-se de que estas variáveis estão configuradas:
- ✅ `NODE_ENV` = `production`
- ✅ `PORT` = `3001`
- ✅ `DATABASE_URL` = (connection string do Supabase acima)
- ✅ `CORS_ORIGIN` = (URL do frontend no Render)

### 4. Frontend não precisa mudança

O frontend (`acervo-digital-frontend`) não precisa de alterações, ele já está configurado corretamente.

## ✅ Pronto!

Após configurar a `DATABASE_URL`, o Render vai:
1. Fazer deploy automaticamente (ou você pode fazer manual)
2. Conectar ao Supabase
3. Os dados já estão no Supabase, então não precisa rodar seed
4. O seed automático serve como backup (se o banco estiver vazio)

## 🎯 Vantagens:

- ✅ Dados persistentes (não perde quando Render reinicia)
- ✅ Backup automático do Supabase
- ✅ Mesmo banco para desenvolvimento e produção
- ✅ Escalável

## 🐛 Se der erro:

**"Can't reach database server"**
- Verifique se a connection string está correta
- Verifique se o Supabase está ativo

**"relation does not exist"**
- As tabelas já foram criadas no Supabase
- Se não estiverem, execute o SQL no Supabase SQL Editor

**Dados não aparecem**
- Os dados já estão no Supabase
- Verifique no Supabase Dashboard → Table Editor

