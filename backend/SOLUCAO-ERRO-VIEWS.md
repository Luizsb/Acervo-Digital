# 🔧 Solução: Erro no Contador de Visualizações

## ❌ Problema

Erro 500 ao tentar incrementar visualizações:
- `POST /api/odas/:id/view 500 (Internal Server Error)`
- Prisma Studio também dando erro

## 🔍 Causa

O Prisma Client está corrompido ou não foi regenerado corretamente após adicionar o modelo `View`.

## ✅ Solução

### Passo 1: Corrigir Prisma Client

Execute o script de correção:

```powershell
cd backend
npm run db:fix-client
```

Ou manualmente:

```powershell
cd backend

# 1. Fechar todos os processos Node
Get-Process -Name "node" | Stop-Process -Force

# 2. Remover Prisma Client antigo
Remove-Item node_modules\.prisma -Recurse -Force -ErrorAction SilentlyContinue

# 3. Remover locks do SQLite
Remove-Item prisma\dev.db-wal -ErrorAction SilentlyContinue
Remove-Item prisma\dev.db-shm -ErrorAction SilentlyContinue

# 4. Regenerar Prisma Client
npx prisma generate
```

### Passo 2: Sincronizar Schema com Banco

Se o banco ainda não tiver a tabela `View`, sincronize:

```powershell
cd backend
npm run db:push
```

Isso vai criar a tabela `View` no banco se ela não existir.

### Passo 3: Reiniciar Servidor

```powershell
cd backend
npm run dev
```

### Passo 4: Testar

1. Abra o frontend: http://localhost:5173
2. Clique em um ODA
3. Verifique o console do navegador - não deve ter mais erro 500
4. Verifique o console do backend - deve mostrar logs de visualização

## 🔍 Verificar se Funcionou

### No Backend (Terminal)
Você deve ver logs como:
```
[Views] Visualização já registrada hoje para ODA ...
```
ou
```
[Views] ✅ Visualização incrementada
```

### No Frontend (Console do Navegador)
Não deve ter mais:
- ❌ `POST .../view 500 (Internal Server Error)`
- ❌ `Error: Failed to increment view`

Deve ter:
- ✅ `[Views] ✅ Visualização incrementada com sucesso`

### No Banco de Dados

Abra Prisma Studio:
```powershell
cd backend
npm run db:studio
```

Verifique:
1. Tabela `View` existe
2. Registros estão sendo criados quando você visualiza um ODA
3. Campo `viewedAt` tem a data/hora correta

## 🐛 Se Ainda Não Funcionar

### Verificar Erro Real no Backend

O controller agora mostra o erro real. Verifique o terminal do backend para ver a mensagem de erro completa.

### Verificar Schema

Confirme que o modelo `View` está no schema:

```powershell
cd backend
Get-Content prisma\schema.prisma | Select-String "model View"
```

Deve mostrar:
```prisma
model View {
  id        String   @id @default(uuid())
  userId    String?
  sessionId String?
  odaId     String
  viewedAt  DateTime @default(now())
  ...
}
```

### Verificar Banco

Confirme que a tabela existe no banco:

```powershell
cd backend
npx prisma db push
```

## 📝 Notas

- O erro no Prisma Studio também será resolvido após regenerar o client
- Sempre feche o servidor antes de regenerar o Prisma Client
- O script `db:fix-client` faz tudo automaticamente

