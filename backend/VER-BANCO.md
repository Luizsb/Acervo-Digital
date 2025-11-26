# 👀 Como Visualizar o Banco de Dados

## 🎯 Opção 1: Prisma Studio (Mais Fácil - Recomendado)

Interface visual integrada do Prisma. Permite ver e editar dados diretamente no navegador.

### Como usar:

```powershell
cd backend
npm run db:studio
```

Isso vai:
1. Abrir automaticamente no navegador em: **http://localhost:5555**
2. Mostrar todas as tabelas: `User`, `ODA`, `Favorite`, `View`
3. Permitir visualizar, editar, adicionar e deletar registros
4. Mostrar relacionamentos entre tabelas

### O que você pode fazer:
- ✅ Ver todos os ODAs cadastrados
- ✅ Ver usuários e seus favoritos
- ✅ Ver registros de visualizações (tabela `View`)
- ✅ Editar dados diretamente
- ✅ Adicionar novos registros
- ✅ Filtrar e buscar dados

### ⚠️ Importante:
- Feche o Prisma Studio antes de rodar o servidor (para evitar "database is locked")
- Ou use em um terminal separado enquanto o servidor está rodando (mas pode dar conflito)

---

## 🛠️ Opção 2: DB Browser for SQLite (Ferramenta Externa)

Ferramenta desktop gratuita para visualizar bancos SQLite.

### Instalação:
1. Baixe em: https://sqlitebrowser.org/
2. Instale o aplicativo

### Como usar:
1. Abra o DB Browser for SQLite
2. Clique em "Open Database"
3. Navegue até: `backend\prisma\dev.db`
4. Explore as tabelas na aba "Browse Data"

### Vantagens:
- ✅ Interface gráfica completa
- ✅ Permite executar SQL diretamente
- ✅ Exportar dados para CSV/JSON
- ✅ Não interfere com o servidor

---

## 💻 Opção 3: SQLite CLI (Linha de Comando)

Para quem prefere linha de comando.

### Como usar:

```powershell
cd backend\prisma

# Abrir banco
sqlite3 dev.db

# Comandos úteis:
.tables                    # Listar tabelas
.schema                    # Ver estrutura
SELECT * FROM ODA;         # Ver todos os ODAs
SELECT * FROM View;        # Ver visualizações
SELECT * FROM User;        # Ver usuários
.quit                      # Sair
```

### Instalar SQLite CLI:
- Windows: Baixe de https://www.sqlite.org/download.html
- Ou use via npx: `npx sqlite3 backend/prisma/dev.db`

---

## 📊 Opção 4: Via Código (Node.js)

Script para consultar o banco programaticamente.

### Já existe um script:
```powershell
cd backend
npm run db:query
```

Ou edite `backend/query-db.js` para fazer consultas customizadas.

---

## 🎯 Recomendação

**Para desenvolvimento diário:** Use **Prisma Studio** (`npm run db:studio`)
- Mais rápido
- Interface amigável
- Integrado com o projeto

**Para análise avançada:** Use **DB Browser for SQLite**
- Mais recursos
- Não interfere com o servidor
- Permite SQL complexo

---

## 📝 Exemplo: Ver Visualizações

No Prisma Studio:
1. Execute `npm run db:studio`
2. Clique na tabela `View`
3. Veja todos os registros de visualizações
4. Filtre por `odaId` para ver visualizações de um ODA específico
5. Veja `viewedAt` para saber quando foi visualizado

---

## ⚠️ Dicas

- **Não use Prisma Studio e servidor ao mesmo tempo** (pode dar "database is locked")
- **Feche o Prisma Studio** antes de rodar migrações
- **O banco fica em:** `backend/prisma/dev.db`
- **Para backup:** Copie o arquivo `dev.db`

