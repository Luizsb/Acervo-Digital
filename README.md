# Acervo Digital

Sistema de gerenciamento e busca de Objetos Digitais de Aprendizagem (ODAs) para educação.

## Tecnologias

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Radix UI, Lucide React, Intro.js (onboarding)
- **Backend:** Node.js, Express, TypeScript, Prisma
- **Banco:** PostgreSQL (Supabase) ou SQLite

## Estrutura

```
Acervo Digital/
├── src/                 # Frontend (React + Vite)
│   ├── components/      # Componentes e ui/
│   ├── contexts/        # Auth
│   ├── hooks/           # useProjectFilters
│   ├── utils/           # api, loadODAs, etc.
│   └── types/           # Tipos (Project)
├── server/              # Backend (Express + Prisma)
│   ├── prisma/          # schema e migrations
│   ├── routes/          # odas, auth, favorites, migration, bncc
│   └── index.ts
└── public/              # ObjetosDigitais.xlsx, ObjetosAudiovisual.xlsx, thumbs/
```

## Instalação e execução

### 1. Dependências

```bash
npm install
cd server && npm install && cd ..
```

### 2. Ambiente

Crie `server/.env`:

```env
DATABASE_URL="postgresql://..."   # ou file:./prisma/dev.db para SQLite
PORT=3001
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=sua-chave-secreta-longa-e-aleatoria
JWT_EXPIRES_IN=365d

# E-mail (Esqueci minha senha - token por e-mail). Sem isso, a opção "Esqueci minha senha" retorna erro.
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=senha-de-app-do-google
EMAIL_FROM=seu-email@gmail.com
APP_URL=http://localhost:3000
```

**Gmail:** em [Conta Google](https://myaccount.google.com/) → Segurança → Verificação em 2 etapas ativada → "Senhas de app" → gere uma senha e use em `SMTP_PASS`. Use `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`.

**Outros (Outlook, SendGrid, etc.):** use o host/porta do provedor e usuário/senha do SMTP.

Opcional na raiz (`.env`): `VITE_API_URL=http://localhost:3001/api`

### 3. Prisma

```bash
npm run prisma:generate
cd server && npx prisma migrate dev --name init
# ou, se o banco já existir: npx prisma db push
```

### 4. Rodar

**Terminal 1 – backend:**  
`npm run server:dev` → http://localhost:3001

**Terminal 2 – frontend:**  
`npm run dev` → http://localhost:3000

## Scripts (raiz)

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Frontend em desenvolvimento |
| `npm run build` | Build do frontend |
| `npm run server:dev` | Backend em desenvolvimento |
| `npm run server:build` / `server:start` | Build e start do backend |
| `npm run prisma:generate` | Gerar cliente Prisma |
| `npm run prisma:migrate` | Rodar migrações |
| `npm run prisma:studio` | Abrir Prisma Studio (http://localhost:5555) |
| `npm run test` | Testes (Vitest) |
| `npm run check:supabase` | Verificar conexão Supabase |

## API (resumo)

- **ODAs:** `GET/POST /api/odas`, `GET/PUT/DELETE /api/odas/:id`, `GET /api/odas/stats/count`
- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`, `GET/PATCH /api/auth/me`
- **Favoritos:** `GET/POST /api/users/me/favorites`, `DELETE /api/users/me/favorites/:projectId`
- **Migração:** `POST /api/migration/excel` (body: `{ "clearExisting": false }`), `GET /api/migration/status`
- **BNCC:** `GET /api/bncc`, `GET /api/bncc/:codigo`

## Planilhas Excel

- `public/ObjetosDigitais.xlsx` e `public/ObjetosAudiovisual.xlsx` são usadas na migração inicial (backend e, se a API falhar, fallback no frontend).
- Após migrar, o sistema funciona sem as planilhas; pode mantê-las como backup. Para migrar de novo: `POST /api/migration/excel`.

## Troubleshooting

- **Prisma / SSL:** Em redes com proxy, tente `npm config set strict-ssl false` antes de `npx prisma generate` (depois volte para `true`).
- **CORS:** Confira `CORS_ORIGIN` em `server/.env`.
- **Erros no console (Vimeo):** Mensagens como `net::ERR_BLOCKED_BY_CLIENT` vêm do player do Vimeo (analytics); o vídeo continua funcionando, pode ignorar ou desativar bloqueador no localhost.

## Documentação adicional

- `src/guidelines/Guidelines.md` – Diretrizes de design e componentes da interface.
