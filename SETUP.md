# 🚀 Setup Completo - Acervo Digital com Backend

## 📋 Estrutura do Projeto

```
Acervo Digital/
├── server/              # Backend (Node.js + Express + Prisma)
│   ├── prisma/          # Schema e migrações do Prisma
│   ├── routes/          # Rotas da API
│   └── index.ts         # Servidor Express
├── src/                 # Frontend (React + Vite)
└── public/              # Arquivos estáticos
```

## 🔧 Instalação

### 1. Instalar dependências do projeto principal
```bash
npm install
```

### 2. Instalar dependências do servidor
```bash
cd server
npm install
```

### 3. Configurar Prisma

Crie o arquivo `server/.env`:
```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### 4. Gerar cliente Prisma

**Se NÃO tiver erro de certificado SSL:**
```bash
cd server
npx prisma generate
```

**Se tiver erro de certificado SSL (comum em redes corporativas):**

**Opção 1 - Script automático (Windows):**
```powershell
cd server
.\fix-prisma-ssl.ps1
```

**Opção 2 - Script automático (Linux/Mac):**
```bash
cd server
chmod +x fix-prisma-ssl.sh
./fix-prisma-ssl.sh
```

**Opção 3 - Manual:**
```bash
cd server
npm config set strict-ssl false
npx prisma generate
npm config set strict-ssl true
```

**Opção 4 - Usar script do package.json:**
```bash
cd server
npm run prisma:generate:fix
```

### 5. Criar banco de dados
```bash
cd server
npx prisma migrate dev --name init
```

## 🏃 Executar

### Desenvolvimento

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Scripts Disponíveis

No diretório raiz:
- `npm run dev` - Iniciar frontend
- `npm run server:dev` - Iniciar backend
- `npm run prisma:studio` - Abrir Prisma Studio

No diretório `server/`:
- `npm run dev` - Iniciar servidor em modo desenvolvimento
- `npm run build` - Compilar TypeScript
- `npm start` - Iniciar servidor compilado
- `npm run prisma:generate` - Gerar cliente Prisma
- `npm run prisma:migrate` - Criar migração
- `npm run prisma:studio` - Visualizar banco de dados

## 📊 Prisma Studio

Visualizar e editar o banco de dados:
```bash
cd server
npm run prisma:studio
```

Acesse: http://localhost:5555

## 🔌 API Endpoints

### ODAs
- `GET /api/odas` - Listar todos
- `GET /api/odas/:id` - Buscar por ID
- `POST /api/odas` - Criar novo
- `PUT /api/odas/:id` - Atualizar
- `DELETE /api/odas/:id` - Deletar
- `GET /api/odas/stats/count` - Contar total

### Migração
- `POST /api/migration/excel` - Migrar planilha Excel
  ```json
  {
    "clearExisting": false
  }
  ```
- `GET /api/migration/status` - Status da migração

## 🔄 Migração da Planilha

A primeira vez que o frontend carregar, ele automaticamente:
1. Verifica se há ODAs no banco
2. Se não houver, migra automaticamente da planilha `public/ObjetosDigitais.xlsx`

Ou você pode migrar manualmente:
```bash
curl -X POST http://localhost:3001/api/migration/excel \
  -H "Content-Type: application/json" \
  -d '{"clearExisting": false}'
```

## 🗄️ Banco de Dados

- **Localização:** `server/prisma/dev.db`
- **Tipo:** SQLite
- **ORM:** Prisma

## 📝 Variáveis de Ambiente

### Frontend (`src/`)
Crie `.env` na raiz do projeto:
```env
VITE_API_URL=http://localhost:3001/api
```

### Backend (`server/`)
Crie `server/.env`:
```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## 🐛 Troubleshooting

### Erro ao gerar Prisma Client
```bash
# Tentar com proxy desabilitado (temporário)
npm config set strict-ssl false
cd server
npx prisma generate
npm config set strict-ssl true
```

### Banco não encontrado
```bash
cd server
npx prisma migrate dev
```

### CORS Error
Verifique se `CORS_ORIGIN` no `server/.env` está correto.

### Planilha não encontrada
Certifique-se de que `public/ObjetosDigitais.xlsx` existe.

## ✅ Checklist

- [ ] Dependências instaladas (raiz e server)
- [ ] Arquivo `server/.env` criado
- [ ] Prisma Client gerado
- [ ] Migração do banco executada
- [ ] Backend rodando na porta 3001
- [ ] Frontend rodando na porta 3000
- [ ] Migração da planilha executada (automática ou manual)

## 🎉 Pronto!

Agora você tem:
- ✅ Backend API com Prisma
- ✅ Banco SQLite no servidor (não mais localStorage)
- ✅ API REST completa
- ✅ Migração automática da planilha
- ✅ Prisma Studio para visualizar dados

