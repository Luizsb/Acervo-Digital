# Migração de Habilidades BNCC

As habilidades BNCC precisam ser migradas do arquivo `public/bncc.db` para o banco de dados do servidor.

## 🔄 Migração Automática

O servidor verifica automaticamente se há dados BNCC ao iniciar. Se não houver, você verá um aviso nos logs.

## 📝 Migração Manual

### Opção 1: Via API (Recomendado)

Após o servidor estar rodando, faça uma requisição POST:

```bash
curl -X POST http://localhost:3001/api/bncc/migrate
```

Ou usando o Postman/Insomnia:
- **Método**: POST
- **URL**: `http://localhost:3001/api/bncc/migrate`
- **Body** (opcional): `{ "clearExisting": false }`

### Opção 2: Via Script NPM

No diretório `server/`, execute:

```bash
npm run migrate:bncc
```

## ✅ Verificar Migração

Para verificar se as habilidades foram migradas:

```bash
curl http://localhost:3001/api/bncc
```

Ou acesse: `http://localhost:3001/api/bncc` no navegador.

## 🚀 No Render

No Render, após o deploy, você pode:

1. **Via API**: Faça uma requisição POST para `https://seu-backend.onrender.com/api/bncc/migrate`
2. **Via Logs**: Verifique os logs do servidor - ele avisará se não houver dados BNCC

## 📊 Estrutura dos Dados

O banco `bncc.db` deve conter uma tabela com as seguintes colunas:
- `codigo` (obrigatório) - Código BNCC (ex: "EF15LP15")
- `habilidade` (opcional) - Descrição da habilidade
- `descricao` (opcional) - Descrição detalhada
- `componente` (opcional) - Componente curricular
- `ano` (opcional) - Ano/série

## ⚠️ Troubleshooting

### Banco BNCC não encontrado

O servidor procura o arquivo `bncc.db` nos seguintes caminhos:
- `../public/bncc.db` (relativo ao diretório do servidor)
- `./public/bncc.db` (no diretório atual)
- `../../public/bncc.db` (dois níveis acima)

Certifique-se de que o arquivo está em `public/bncc.db` na raiz do projeto.

### Nenhum registro encontrado

Verifique se o banco `bncc.db` contém dados. Você pode abrir o arquivo com um visualizador SQLite para verificar.

### Erro de permissão

Certifique-se de que o servidor tem permissão para ler o arquivo `bncc.db`.

