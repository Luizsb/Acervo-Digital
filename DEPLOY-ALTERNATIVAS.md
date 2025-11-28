# Alternativas de Deploy para Acervo Digital

## ⚠️ Importante

O **GitHub Pages** não funciona para este projeto porque:
- GitHub Pages só hospeda arquivos estáticos (HTML, CSS, JS)
- Este projeto precisa de um **backend Node.js** rodando
- O backend precisa de acesso ao banco de dados SQLite

## ✅ Opções de Deploy Completo

### 1. **Render.com** (Recomendado - Gratuito)
- Hospeda frontend e backend
- Suporta Node.js
- Banco de dados PostgreSQL (gratuito) ou SQLite
- Deploy automático do GitHub

**Passos:**
1. Criar conta em https://render.com
2. Conectar repositório GitHub
3. Criar 2 serviços:
   - **Web Service** (Backend): `backend/`
     - Root Directory: `backend`
     - Build Command: `npm install && npx prisma generate && npm run build`
     - Start Command: `npm start`
   - **Static Site** (Frontend): `dist/` após build
     - Root Directory: (deixar vazio - raiz do projeto)
     - Build Command: `npm install && npm run build`
     - Publish Directory: `dist`

### 2. **Railway.app** (Gratuito)
- Similar ao Render
- Suporta Node.js e SQLite
- Deploy automático

### 3. **Vercel** (Frontend) + **Render/Railway** (Backend)
- Vercel para frontend (otimizado para React)
- Render/Railway para backend

### 4. **Heroku** (Pago após trial)
- Suporta full-stack
- Mais complexo de configurar

## 📝 Configuração Necessária

### Backend
- Variáveis de ambiente:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `PORT`
  - `CORS_ORIGIN` (URL do frontend)

### Frontend
- Variável de ambiente:
  - `VITE_API_URL` (URL do backend em produção)

## 🔧 Próximos Passos

1. Escolher uma plataforma de deploy
2. Configurar variáveis de ambiente
3. Ajustar CORS no backend para aceitar o domínio do frontend
4. Fazer deploy do backend primeiro
5. Fazer deploy do frontend apontando para o backend

