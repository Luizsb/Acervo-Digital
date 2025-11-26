# Acervo Digital

Sistema de gerenciamento de Objetos Digitais de Aprendizagem (ODAs) desenvolvido para facilitar o acesso e organização de recursos educacionais digitais.

## 📋 Sobre o Projeto

O Acervo Digital é uma plataforma web completa que permite:
- Buscar e filtrar ODAs por múltiplos critérios
- Visualizar detalhes completos de cada ODA
- Gerenciar favoritos pessoais
- Controle de visualizações
- Interface responsiva e moderna

## 🚀 Tecnologias

### Frontend
- **React** + **TypeScript**
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones

### Backend
- **Node.js** + **Express**
- **TypeScript**
- **Prisma** - ORM
- **SQLite** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas

## 📦 Estrutura do Projeto

```
Acervo Digital/
├── backend/          # API REST
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   └── middleware/
│   └── prisma/       # Schema e migrations
├── src/              # Frontend React
│   ├── components/
│   ├── services/
│   ├── contexts/
│   └── utils/
└── README.md
```

## 🔧 Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Passos

1. **Clone o repositório:**
```bash
git clone https://github.com/Luizsb/Acervo-Digital.git
cd Acervo-Digital
```

2. **Instale as dependências do frontend:**
```bash
npm install
```

3. **Instale as dependências do backend:**
```bash
cd backend
npm install
```

4. **Configure o backend:**
```bash
# Copie o arquivo de exemplo
copy env.example .env

# Edite o .env com suas configurações
```

5. **Configure o banco de dados:**
```bash
# Sincronize o schema
npm run db:push

# Gere o Prisma Client
npm run db:generate

# (Opcional) Popule com dados de exemplo
npm run db:seed
```

## 🏃 Executando

### Desenvolvimento

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Servidor rodando em: `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
# Na raiz do projeto
npm run dev
```
Aplicação rodando em: `http://localhost:5173`

### Script Automático

Use o script PowerShell para iniciar tudo automaticamente:
```powershell
.\start-app.ps1
```

## 📚 Documentação

- [Guia de Inicialização](INICIAR.md)
- [Setup Detalhado](SETUP.md)
- [Backend README](backend/README.md)
- [Migração SQLite](backend/SQLITE_MIGRATION.md)
- [Troubleshooting](backend/TROUBLESHOOTING.md)

## 🔐 Variáveis de Ambiente

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"
```

## 📝 Funcionalidades

- ✅ Busca e filtros avançados
- ✅ Autenticação de usuários
- ✅ Sistema de favoritos
- ✅ Controle de visualizações
- ✅ Interface responsiva
- ✅ Filtros por múltiplos critérios (ano, disciplina, BNCC, etc)
- ✅ Detalhes completos de cada ODA

## 🛠️ Comandos Úteis

### Backend
```bash
npm run dev              # Iniciar servidor
npm run db:studio        # Abrir Prisma Studio
npm run db:generate      # Gerar Prisma Client
npm run db:seed          # Popular banco com dados
```

### Frontend
```bash
npm run dev              # Iniciar aplicação
npm run build            # Build para produção
```

## 📄 Licença

Este projeto é privado e de uso interno.

## 👥 Contribuidores

- Luiz Barbosa

## 🔗 Links

- [Repositório GitHub](https://github.com/Luizsb/Acervo-Digital)
- [Design Original (Figma)](https://www.figma.com/design/bOjcXTpKuwNfjQwCo96lB1/Acervo-Digital)
