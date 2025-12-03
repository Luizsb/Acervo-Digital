# 🚀 Configurar Habilidades BNCC no Render

## Problema

As habilidades BNCC não aparecem no Render porque a migração precisa ser executada manualmente após o deploy.

## ✅ Solução: Executar Migração via API

Após o deploy do backend no Render, execute a migração fazendo uma requisição POST:

### Opção 1: Usando curl (Terminal)

```bash
curl -X POST https://seu-backend.onrender.com/api/bncc/migrate
```

Substitua `seu-backend.onrender.com` pela URL real do seu backend no Render.

### Opção 2: Usando Postman/Insomnia

1. **Método**: `POST`
2. **URL**: `https://seu-backend.onrender.com/api/bncc/migrate`
3. **Headers**: 
   - `Content-Type: application/json`
4. **Body** (opcional):
   ```json
   {
     "clearExisting": false
   }
   ```

### Opção 3: Usando o navegador (não recomendado, mas funciona)

Acesse a URL no navegador (mas isso fará um GET, não POST). Para POST, use uma extensão como "REST Client" ou faça via JavaScript no console:

```javascript
fetch('https://seu-backend.onrender.com/api/bncc/migrate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ clearExisting: false })
})
.then(r => r.json())
.then(console.log);
```

## ✅ Verificar se Funcionou

Após executar a migração, verifique se as habilidades foram importadas:

```bash
curl https://seu-backend.onrender.com/api/bncc
```

Ou acesse no navegador: `https://seu-backend.onrender.com/api/bncc`

Você deve ver uma lista de habilidades BNCC com estrutura:
```json
{
  "data": [
    {
      "id": 1,
      "codigo": "EF05LP01",
      "habilidade": "Grafar palavras utilizando regras...",
      ...
    }
  ],
  "total": 1234
}
```

## 🔍 Verificar Logs no Render

1. Acesse o painel do Render
2. Vá em **Logs** do serviço backend
3. Procure por mensagens como:
   - `✅ Migração BNCC concluída: X habilidades importadas`
   - `⚠️ Nenhum dado BNCC encontrado no banco`
   - `⚠️ Banco BNCC não encontrado`

## ⚠️ Troubleshooting

### Erro: "Banco BNCC não encontrado"

Isso significa que o arquivo `bncc.db` não está sendo encontrado. Verifique:

1. O arquivo `public/bncc.db` está commitado no Git?
2. O arquivo está na raiz do projeto (não dentro de `server/`)?

**Solução**: Certifique-se de que o arquivo está em `public/bncc.db` na raiz do repositório.

### Erro: "Nenhum registro encontrado"

O arquivo `bncc.db` existe mas está vazio ou não tem a estrutura correta.

**Solução**: Verifique o arquivo localmente com um visualizador SQLite.

### Migração executa mas não aparece no frontend

1. Verifique se o frontend está fazendo requisições para o backend correto
2. Verifique se os ODAs têm o campo `codigoBncc` preenchido
3. Verifique se a relação entre ODA e BNCC está funcionando (foreign key)

## 📝 Notas Importantes

- A migração só precisa ser executada **uma vez** após o deploy
- Se você fizer um novo deploy, os dados BNCC **permanecem** no banco (a menos que você limpe o banco)
- Se quiser reimportar, use `{ "clearExisting": true }` no body da requisição

