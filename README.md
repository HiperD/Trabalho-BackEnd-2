# Sistema de Gerenciamento de Hotel 🏨

Sistema completo para gerenciamento de hotel com cadastro de clientes, quartos e reservas. Interface moderna com formulários em múltiplas etapas, filtros avançados, paginação e auditoria de operações.

## 🚀 Início Rápido

### Pré-requisitos
- Node.js v16+
- PostgreSQL
- MongoDB Atlas (para auditoria)

### Instalação e Execução

#### 1. **Criar banco de dados PostgreSQL**
```sql
CREATE DATABASE hotel_db;
```

#### 2. **Configurar variáveis de ambiente**

Copie o arquivo `.env.example` para `.env` no diretório `backend/`:

```bash
cd backend
cp .env.example .env
```

Edite o arquivo `backend/.env` com suas credenciais:

```env
# Servidor
PORT=3000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_db
DB_USER=seu_usuario_postgres
DB_PASSWORD=sua_senha_postgres

# JWT (use uma chave segura aleatória)
JWT_SECRET=sua_chave_secreta_jwt_aqui

# MongoDB Atlas para Auditoria
MONGODB_USER=seu_usuario_mongodb
MONGODB_PASSWORD=sua_senha_mongodb
MONGODB_CLUSTER=seu_cluster.mongodb.net
MONGODB_DATABASE=hotel_audit
```

#### 3. **Instalar dependências e executar**

No diretório raiz do projeto, execute:

```bash
npm run dev
```

Este comando irá:
- ✅ Instalar automaticamente todas as dependências do backend e frontend
- ✅ Iniciar o servidor backend na porta 3000
- ✅ Iniciar o frontend na porta 5173

**URLs de acesso:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api

#### 4. **Popular o banco de dados (opcional)**

Para criar dados de teste (20 clientes, 30 quartos e 20 reservas):

```bash
npm run seed
```

Ou diretamente:

```bash
cd backend
node seed.js
```

O seed criará:
- 20 clientes de exemplo
- 30 quartos (6 de cada tipo: Solteiro, SolteiroDuas, Casal, Suíte, Luxo)
- 20 reservas (10 Confirmadas, 5 Canceladas, 5 Finalizadas)

### Comandos Disponíveis

```bash
npm run dev           # Instala dependências + inicia backend e frontend
npm run install:all   # Instala apenas as dependências
npm run dev:backend   # Inicia apenas o backend
npm run dev:frontend  # Inicia apenas o frontend
npm run seed          # Popula o banco com dados de teste
npm run build         # Build de produção do frontend
```

## 🛠️ Tecnologias

**Backend:** Node.js, Express, Sequelize (PostgreSQL), Mongoose (MongoDB Atlas), JWT, Bcrypt  
**Frontend:** React, Vite, Axios, React Router, CSS Modules

## ✨ Funcionalidades

### Autenticação
- 🔐 Sistema de login e registro com JWT
- 🔒 Rotas protegidas com autenticação
- 👤 Controle de sessão por usuário

### Clientes
- 👥 Cadastro completo de clientes
- 🔍 Busca por nome e CPF
- 📄 Paginação (10 itens por página)
- ✏️ Edição e exclusão

### Quartos
- 🛏️ 5 tipos de quartos (Solteiro, SolteiroDuas, Casal, Suíte, Luxo)
- 🏷️ Capacidade e valores configuráveis
- 📅 Calendário de ocupação por quarto
- 🔍 Filtros avançados (tipo, número, preço, disponibilidade)
- 📄 Paginação (10 itens por página)

### Reservas
- 📅 Sistema de reservas com múltiplos hóspedes
- 🔢 Validação de capacidade do quarto
- 💰 Cálculo automático de valores por período
- 🔍 Filtros por CPF do cliente e número do quarto
- 📊 Exibição de todos os hóspedes na reserva
- 📄 Paginação (10 itens por página)
- ⚠️ Validações de datas (entrada < saída, não permitir datas passadas)

### Auditoria
- 📝 Log completo em MongoDB Atlas
- 📊 Registro de todas as operações (CREATE, UPDATE, DELETE)
- 🌐 Rastreamento de IP e usuário
- ⏰ Timestamp de cada ação

### Interface
- 🎨 Design moderno e responsivo
- 🌓 Tema claro/escuro automático
- 📱 Compatível com dispositivos móveis
- 🖼️ Imagens ilustrativas por tipo de quarto
- ⚡ Feedback visual de ações (sucesso/erro)

## 📁 Estrutura do Projeto

```
Projeto Final Web/
├── backend/
│   ├── config/          # Configurações (DB PostgreSQL e MongoDB)
│   ├── controllers/     # Lógica de negócio
│   ├── middleware/      # Autenticação JWT e auditoria
│   ├── models/          # Modelos Sequelize e Mongoose
│   ├── routes/          # Rotas da API
│   ├── .env.example     # Template de variáveis de ambiente
│   ├── seed.js          # População do banco de dados
│   └── server.js        # Servidor Express
├── frontend/
│   ├── src/
│   │   ├── assets/      # Imagens e recursos
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── context/     # Context API (Auth, Theme)
│   │   ├── pages/       # Páginas da aplicação
│   │   └── services/    # API axios
│   └── vite.config.js
└── package.json         # Scripts principais
```

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Autenticação via JWT
- Validação de dados no backend
- Proteção contra SQL Injection (Sequelize ORM)
- CORS configurado

## 👥 Desenvolvedores

**Pedro Bittencourt • Lucas Nicoletti • Leonardo Cruz**  
UTFPR - Universidade Tecnológica Federal do Paraná  
© 2025
