# Backend API - Acervo Digital

Backend usando Node.js, Express e Prisma com SQLite.

## 🚀 Início Rápido

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar ambiente:**
Crie um arquivo `.env` na pasta `server/` com:
```
DATABASE_URL="file:./prisma/dev.db"
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

3. **Gerar cliente Prisma:**
```bash
npm run prisma:generate:fix
```

4. **Criar banco e migrações:**
```bash
npm run prisma:migrate:fix
```

5. **Executar servidor:**
```bash
npm run dev
```

## 📊 Prisma Studio

Visualizar o banco de dados:
```bash
npm run prisma:studio:fix
```

Acesse `http://localhost:5555`

## 🔌 API Endpoints

### ODAs
- `GET /api/odas` - Listar ODAs
- `GET /api/odas/:id` - Buscar por ID
- `POST /api/odas` - Criar ODA
- `PUT /api/odas/:id` - Atualizar ODA
- `DELETE /api/odas/:id` - Deletar ODA

### BNCC
- `GET /api/bncc` - Listar habilidades BNCC
- `GET /api/bncc/:codigo` - Buscar por código
- `POST /api/bncc/migrate` - Migrar do banco bncc.db

### Migração
- `POST /api/migration/excel` - Migrar planilha Excel
- `GET /api/migration/status` - Status da migração

## 📝 Notas

- O banco SQLite fica em `prisma/dev.db`
- A planilha Excel deve estar em `../public/ObjetosDigitais.xlsx`
- O banco BNCC deve estar em `../public/bncc.db`
- O servidor roda na porta 3001 por padrão

## 🔧 Troubleshooting

Se tiver erro de certificado SSL:
```bash
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; npm run prisma:generate
```
