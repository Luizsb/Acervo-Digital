# 🔧 Troubleshooting - Resolução de Problemas

## ❌ Erro: "database is locked"

### Causa
O SQLite bloqueia o banco quando está em uso. Isso acontece quando:
- O servidor backend está rodando
- O Prisma Studio está aberto
- Outro processo está acessando o banco

### Solução Rápida

1. **Feche todos os processos:**
   ```powershell
   # Pare o servidor (Ctrl+C no terminal onde está rodando)
   # Feche o Prisma Studio (se estiver aberto)
   ```

2. **Execute o script de correção:**
   ```powershell
   npm run db:fix-lock
   ```

3. **Ou manualmente:**
   ```powershell
   # Remover arquivos de lock (se existirem)
   Remove-Item prisma\dev.db-wal -ErrorAction SilentlyContinue
   Remove-Item prisma\dev.db-shm -ErrorAction SilentlyContinue
   
   # Gerar apenas o Prisma Client (sem fazer push)
   npm run db:generate
   ```

### Se ainda não funcionar

1. **Feche TODOS os processos Node:**
   ```powershell
   Get-Process -Name "node" | Stop-Process -Force
   ```

2. **Aguarde 2-3 segundos**

3. **Tente novamente:**
   ```powershell
   npm run db:generate
   ```

---

## ❌ Erro: "Property 'view' does not exist"

### Causa
O Prisma Client não foi regenerado após adicionar o modelo `View` no schema.

### Solução
```powershell
# Certifique-se de que o servidor está parado
npm run db:generate
```

---

## ❌ Erro: "Migration name required"

### Causa
O `prisma migrate dev` está esperando input interativo.

### Solução
Use uma das opções:
- `npm run db:push` (desenvolvimento, não cria arquivos de migração)
- `npm run db:migrate` (usa nome automático)
- `.\migrate-db.ps1` (script PowerShell)

---

## ✅ Verificar se está funcionando

Após regenerar o Prisma Client, verifique:

1. **Erros de TypeScript sumiram?**
   - Abra `backend/src/services/oda.service.ts`
   - Não deve haver erros em `tx.view`

2. **Servidor inicia sem erros?**
   ```powershell
   npm run dev
   ```

3. **Prisma Studio funciona?**
   ```powershell
   npm run db:studio
   ```

---

## 📞 Ainda com problemas?

1. Verifique se o arquivo `.env` existe e está configurado corretamente
2. Verifique se o banco `prisma/dev.db` existe
3. Tente deletar `node_modules/.prisma` e executar `npm run db:generate` novamente

