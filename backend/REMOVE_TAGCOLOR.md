# Remover coluna tagColor do banco de dados

A coluna `tagColor` foi removida do schema do Prisma. Agora as cores são calculadas dinamicamente no código através do arquivo `src/utils/odaColors.ts`.

## ⚠️ IMPORTANTE: Se você recebeu erro sobre tagColor não existir

Isso acontece porque o Prisma Client ainda está tentando acessar a coluna antiga. Siga estes passos:

1. **Pare o servidor backend** (Ctrl+C se estiver rodando)

2. **Sincronize o schema com o banco:**
   ```bash
   cd backend
   npx prisma db push --accept-data-loss
   ```

3. **Regenere o Prisma Client:**
   ```bash
   npx prisma generate
   ```

4. **Ou use o script automatizado:**
   ```bash
   npm run db:remove-tagcolor
   ```

## Passos normais (se não houver erro):

1. **Usar db push (desenvolvimento):**
   ```bash
   cd backend
   npm run db:push
   ```

2. **Ou gerar migração versionada:**
   ```bash
   cd backend
   npx prisma migrate dev --name remove_tagcolor
   ```

## O que foi removido:

- ✅ Campo `tagColor` do schema Prisma
- ✅ Todas as referências a `tagColor` no seed
- ✅ Referências no service de criação de ODAs
- ✅ Interfaces TypeScript no frontend
- ✅ Uso direto de `tagColor` nos componentes

## O que foi mantido:

- ✅ Funções de cores centralizadas em `src/utils/odaColors.ts`
- ✅ Compatibilidade com código existente (cores calculadas dinamicamente)

