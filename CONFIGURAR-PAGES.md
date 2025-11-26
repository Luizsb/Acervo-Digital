# ⚙️ Configurar GitHub Pages (Passo a Passo)

## 📋 Passos Necessários

### 1. Habilitar GitHub Pages no Repositório

1. Acesse: https://github.com/Luizsb/Acervo-Digital/settings/pages

2. Em **"Source"**, configure:
   - **Branch**: Selecione `gh-pages` (será criada automaticamente pelo workflow)
   - **Folder**: `/ (root)`
   - Clique em **Save**

3. Aguarde alguns minutos para o primeiro deploy

### 2. Verificar Workflow

1. Acesse: https://github.com/Luizsb/Acervo-Digital/actions
2. Verifique se o workflow "Deploy to GitHub Pages" está rodando
3. Se houver erros, verifique os logs

### 3. URL do Site

Após o deploy, seu site estará disponível em:
- **https://luizsb.github.io/Acervo-Digital/**

## ⚠️ Importante: Backend

O GitHub Pages **só hospeda arquivos estáticos**. O backend precisa estar hospedado separadamente.

### Opções para Hospedar o Backend:

1. **Render.com** (Recomendado - Grátis)
   - https://render.com
   - Conecte seu repositório GitHub
   - Configure como "Web Service"
   - Adicione variáveis de ambiente

2. **Railway**
   - https://railway.app
   - Deploy automático do GitHub

3. **Heroku**
   - https://heroku.com
   - Plano gratuito limitado

4. **Vercel**
   - https://vercel.com
   - Suporta serverless functions

### Configurar API URL

Após hospedar o backend, atualize a URL da API:

1. Crie arquivo `.env.production` (não commitar):
```env
VITE_API_URL=https://seu-backend.onrender.com/api
```

2. Ou configure no `vite.config.ts`:
```typescript
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://seu-backend.onrender.com/api'
  : 'http://localhost:3001/api';
```

## 🔄 Deploy Automático

O deploy é automático a cada push na branch `main`. 

Para verificar:
1. Faça qualquer mudança
2. Commit e push
3. O workflow será executado automaticamente
4. Aguarde 2-5 minutos
5. Acesse o site

## ✅ Verificar Status

- **Actions**: https://github.com/Luizsb/Acervo-Digital/actions
- **Pages**: https://github.com/Luizsb/Acervo-Digital/settings/pages
- **Site**: https://luizsb.github.io/Acervo-Digital/

## 🐛 Troubleshooting

**Workflow não executa:**
- Verifique se está na branch `main`
- Verifique se o arquivo `.github/workflows/deploy.yml` existe

**Site não carrega:**
- Aguarde alguns minutos (primeiro deploy pode levar mais tempo)
- Verifique se o GitHub Pages está habilitado
- Verifique os logs do workflow

**Assets não carregam:**
- Verifique se o `base` no `vite.config.ts` está como `/Acervo-Digital/`
- Limpe o cache do navegador

