# 📤 Como Subir o Banco de Dados para o Render

Como você está usando SQLite e já tem os dados (ODAs e BNCC) no banco local, há algumas opções para subir para o Render.

## ⚠️ Limitação do SQLite no Render

O SQLite no Render tem uma limitação importante:
- O sistema de arquivos é **efêmero** (pode ser perdido entre deploys)
- O banco pode ser **resetado** quando o serviço reinicia

## ✅ Solução Recomendada: Migrar via API

A melhor forma é migrar os dados via API após o deploy:

### Passo 1: Deploy do Backend

1. Faça o deploy do backend no Render
2. Aguarde o deploy concluir
3. Verifique se o servidor está rodando

### Passo 2: Migrar BNCC Primeiro

Execute a migração BNCC:

```bash
curl -X POST https://seu-backend.onrender.com/api/bncc/migrate
```

Ou usando Postman/Insomnia:
- **Método**: `POST`
- **URL**: `https://seu-backend.onrender.com/api/bncc/migrate`
- **Body**: `{ "clearExisting": false }`

### Passo 3: Migrar ODAs

Depois, migre os ODAs:

```bash
curl -X POST https://seu-backend.onrender.com/api/migration/excel
```

Ou usando Postman/Insomnia:
- **Método**: `POST`
- **URL**: `https://seu-backend.onrender.com/api/migration/excel`
- **Body**: `{ "clearExisting": false }`

## 🔄 Alternativa: Script de Seed Automático

Se quiser automatizar, podemos criar um script que faz tudo de uma vez. Mas primeiro vamos testar a solução manual.

## 📋 Checklist

- [ ] Backend deployado no Render
- [ ] Servidor rodando (verificar logs)
- [ ] Arquivo `bncc.db` está no repositório (em `public/bncc.db`)
- [ ] Arquivo `ObjetosDigitais.xlsx` está no repositório (em `public/ObjetosDigitais.xlsx`)
- [ ] Executar migração BNCC primeiro
- [ ] Executar migração ODAs depois
- [ ] Verificar se os dados foram importados

## 🔍 Verificar se Funcionou

### Verificar BNCC:
```bash
curl https://seu-backend.onrender.com/api/bncc
```

Deve retornar uma lista de habilidades BNCC.

### Verificar ODAs:
```bash
curl https://seu-backend.onrender.com/api/odas
```

Deve retornar uma lista de ODAs.

### Verificar Status:
```bash
curl https://seu-backend.onrender.com/api/migration/status
```

## ⚠️ Problema: Dados Perdidos Após Reiniciar

Se os dados forem perdidos após reiniciar o serviço no Render (comum com SQLite), você tem duas opções:

### Opção 1: Re-executar as Migrações

Sempre que o banco for resetado, execute novamente:
1. `POST /api/bncc/migrate`
2. `POST /api/migration/excel`

### Opção 2: Migrar para PostgreSQL (Recomendado para Produção)

PostgreSQL no Render é **gratuito** e **persistente**:

1. No Render, crie um **PostgreSQL Database**
2. Copie a **Internal Database URL**
3. Atualize o `DATABASE_URL` no backend
4. Atualize o `schema.prisma` para usar `provider = "postgresql"`
5. Execute as migrations
6. Migre os dados via API

## 🚀 Script Automático (Opcional)

Se quiser, posso criar um script que:
1. Verifica se há dados no banco
2. Se não houver, executa as migrações automaticamente
3. Isso pode ser executado no `startCommand` do Render

Quer que eu crie esse script?

