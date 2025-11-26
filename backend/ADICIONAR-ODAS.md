# 📚 Adicionar ODAs para Teste

## ✅ 5 Novos ODAs Adicionados

Foram adicionados 5 novos ODAs ao arquivo de seed para testar a paginação:

1. **Inglês Divertido: Cores e Números** (Audiovisual - 1º ano)
2. **Educação Física: Movimentos e Coordenação** (Audiovisual - 2º ano)
3. **Música e Ritmo: Sons e Instrumentos** (OED - 3º ano)
4. **Matemática Prática: Medidas e Grandezas** (OED - 4º ano)
5. **Literatura Infantil: Fábulas e Contos** (Audiovisual - 5º ano)

## 🚀 Como Executar o Seed

### Opção 1: Seed Completo (Recomendado)
Isso vai **limpar** todos os ODAs existentes e criar 15 ODAs novos:

```powershell
cd backend
npm run db:seed
```

### Opção 2: Manter ODAs Existentes
Se você quiser manter os ODAs existentes, edite o arquivo `seed.ts` e comente as linhas que deletam:

```typescript
// await prisma.favorite.deleteMany();
// await prisma.oDA.deleteMany();
```

Depois execute:
```powershell
cd backend
npm run db:seed
```

## 📊 Resultado

Após executar o seed, você terá:
- **15 ODAs no total**
- **8 Audiovisuais**
- **7 OEDs**
- **2 páginas de paginação** (12 ODAs por página)

## 🧪 Testar Paginação

1. Execute o seed:
   ```powershell
   cd backend
   npm run db:seed
   ```

2. Inicie o servidor:
   ```powershell
   npm run dev
   ```

3. No frontend, você verá:
   - Primeira página: 12 ODAs
   - Segunda página: 3 ODAs
   - Controles de paginação funcionando
   - Contador "Mostrando 1 - 12 de 15 ODAs"

## ⚠️ Importante

- O seed **apaga todos os ODAs existentes** por padrão
- Se você tem dados importantes, faça backup primeiro
- Para manter dados existentes, edite o `seed.ts` antes de executar

