# Backend - Acervo Digital API

Backend API usando Node.js, Express e Prisma com SQLite.

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn

## 🚀 Instalação

1. Instalar dependências:
```bash
cd server
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp .env.example .env
```

3. Gerar cliente Prisma:
```bash
npx prisma generate
```

4. Criar banco de dados e aplicar migrações:
```bash
npx prisma migrate dev
```

## 🏃 Executar

### Desenvolvimento
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

### Produção
```bash
npm run build
npm start
```

## 📊 Prisma Studio

Visualizar e editar o banco de dados:
```bash
npm run prisma:studio
```

Acesse `http://localhost:5555` no navegador.

## 🔌 API Endpoints

### ODAs

- `GET /api/odas` - Listar todos os ODAs
  - Query params: `tipoConteudo`, `search`, `limit`, `offset`
- `GET /api/odas/:id` - Buscar ODA por ID
- `POST /api/odas` - Criar novo ODA
- `PUT /api/odas/:id` - Atualizar ODA
- `DELETE /api/odas/:id` - Deletar ODA
- `GET /api/odas/stats/count` - Contar total de ODAs

### Migração

- `POST /api/migration/excel` - Migrar planilha Excel para banco
  - Body: `{ clearExisting: boolean }`
- `GET /api/migration/status` - Verificar status da migração

## 🗄️ Banco de Dados

O banco SQLite está localizado em `server/prisma/dev.db`

Para visualizar com Prisma Studio:
```bash
cd server
npm run prisma:studio
```

## 🔧 Configuração

Edite `server/.env` para configurar:
- `DATABASE_URL` - URL do banco de dados
- `PORT` - Porta do servidor (padrão: 3001)
- `CORS_ORIGIN` - Origem permitida para CORS

## 📝 Estrutura

```
server/
├── prisma/
│   ├── schema.prisma      # Schema do Prisma
│   └── migrations/         # Migrações do banco
├── routes/
│   ├── odas.ts            # Rotas de ODAs
│   └── migration.ts       # Rotas de migração
├── index.ts               # Servidor Express
├── package.json
└── tsconfig.json
```

