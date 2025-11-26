# 🚀 Guia de Setup e Teste - Acervo Digital

Este guia explica como configurar e testar a integração completa entre frontend e backend.

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn

## 🔧 Setup do Backend

1. **Navegar para a pasta backend:**
```bash
cd backend
```

2. **Instalar dependências:**
```bash
npm install
```

3. **Configurar variáveis de ambiente:**
```bash
cp env.example .env
```

O arquivo `.env` já está configurado para SQLite:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

4. **Criar banco de dados e executar migrações:**
```bash
npm run db:migrate
npm run db:generate
```

5. **Popular com dados de exemplo (opcional):**
```bash
npm run db:seed
```

6. **Iniciar servidor backend:**
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

## 🎨 Setup do Frontend

1. **Na raiz do projeto, instalar dependências:**
```bash
npm install
```

2. **Configurar variável de ambiente:**
```bash
cp .env.example .env
```

O arquivo `.env` deve conter:
```env
VITE_API_URL=http://localhost:3001/api
```

3. **Substituir App.tsx pela versão integrada:**
```bash
# Backup do arquivo original
mv src/App.tsx src/App.original.tsx

# Usar a versão integrada
mv src/App.integrated.tsx src/App.tsx
```

4. **Iniciar servidor de desenvolvimento:**
```bash
npm run dev
```

O frontend estará rodando em `http://localhost:5173`

## ✅ Testando a Integração

### 1. Testar Autenticação

1. Acesse `http://localhost:5173`
2. Você verá a tela de login
3. Clique em "Criar conta"
4. Preencha:
   - Nome (opcional)
   - E-mail: `teste@example.com`
   - Senha: `123456`
   - Confirmar senha: `123456`
5. Clique em "Criar conta"
6. Você será redirecionado para o acervo

### 2. Testar Busca e Filtros

1. Use a barra de busca para pesquisar ODAs
2. Teste os filtros na sidebar (desktop) ou no botão flutuante (mobile)
3. Verifique se os resultados são filtrados corretamente

### 3. Testar Favoritos

1. Clique no ícone de coração em um ODA
2. Vá para "Meus Favoritos" no menu do perfil
3. Verifique se o ODA aparece na lista
4. Clique novamente no coração para remover

### 4. Testar Detalhes do ODA

1. Clique em um card de ODA
2. Verifique se os detalhes são carregados
3. Teste adicionar/remover dos favoritos
4. Verifique se as visualizações são incrementadas

## 🔍 Verificando se está funcionando

### Backend

- ✅ Servidor rodando em `http://localhost:3001`
- ✅ Health check: `http://localhost:3001/health` retorna `{"status":"ok"}`
- ✅ Banco de dados `dev.db` criado na pasta `backend/`

### Frontend

- ✅ Tela de login aparece quando não autenticado
- ✅ Após login, acervo carrega ODAs do backend
- ✅ Filtros funcionam e atualizam resultados
- ✅ Favoritos são salvos no backend
- ✅ Navegação entre páginas funciona

## 🐛 Troubleshooting

### Erro: "Failed to fetch"

- Verifique se o backend está rodando
- Verifique se `VITE_API_URL` está correto no `.env`
- Verifique CORS no backend

### Erro: "Authentication required"

- Faça login novamente
- Verifique se o token está sendo salvo no localStorage

### Erro: "ODA not found"

- Execute `npm run db:seed` no backend
- Verifique se há dados no banco usando `npm run db:studio`

### Banco de dados não cria

- Verifique permissões na pasta `backend/`
- Tente deletar `dev.db` e executar `npm run db:migrate` novamente

## 📚 Próximos Passos

1. **Adicionar tipos de usuários** - Admin, Professor, Aluno
2. **Níveis de visualização** - Restringir conteúdo por tipo de usuário
3. **Upload de imagens** - Permitir upload de imagens para ODAs
4. **Analytics** - Dashboard com estatísticas de uso
5. **Notificações** - Sistema de notificações para novos ODAs

## 🔗 Links Úteis

- Backend API: `http://localhost:3001/api`
- Prisma Studio: Execute `npm run db:studio` no backend
- Frontend: `http://localhost:5173`

