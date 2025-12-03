# 📁 Arquivos em src/utils/ - Status

## ✅ MANTER (Necessários)

### `api.ts` ⭐ NOVO
- **Função:** Comunicação com backend API
- **Status:** ESSENCIAL - Usado pelo frontend para buscar dados do backend
- **Usado em:** `loadODAs.ts`

### `curriculumColors.ts` ✅
- **Função:** Funções auxiliares para cores e nomes de componentes curriculares
- **Status:** ESSENCIAL - Usado em vários componentes
- **Usado em:** 
  - `App.tsx`
  - `ProjectDetailsPage.tsx`
  - `FilterSidebar.tsx`
  - `ProjectCard.tsx`
  - `ProjectListItem.tsx`
  - `ProjectModal.tsx`

### `loadODAs.ts` ✅ ATUALIZADO
- **Função:** Carrega ODAs da API backend
- **Status:** ESSENCIAL - Usado pelo App.tsx
- **Usado em:** `App.tsx`

### `importODAs.ts` ⚠️ FALLBACK
- **Função:** Importa ODAs da planilha Excel (fallback)
- **Status:** MANTIDO como fallback - Usado apenas se a API falhar
- **Usado em:** `loadODAs.ts` (como fallback)

---

## ❌ REMOVER (Não são mais necessários)

### `database.ts` ❌ ANTIGO
- **Função:** Sistema antigo com sql.js e localStorage
- **Status:** OBSOLETO - Substituído pelo backend com Prisma
- **Motivo:** Agora usamos API backend, não mais localStorage
- **Ação:** PODE SER REMOVIDO

### `migrateExcelToDB.ts` ❌ ANTIGO
- **Função:** Migração antiga para localStorage
- **Status:** OBSOLETO - A migração agora é feita no backend
- **Motivo:** Usa `database.ts` que não é mais usado
- **Ação:** PODE SER REMOVIDO

---

## 📝 Resumo

**Arquivos para manter:**
- ✅ `api.ts` - Comunicação com backend
- ✅ `curriculumColors.ts` - Funções auxiliares
- ✅ `loadODAs.ts` - Carregamento de dados
- ⚠️ `importODAs.ts` - Fallback (pode ser removido se não quiser fallback)

**Arquivos para remover:**
- ❌ `database.ts` - Sistema antigo
- ❌ `migrateExcelToDB.ts` - Migração antiga

---

## 🗑️ Como remover

```bash
# Remover arquivos obsoletos
rm src/utils/database.ts
rm src/utils/migrateExcelToDB.ts
```

Ou manualmente pelo explorador de arquivos.

