# Acervo Digital

Sistema de gerenciamento e busca de Objetos Digitais de Aprendizagem (ODAs) para educação.

## 🛠️ Tecnologias e Linguagens

### Frontend
- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool e dev server moderno
- **Tailwind CSS** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis e sem estilo
- **Lucide React** - Biblioteca de ícones

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web para Node.js
- **TypeScript** - Tipagem estática no backend
- **Prisma** - ORM (Object-Relational Mapping) para banco de dados
- **PostgreSQL** (Supabase) - Banco de dados relacional

### Banco de Dados
- **Supabase** - Plataforma PostgreSQL como serviço
- **Prisma** - ORM e gerenciamento de schema

## 📁 Estrutura do Projeto

```
Acervo Digital/
├── src/                    # Código-fonte do frontend
│   ├── components/         # Componentes React
│   │   ├── ui/            # Componentes UI reutilizáveis (Radix UI)
│   │   └── ...            # Componentes específicos da aplicação
│   ├── utils/             # Utilitários e helpers
│   │   ├── api.ts         # Funções de comunicação com API
│   │   ├── curriculumColors.ts  # Mapeamento de cores e nomes
│   │   └── ...            # Outros utilitários
│   ├── App.tsx            # Componente principal
│   └── main.tsx           # Ponto de entrada
│
├── server/                 # Código-fonte do backend
│   ├── routes/            # Rotas da API
│   │   ├── odas.ts        # Rotas para ODAs
│   │   ├── audiovisual.ts # Rotas para audiovisuais
│   │   └── bncc.ts        # Rotas para BNCC
│   ├── prisma/            # Configuração do Prisma
│   │   ├── schema.prisma  # Schema do banco de dados
│   │   └── migrations/    # Migrações do banco
│   ├── scripts/           # Scripts utilitários
│   │   ├── migrate-audiovisual.ts
│   │   └── ...
│   ├── lib/               # Bibliotecas e configurações
│   └── index.ts           # Ponto de entrada do servidor
│
├── public/                # Arquivos estáticos
│   ├── ObjetosDigitais.xlsx
│   ├── ObjetosAudiovisual.xlsx
│   └── thumbs/            # Thumbnails das imagens
│
└── package.json           # Dependências e scripts do frontend
```

## 🚀 Executando o Projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- Conta no Supabase (para banco de dados)

### Instalação

1. **Instalar dependências do frontend:**
```bash
npm install
```

2. **Instalar dependências do backend:**
```bash
cd server
npm install
cd ..
```

3. **Configurar variáveis de ambiente:**
   - Crie um arquivo `server/.env` com as configurações do Supabase:
   ```
   DATABASE_URL="postgresql://..."
   PORT=3001
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Gerar cliente Prisma:**
```bash
npm run prisma:generate
```

### Desenvolvimento

**Terminal 1 - Frontend:**
```bash
npm run dev
```
Acesse: http://localhost:3000

**Terminal 2 - Backend:**
```bash
npm run server:dev
```
API disponível em: http://localhost:3001

### Build de Produção

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
npm run server:build
npm run server:start
```

## 📚 Scripts Disponíveis

### Frontend
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção

### Backend
- `npm run server:dev` - Inicia servidor backend em modo desenvolvimento
- `npm run server:build` - Compila TypeScript do backend
- `npm run server:start` - Inicia servidor backend em produção

### Prisma
- `npm run prisma:generate` - Gera cliente Prisma
- `npm run prisma:migrate` - Executa migrações
- `npm run prisma:studio` - Abre Prisma Studio (interface visual do banco)

### Utilitários
- `npm run check:supabase` - Verifica conexão com Supabase

## 🗄️ Banco de Dados

O projeto utiliza **Supabase** (PostgreSQL) como banco de dados. As tabelas principais são:

- **ODA** - Objetos Digitais de Aprendizagem
- **Audiovisual** - Conteúdo audiovisual (vídeo aulas)
- **BNCC** - Base Nacional Comum Curricular

O schema é gerenciado pelo **Prisma** através do arquivo `server/prisma/schema.prisma`.

## 📖 Documentação Adicional

- `SETUP.md` - Guia detalhado de configuração
- `README_BACKEND.md` - Documentação específica do backend
- `PLANILHA_EXCEL.md` - Informações sobre importação de planilhas
