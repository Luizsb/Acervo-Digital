# Por que usar Prisma com SQLite?

## 🎯 Vantagens do Prisma mesmo com SQLite

### 1. **Type-Safety em Tempo de Compilação**
O Prisma gera tipos TypeScript automaticamente baseados no seu schema. Isso significa:
- Autocompletar no seu editor
- Erros detectados antes de executar o código
- Refatoração segura

```typescript
// Com Prisma - Type-safe
const user = await prisma.user.findUnique({
  where: { email: "test@example.com" }
});
// user.email é tipado como string | null

// Sem Prisma - Sem type-safety
const user = await db.query("SELECT * FROM users WHERE email = ?", [email]);
// user.email pode ser qualquer coisa
```

### 2. **Migrations Versionadas**
- Histórico completo de mudanças no banco
- Fácil rollback se necessário
- Colaboração em equipe (todos têm o mesmo schema)
- Deploy consistente em diferentes ambientes

### 3. **Query Builder Intuitivo**
```typescript
// Prisma - Legível e type-safe
const odas = await prisma.oDA.findMany({
  where: {
    contentType: "Audiovisual",
    OR: [
      { title: { contains: "matemática" } },
      { tag: { contains: "matemática" } }
    ]
  },
  include: { favorites: true },
  orderBy: { createdAt: 'desc' },
  take: 10
});

// SQL direto - Mais verboso e propenso a erros
const odas = await db.query(`
  SELECT o.*, f.* 
  FROM ODA o
  LEFT JOIN Favorite f ON f.odaId = o.id
  WHERE o.contentType = ? 
    AND (o.title LIKE ? OR o.tag LIKE ?)
  ORDER BY o.createdAt DESC
  LIMIT 10
`, ["Audiovisual", "%matemática%", "%matemática%"]);
```

### 4. **Relacionamentos Automáticos**
```typescript
// Prisma - Relacionamentos automáticos
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    favorites: {
      include: { oda: true }
    }
  }
});
// user.favorites[0].oda está disponível automaticamente

// SQL direto - Você precisa fazer JOINs manualmente
```

### 5. **Validação Automática**
- Validação de tipos no schema
- Constraints de banco (unique, foreign keys)
- Validação de dados antes de inserir

### 6. **Prisma Studio**
Interface visual para visualizar e editar dados:
```bash
npm run db:studio
```

### 7. **Desenvolvimento Mais Rápido**
- Menos código boilerplate
- Menos erros de SQL
- Refatoração mais fácil
- Documentação automática (schema é a documentação)

## 📊 Comparação: Prisma vs SQL Direto

| Recurso | Prisma | SQL Direto |
|---------|--------|------------|
| Type-safety | ✅ Sim | ❌ Não |
| Autocompletar | ✅ Sim | ❌ Não |
| Migrations | ✅ Sim | ❌ Manual |
| Validação | ✅ Automática | ❌ Manual |
| Relacionamentos | ✅ Automático | ❌ JOINs manuais |
| Produtividade | ✅ Alta | ⚠️ Média |
| Curva de aprendizado | ✅ Baixa | ⚠️ Alta |

## 🚀 Scripts Disponíveis

### Desenvolvimento (Recomendado)
```bash
# Sincroniza schema com banco (sem criar arquivos de migração)
npm run db:push

# Ou use o script PowerShell
.\migrate-db.ps1
```

### Produção
```bash
# Cria migração versionada
npm run db:migrate

# Aplica migrações pendentes
npm run db:deploy
```

### Setup Inicial
```bash
# Push schema + gera client
npm run db:setup
```

## 💡 Quando usar cada comando?

- **`db:push`**: Desenvolvimento rápido, prototipagem
- **`db:migrate`**: Quando você quer versionar mudanças
- **`db:deploy`**: Em produção, para aplicar migrações
- **`db:setup`**: Primeira vez configurando o projeto

## 🔧 Resolvendo o Problema de Migração Travada

O problema ocorria porque `prisma migrate dev` esperava input interativo. Agora:

1. **Script atualizado** (`migrate-db.ps1`): Detecta mudanças e cria migração automaticamente
2. **Scripts npm atualizados**: Usam `--name auto` para evitar prompt
3. **Alternativa simples**: Use `npm run db:push` para desenvolvimento

## 📚 Conclusão

Prisma + SQLite é uma combinação poderosa:
- **SQLite**: Simples, portátil, rápido para pequeno/médio porte
- **Prisma**: Type-safety, produtividade, manutenibilidade

Você não precisa escolher entre simplicidade (SQLite) e produtividade (Prisma) - você tem ambos!

