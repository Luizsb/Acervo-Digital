# 🚀 Deploy no GitHub Pages

## Configuração Automática

O projeto está configurado para fazer deploy automático no GitHub Pages sempre que houver push na branch `main`.

### Como Funciona

1. **Workflow Automático**: O arquivo `.github/workflows/deploy.yml` faz:
   - Build do frontend
   - Deploy automático no GitHub Pages
   - Atualização a cada push na branch `main`

2. **URL do Site**: 
   - Após o primeiro deploy: `https://luizsb.github.io/Acervo-Digital/`

## ⚙️ Configuração Manual (Primeira Vez)

Se o deploy automático não funcionar, siga estes passos:

### 1. Habilitar GitHub Pages

1. Vá para: https://github.com/Luizsb/Acervo-Digital/settings/pages
2. Em "Source", selecione:
   - **Branch**: `gh-pages` ou `main`
   - **Folder**: `/ (root)` ou `/dist`
3. Clique em **Save**

### 2. Build Local (Alternativa)

Se preferir fazer build local:

```powershell
# Build do projeto
npm run build

# Instalar gh-pages (se não tiver)
npm install --save-dev gh-pages

# Adicionar script no package.json
# "deploy": "npm run build && gh-pages -d dist"
```

## 📝 Notas Importantes

### Backend

⚠️ **O GitHub Pages só hospeda arquivos estáticos!**

O backend (API) **NÃO** pode ser hospedado no GitHub Pages. Você precisa:

1. **Opção 1 - Hospedar backend separadamente:**
   - Render.com
   - Railway
   - Heroku
   - Vercel (com serverless functions)
   - Outros serviços de hospedagem Node.js

2. **Opção 2 - Usar API pública:**
   - Configurar `VITE_API_URL` no build apontando para seu backend hospedado

### Variáveis de Ambiente

Para produção, configure:

```env
VITE_API_URL=https://seu-backend.herokuapp.com/api
```

Ou edite `vite.config.ts` para usar a URL do backend em produção.

## 🔄 Atualizar Deploy

O deploy é automático a cada push em `main`. Para forçar um novo deploy:

```bash
git push origin main
```

Ou use o GitHub Actions para fazer deploy manual:
1. Vá para: https://github.com/Luizsb/Acervo-Digital/actions
2. Selecione "Deploy to GitHub Pages"
3. Clique em "Run workflow"

## ✅ Verificar Deploy

Após alguns minutos, acesse:
- https://luizsb.github.io/Acervo-Digital/

## 🐛 Problemas Comuns

**Site não carrega:**
- Verifique se o GitHub Pages está habilitado
- Verifique se o workflow foi executado com sucesso
- Aguarde alguns minutos (deploy pode levar 2-5 minutos)

**Assets não carregam:**
- Verifique se o `base` no `vite.config.ts` está correto
- Deve ser `/Acervo-Digital/` para repositórios com nome do projeto

**API não funciona:**
- Lembre-se: backend precisa estar hospedado separadamente
- Configure `VITE_API_URL` apontando para o backend

