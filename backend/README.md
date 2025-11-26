# Backend - Acervo Digital API

API RESTful para o Acervo Digital de Objetos Digitais de Aprendizagem (ODAs).

## 🚀 Tecnologias

- **Node.js** + **Express** - Framework web
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados embutido ([sqlite.org](https://sqlite.org/))
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- **Não é necessário instalar SQLite separadamente** - ele é gerenciado pelo Prisma
image.png
## 🔧 Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3001
CORS_ORIGIN="http://localhost:5173"
```

3. **Configurar banco de dados (escolha uma opção):**

   **Opção A - Desenvolvimento rápido (recomendado):**
   ```bash
   npm run db:setup
   # ou usando PowerShell:
   .\migrate-db.ps1
   ```
   Este comando sincroniza o schema com o banco sem criar arquivos de migração.

   **Opção B - Migrações versionadas (para produção):**
   ```bash
   npm run db:migrate
   # ou usando PowerShell:
   .\migrate-db-versioned.ps1
   ```
   Este comando cria arquivos de migração versionados.

4. **Popular banco com dados de exemplo (opcional):**
```bash
npm run db:seed
```

## 🏃 Executar

**Desenvolvimento:**
```bash
npm run dev
```

**Produção:**
```bash
npm run build
npm start
```

O servidor estará rodando em `http://localhost:3001`

## 📚 Endpoints da API

### ODAs

- `GET /api/odas` - Listar ODAs (com filtros e busca)
- `GET /api/odas/:id` - Obter ODA específico
- `POST /api/odas` - Criar novo ODA
- `PUT /api/odas/:id` - Atualizar ODA
- `DELETE /api/odas/:id` - Deletar ODA
- `GET /api/odas/:id/related` - Obter ODAs relacionados
- `POST /api/odas/:id/view` - Incrementar visualizações

### Usuários

- `POST /api/users/register` - Registrar novo usuário
- `POST /api/users/login` - Login
- `GET /api/users/me` - Obter dados do usuário (requer autenticação)

### Favoritos

- `GET /api/favorites` - Listar favoritos do usuário (requer autenticação)
- `POST /api/favorites/:odaId` - Adicionar aos favoritos (requer autenticação)
- `DELETE /api/favorites/:odaId` - Remover dos favoritos (requer autenticação)
- `GET /api/favorites/check/:odaId` - Verificar se está nos favoritos (requer autenticação)

## 🔍 Filtros e Busca

O endpoint `GET /api/odas` suporta os seguintes query parameters:

- `search` - Busca textual (título, descrição, BNCC, etc)
- `contentType` - Tipo de conteúdo ("Audiovisual", "OED", "Todos")
- `anos` - Array de anos/séries (ex: `?anos=1º ano&anos=2º ano`)
- `tags` - Array de componentes curriculares
- `bnccCodes` - Array de códigos BNCC
- `livros` - Array de nomes de livros
- `categorias` - Array de categorias
- `marcas` - Array de marcas (CQT, SAE, SPE)
- `tipoObjeto` - Array de tipos de objeto (para OED)
- `videoCategory` - Array de categorias de vídeo (para Audiovisual)
- `samr` - Array de níveis SAMR
- `volumes` - Array de volumes
- `page` - Número da página (padrão: 1)
- `limit` - Itens por página (padrão: 50)

**Exemplo:**
```
GET /api/odas?contentType=Audiovisual&anos=1º ano&tags=Matemática&search=números&page=1&limit=20
```

## 🔐 Autenticação

Para endpoints protegidos, inclua o token JWT no header:

```
Authorization: Bearer <token>
```

## 🗄️ Estrutura do Banco de Dados

- **User** - Usuários do sistema
- **ODA** - Objetos Digitais de Aprendizagem
- **Favorite** - Relação entre usuários e ODAs favoritos

### 📝 Nota sobre SQLite

Este projeto usa [SQLite](https://sqlite.org/) como banco de dados. SQLite é uma excelente escolha porque:

- ✅ **Zero configuração** - Não precisa de servidor separado
- ✅ **Portátil** - O banco é um único arquivo (`dev.db`)
- ✅ **Rápido** - Ideal para aplicações de pequeno a médio porte
- ✅ **Confiável** - Usado em milhões de aplicações
- ✅ **Fácil backup** - Basta copiar o arquivo `.db`

**Arrays JSON**: Como SQLite não suporta arrays nativos, campos como `tags`, `learningObjectives`, etc. são armazenados como strings JSON e convertidos automaticamente pela aplicação.

## 🛠️ Comandos Úteis

```bash
# Abrir Prisma Studio (interface visual do banco)
npm run db:studio

# Sincronizar schema com banco (desenvolvimento)
npm run db:push

# Criar migração versionada
npm run db:migrate

# Aplicar migrações pendentes (produção)
npm run db:deploy

# Setup completo (push + generate)
npm run db:setup

# Gerar Prisma Client
npm run db:generate

# Resetar banco de dados (CUIDADO! Apaga todos os dados)
npx prisma migrate reset
```

### 🔧 Scripts PowerShell

- **`migrate-db.ps1`**: Sincroniza schema (desenvolvimento) - não trava
- **`migrate-db-versioned.ps1`**: Cria migração versionada com nome automático

### ❓ Problemas Comuns

**Problema 1: Migração travando pedindo nome**
- Use `npm run db:push` (desenvolvimento)
- Ou `.\migrate-db.ps1` (PowerShell)
- Veja `PRISMA_SQLITE.md` para mais detalhes

**Problema 2: "database is locked"**
Este erro ocorre quando outro processo está usando o banco. Soluções:

1. **Feche processos que podem estar usando o banco:**
   - Servidor backend (`npm run dev`)
   - Prisma Studio (`npm run db:studio`)
   - Qualquer outro processo Node

2. **Use o script de correção:**
   ```powershell
   npm run db:fix-lock
   # ou diretamente:
   .\fix-db-lock.ps1
   ```

3. **Solução manual:**
   - Feche todos os processos Node
   - Delete arquivos de lock: `prisma\dev.db-wal` e `prisma\dev.db-shm` (se existirem)
   - Execute: `npm run db:generate`

## 📝 Próximos Passos

- [ ] Validação de dados com Zod
- [ ] Upload de imagens/vídeos
- [ ] Sistema de permissões (admin/user)
- [ ] Cache com Redis
- [ ] Rate limiting
- [ ] Documentação Swagger/OpenAPI
- [ ] Testes automatizados

