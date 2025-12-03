# 📁 Utils - Arquivos Utilitários

## 📋 Arquivos Atuais

### ✅ `api.ts`
Cliente API para comunicação com o backend.
- `fetchAllODAs()` - Buscar todos os ODAs
- `fetchODAById()` - Buscar ODA por ID
- `createODA()`, `updateODA()`, `deleteODA()` - CRUD
- `migrateExcel()` - Migrar planilha Excel
- `getMigrationStatus()` - Status da migração

### ✅ `curriculumColors.ts`
Funções auxiliares para componentes curriculares.
- `getComponentFullName()` - Nome completo do componente
- `getSegmentFullName()` - Nome completo do segmento
- `getMarcaFullName()` - Nome completo da marca
- `getCurriculumColor()` - Cor do componente
- `sortSegments()` - Ordenar segmentos

### ✅ `loadODAs.ts`
Carrega ODAs do backend (API).
- `loadODAsFromDatabase()` - Carrega todos os ODAs
- `loadODAsByContentType()` - Carrega por tipo

### ⚠️ `importODAs.ts`
Importação de ODAs da planilha Excel (fallback).
- Usado apenas como fallback se a API falhar
- Pode ser removido se não quiser fallback

---

## 🗑️ Arquivos Removidos

- ❌ `database.ts` - Sistema antigo com sql.js (removido)
- ❌ `migrateExcelToDB.ts` - Migração antiga (removida)

Esses arquivos foram removidos porque agora usamos o backend com Prisma.

---

## 📝 Notas

- Todos os dados agora vêm do backend via API
- O fallback para planilha ainda existe em `loadODAs.ts` mas pode ser removido
- `sql.js` não é mais necessário no frontend

