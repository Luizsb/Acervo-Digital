# Migração para SQLite - Guia Completo

Este documento explica as mudanças feitas para migrar de PostgreSQL para SQLite.

## 🔄 Mudanças Realizadas

### 1. Schema Prisma (`prisma/schema.prisma`)

**Antes (PostgreSQL):**
```prisma
datasource db {
  provider = "postgresql"
  url      = env(DATABASE_URL)
}

model ODA {
  tags              String[] // Array nativo
  learningObjectives String[] // Array nativo
  // ...
  @@fulltext([title, description, bnccDescription])
}
```

**Depois (SQLite):**
```prisma
datasource db {
  provider = "sqlite"
  url      = env(DATABASE_URL)
}

model ODA {
  tags              String @default("[]") // JSON string
  learningObjectives String @default("[]") // JSON string
  // ...
  // Removido @@fulltext (não suportado no SQLite)
}
```

### 2. Variáveis de Ambiente

**Antes:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/acervo_digital?schema=public"
```

**Depois:**
```env
DATABASE_URL="file:./dev.db"
```

### 3. Serviço de ODAs (`src/services/oda.service.ts`)

Adicionadas funções helper para converter entre arrays e JSON:

```typescript
const arrayToJson = (arr: string[] | undefined): string => {
  return JSON.stringify(arr || []);
};

const jsonToArray = (json: string | null | undefined): string[] => {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
};

const transformODA = (oda: any) => {
  return {
    ...oda,
    tags: jsonToArray(oda.tags),
    learningObjectives: jsonToArray(oda.learningObjectives),
    pedagogicalResources: jsonToArray(oda.pedagogicalResources),
    technicalRequirements: jsonToArray(oda.technicalRequirements),
  };
};
```

### 4. Filtros

**Filtro de Tags:**
- PostgreSQL: `where.tags = { hasSome: filters.tags }`
- SQLite: `where.tags = { contains: '"tag"' }` (busca no JSON string)

**Busca Textual:**
- PostgreSQL: `{ contains: text, mode: 'insensitive' }`
- SQLite: `{ contains: text }` (SQLite já é case-insensitive por padrão)

## ✅ Vantagens do SQLite

1. **Zero Configuração** - Não precisa instalar ou configurar servidor
2. **Portátil** - Banco é um único arquivo
3. **Rápido** - Ideal para aplicações de pequeno a médio porte
4. **Fácil Backup** - Basta copiar o arquivo `.db`
5. **Desenvolvimento Simplificado** - Perfeito para desenvolvimento local

## 📝 Limitações do SQLite

1. **Sem Arrays Nativos** - Arrays são armazenados como JSON strings
2. **Sem Full-Text Search Avançado** - Removido `@@fulltext` (mas busca com `contains` funciona)
3. **Sem Concorrência Alta** - Não ideal para aplicações com muitas escritas simultâneas
4. **Sem Tipos Avançados** - Alguns tipos do PostgreSQL não estão disponíveis

## 🚀 Como Usar

1. **Criar arquivo `.env`:**
```bash
cp env.example .env
```

2. **Executar migrações:**
```bash
npm run db:migrate
npm run db:generate
```

3. **Popular com dados (opcional):**
```bash
npm run db:seed
```

O arquivo `dev.db` será criado automaticamente na pasta `backend/`.

## 🔍 Verificar Banco de Dados

Use o Prisma Studio para visualizar os dados:

```bash
npm run db:studio
```

Ou use ferramentas como:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- [SQLite Viewer](https://sqliteviewer.app/)

## 📦 Backup

Para fazer backup do banco, simplesmente copie o arquivo:

```bash
cp dev.db backup/dev.db.backup
```

## 🔄 Migrar Dados Existentes

Se você tinha dados no PostgreSQL e quer migrar para SQLite:

1. Exportar dados do PostgreSQL (JSON ou CSV)
2. Criar script de migração que converte arrays para JSON
3. Importar usando o seed ou script customizado

## 📚 Referências

- [SQLite Official Site](https://sqlite.org/)
- [Prisma SQLite Guide](https://www.prisma.io/docs/concepts/database-connectors/sqlite)
- [SQLite vs PostgreSQL](https://www.prisma.io/dataguide/types/relational/comparing-sqlite-postgresql-and-mysql)

