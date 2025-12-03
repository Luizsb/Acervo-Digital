# 🚀 Como Executar o Seed Automático

## Opção 2: Seed Automático via API

Execute este comando para migrar **tanto BNCC quanto ODAs** de uma vez:

### Usando PowerShell (Windows):

```powershell
Invoke-RestMethod -Uri "https://acervo-digital-xbp3.onrender.com/api/migration/seed" -Method POST -ContentType "application/json"
```

**OU** se preferir usar curl.exe (se tiver instalado):

```powershell
curl.exe -X POST https://acervo-digital-xbp3.onrender.com/api/migration/seed
```

### Usando curl (Linux/Mac/Terminal):

```bash
curl -X POST https://acervo-digital-xbp3.onrender.com/api/migration/seed
```

### Usando Postman/Insomnia:

1. **Método**: `POST`
2. **URL**: `https://acervo-digital-xbp3.onrender.com/api/migration/seed`
3. **Headers**: 
   - `Content-Type: application/json`
4. **Body**: (pode deixar vazio ou `{}`)

### Usando o Navegador (JavaScript Console):

Abra o console do navegador (F12) e execute:

```javascript
fetch('https://acervo-digital-xbp3.onrender.com/api/migration/seed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})
.then(r => r.json())
.then(data => {
  console.log('✅ Seed executado:', data);
  console.log(`📊 BNCC: ${data.totalBNCC} habilidades`);
  console.log(`📊 ODAs: ${data.totalODAs} objetos`);
})
.catch(error => console.error('❌ Erro:', error));
```

## ✅ Verificar se Funcionou

### Verificar BNCC:

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "https://acervo-digital-xbp3.onrender.com/api/bncc"
```

**Linux/Mac:**
```bash
curl https://acervo-digital-xbp3.onrender.com/api/bncc
```

### Verificar ODAs:

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "https://acervo-digital-xbp3.onrender.com/api/odas"
```

**Linux/Mac:**
```bash
curl https://acervo-digital-xbp3.onrender.com/api/odas
```

### Verificar Status Completo:

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "https://acervo-digital-xbp3.onrender.com/api/migration/status"
```

**Linux/Mac:**
```bash
curl https://acervo-digital-xbp3.onrender.com/api/migration/status
```

## 📋 O que o Seed Faz

1. ✅ Verifica se há dados BNCC no banco
2. ✅ Se não houver, migra do arquivo `public/bncc.db`
3. ✅ Verifica se há ODAs no banco
4. ✅ Se não houver, migra do arquivo `public/ObjetosDigitais.xlsx`
5. ✅ Valida códigos BNCC antes de criar ODAs (evita erro de foreign key)

## ⚠️ Importante

- O seed só migra se o banco estiver **vazio**
- Se já houver dados, ele não sobrescreve
- O processo pode demorar alguns minutos dependendo da quantidade de dados
- Verifique os logs do Render para acompanhar o progresso

## 🔄 Se Precisar Re-executar

Se quiser limpar e re-executar tudo:

1. Primeiro, limpe o banco (se necessário):
   ```bash
   # Isso não está disponível via API por segurança
   # Você precisaria fazer manualmente ou via Prisma Studio
   ```

2. Depois execute o seed novamente:
   ```bash
   curl -X POST https://acervo-digital-xbp3.onrender.com/api/migration/seed
   ```

## 🐛 Troubleshooting

### Erro: "Planilha não encontrada"
- Verifique se `public/ObjetosDigitais.xlsx` está no repositório
- Verifique se o arquivo foi commitado no Git

### Erro: "Banco BNCC não encontrado"
- Verifique se `public/bncc.db` está no repositório
- Verifique se o arquivo foi commitado no Git

### Erro: "Foreign key constraint violated"
- Isso não deve mais acontecer, pois o seed valida os códigos BNCC antes
- Se acontecer, execute primeiro: `POST /api/bncc/migrate`
- Depois execute: `POST /api/migration/excel`

