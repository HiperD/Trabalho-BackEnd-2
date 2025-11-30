# Sistema de Gerenciamento de Hotel 🏨

Sistema completo de gerenciamento de hotel desenvolvido para o **Projeto 2** da disciplina de Programação Web Back-End - UTFPR Campus Cornélio Procópio.

## 📋 Descrição do Projeto

Aplicação web full-stack que simula um sistema de gerenciamento de hotel, permitindo controle completo de:
- 👥 **Clientes** (hóspedes)
- 🛏️ **Quartos** (tipos, preços e disponibilidade)
- 📅 **Reservas** (com cálculo automático de valores)

## 🚀 Tecnologias Utilizadas

### Back-End
- **Node.js** - Ambiente de execução JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação segura
- **bcrypt** - Criptografia de senhas

### Front-End
- **React** - Biblioteca para interface
- **Vite** - Build tool
- **Axios** - Cliente HTTP
- **React Router** - Navegação
- **CSS Modules** - Estilização

## 📁 Estrutura do Projeto

```
Projeto Final Web/
├── backend/
│   ├── config/
│   │   └── database.js          # Configuração do banco
│   ├── controllers/
│   │   ├── authController.js    # Autenticação
│   │   ├── clienteController.js # CRUD Clientes
│   │   ├── quartoController.js  # CRUD Quartos
│   │   └── reservaController.js # CRUD Reservas
│   ├── middleware/
│   │   └── auth.js              # Middleware de autenticação JWT
│   ├── models/
│   │   ├── User.js              # Model de Usuário
│   │   ├── Cliente.js           # Model de Cliente
│   │   ├── Quarto.js            # Model de Quarto
│   │   ├── Reserva.js           # Model de Reserva
│   │   └── index.js             # Exportação dos models
│   ├── routes/
│   │   ├── auth.js              # Rotas de autenticação
│   │   ├── clientes.js          # Rotas de clientes
│   │   ├── quartos.js           # Rotas de quartos
│   │   └── reservas.js          # Rotas de reservas
│   ├── .env                     # Variáveis de ambiente
│   ├── .gitignore
│   ├── package.json
│   └── server.js                # Arquivo principal
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Barra de navegação
│   │   │   ├── Navbar.module.css
│   │   │   └── PrivateRoute.jsx     # Proteção de rotas
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Contexto de autenticação
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Página de login
│   │   │   ├── Register.jsx         # Página de registro
│   │   │   ├── Home.jsx             # Página inicial
│   │   │   ├── Clientes.jsx         # CRUD de clientes
│   │   │   ├── Quartos.jsx          # CRUD de quartos
│   │   │   ├── Reservas.jsx         # CRUD de reservas
│   │   │   ├── Auth.module.css      # Estilos de autenticação
│   │   │   ├── Home.module.css      # Estilos da home
│   │   │   └── Crud.module.css      # Estilos dos CRUDs
│   │   ├── services/
│   │   │   └── api.js               # Configuração do Axios
│   │   ├── App.jsx                  # Componente principal
│   │   ├── main.jsx                 # Ponto de entrada
│   │   └── index.css                # Estilos globais
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── DOCUMENTACAO.md (este arquivo)
```

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação e Autorização
- **Registro de usuários** com criptografia de senha (bcrypt)
- **Login** com geração de token JWT
- **Rotas protegidas** no back-end e front-end
- **Contexto de autenticação** no React

### ✅ Módulo de Clientes
**Localização Backend:** `backend/controllers/clienteController.js`
**Localização Frontend:** `frontend/src/pages/Clientes.jsx`

- ➕ **Criar** novo cliente (nome, CPF, email, telefone, endereço)
- 📋 **Listar** todos os clientes
- ✏️ **Editar** dados do cliente
- 🗑️ **Excluir** cliente
- ✅ Validação de CPF único

### ✅ Módulo de Quartos
**Localização Backend:** `backend/controllers/quartoController.js`
**Localização Frontend:** `frontend/src/pages/Quartos.jsx`

- ➕ **Criar** novo quarto (número, tipo, valor diária, disponibilidade)
- 📋 **Listar** todos os quartos
- ✏️ **Editar** informações do quarto
- 🗑️ **Excluir** quarto
- 🔄 **Status de disponibilidade** (Disponível/Ocupado)
- 💰 **Tipos de quarto:** Solteiro, Casal, Suíte, Luxo

### ✅ Módulo de Reservas
**Localização Backend:** `backend/controllers/reservaController.js`
**Localização Frontend:** `frontend/src/pages/Reservas.jsx`

- ➕ **Criar** reserva vinculando cliente e quarto
- 📋 **Listar** todas as reservas com informações completas
- 🧮 **Cálculo automático** do valor total (dias × valor diária)
- 🔄 **Atualizar status** (Confirmada, Cancelada, Finalizada)
- 🗑️ **Excluir** reserva
- ✅ Validação de datas (check-out após check-in)
- 🔒 **Bloqueio automático** de quarto ao criar reserva
- 🔓 **Liberação automática** ao cancelar/finalizar

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js (v16 ou superior)
- PostgreSQL instalado e rodando
- Git

### 1️⃣ Clonar o Repositório
```bash
git clone <url-do-repositorio>
cd "Projeto Final Web"
```

### 2️⃣ Configurar o Banco de Dados
1. Crie um banco de dados PostgreSQL:
```sql
CREATE DATABASE hotel_db;
```

2. Configure as credenciais no arquivo `backend/.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hotel_db
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
JWT_SECRET=seu_secret_super_secreto_aqui_2025
```

### 3️⃣ Instalar Todas as Dependências (Backend + Frontend)
Na **raiz do projeto**, execute:
```bash
npm run install:all
```

### 4️⃣ Iniciar o Projeto Completo
Na **raiz do projeto**, execute:
```bash
npm run dev
```

Este **único comando** irá:
- ✅ Iniciar o backend em `http://localhost:3000`
- ✅ Iniciar o frontend em `http://localhost:5173`
- ✅ Ambos rodam simultaneamente

**Pronto! Acesse** `http://localhost:5173` **no navegador** 🎉

## 📡 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Fazer login

### Clientes (requer autenticação)
- `GET /api/clientes` - Listar todos
- `GET /api/clientes/:id` - Buscar por ID
- `POST /api/clientes` - Criar novo
- `PUT /api/clientes/:id` - Atualizar
- `DELETE /api/clientes/:id` - Excluir

### Quartos (requer autenticação)
- `GET /api/quartos` - Listar todos
- `GET /api/quartos/:id` - Buscar por ID
- `POST /api/quartos` - Criar novo
- `PUT /api/quartos/:id` - Atualizar
- `DELETE /api/quartos/:id` - Excluir

### Reservas (requer autenticação)
- `GET /api/reservas` - Listar todas (com cliente e quarto)
- `GET /api/reservas/:id` - Buscar por ID
- `POST /api/reservas` - Criar nova
- `PUT /api/reservas/:id` - Atualizar status
- `DELETE /api/reservas/:id` - Excluir

## 🎨 Interface do Usuário

### Páginas
1. **Login/Registro** - Autenticação de usuários
2. **Home** - Dashboard com cards de acesso rápido
3. **Clientes** - Lista e formulário de gerenciamento
4. **Quartos** - Lista e formulário de gerenciamento
5. **Reservas** - Lista e formulário de criação de reservas

### Recursos da Interface
- ✨ Design moderno e responsivo
- 🎨 Gradiente roxo de fundo
- 📱 Cards com efeito hover
- 📊 Tabelas organizadas
- ✅ Alertas de sucesso/erro
- 🔐 Rotas protegidas com redirecionamento
- 🚪 Logout funcional

## 🏗️ Arquitetura e Boas Práticas

### Padrão MVC no Back-End
- **Models** - Definição de entidades (Sequelize)
- **Controllers** - Lógica de negócio
- **Routes** - Definição de endpoints

### Organização do Front-End
- **Components** - Componentes reutilizáveis
- **Pages** - Páginas da aplicação
- **Context** - Gerenciamento de estado global
- **Services** - Comunicação com API

### Segurança
- ✅ Senhas criptografadas com bcrypt
- ✅ Tokens JWT para autenticação
- ✅ Middleware de proteção de rotas
- ✅ Validação de dados no back-end
- ✅ CORS configurado

## 📝 Como Usar o Sistema

### Primeiro Acesso
1. Acesse `http://localhost:5173/register`
2. Crie uma conta com nome, email e senha
3. Você será automaticamente logado

### Gerenciar Clientes
1. Acesse "Clientes" no menu
2. Clique em "+ Novo Cliente"
3. Preencha os dados (nome, CPF, email, telefone, endereço)
4. Clique em "Cadastrar"

### Gerenciar Quartos
1. Acesse "Quartos" no menu
2. Clique em "+ Novo Quarto"
3. Preencha: número, tipo, valor da diária
4. Marque se está disponível
5. Clique em "Cadastrar"

### Criar Reserva
1. Acesse "Reservas" no menu
2. Clique em "+ Nova Reserva"
3. Selecione um cliente
4. Selecione um quarto disponível
5. Escolha as datas de check-in e check-out
6. O valor total será calculado automaticamente
7. Clique em "Criar Reserva"

### Gerenciar Reserva
- **Alterar status:** Use o dropdown na tabela
- **Excluir:** Clique no botão "Excluir"
- **Cancelar/Finalizar:** O quarto será liberado automaticamente

## 🧪 Testando a API (Insomnia/Postman)

### 1. Registrar Usuário
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "nome": "Admin Hotel",
  "email": "admin@hotel.com",
  "senha": "123456"
}
```

### 2. Fazer Login
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@hotel.com",
  "senha": "123456"
}
```

### 3. Usar o Token nas Requisições
Copie o token recebido e adicione no header:
```
Authorization: Bearer SEU_TOKEN_AQUI
```

## 📦 Entrega do Projeto

### Preparar para Entrega
```bash
# Remover node_modules do back-end
cd backend
rm -rf node_modules

# Remover node_modules do front-end
cd ../frontend
rm -rf node_modules dist
```

### Conteúdo da Entrega
- ✅ Código-fonte completo (sem node_modules)
- ✅ Arquivo .env com configurações
- ✅ Documentação (este arquivo)
- ✅ README com instruções de instalação

## 👥 Apresentação

### Pontos a Demonstrar
1. ✅ **Arquitetura MVC** - Mostrar organização do código
2. ✅ **Autenticação JWT** - Demonstrar login e rotas protegidas
3. ✅ **CRUD Completo** - Criar, listar, editar e excluir em cada módulo
4. ✅ **Integração Front-Back** - Mostrar comunicação via API
5. ✅ **Validações** - Demonstrar tratamento de erros
6. ✅ **Cálculo de Reservas** - Mostrar cálculo automático de valores

### Roteiro Sugerido (10 minutos)
1. **Introdução** (1 min) - Apresentar o sistema
2. **Autenticação** (2 min) - Login e proteção de rotas
3. **Clientes** (2 min) - CRUD completo
4. **Quartos** (2 min) - CRUD e disponibilidade
5. **Reservas** (2 min) - Criação e cálculo automático
6. **Conclusão** (1 min) - Tecnologias e arquitetura

## 🐛 Possíveis Problemas e Soluções

### Erro de Conexão com Banco
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Certifique-se que o banco `hotel_db` foi criado

### Erro de CORS
- Verifique se o back-end está na porta 3000
- Confirme se o front-end está acessando `http://localhost:3000/api`

### Token Inválido
- Faça logout e login novamente
- Limpe o localStorage do navegador

## 📚 Referências

- [Node.js Documentation](https://nodejs.org/)
- [Express.js Guide](https://expressjs.com/)
- [Sequelize Documentation](https://sequelize.org/)
- [React Documentation](https://react.dev/)
- [JWT Introduction](https://jwt.io/introduction)

## ✅ Critérios de Avaliação Atendidos

- ✅ **Funcionalidades (40%)** - CRUD completo de Clientes, Quartos e Reservas
- ✅ **Integração React + API (25%)** - Comunicação completa e funcional
- ✅ **Organização e MVC (15%)** - Arquitetura bem definida
- ✅ **Apresentação (20%)** - Sistema funcional e demonstrável

## 🎓 Desenvolvido para

**Universidade Tecnológica Federal do Paraná (UTFPR)**  
Campus Cornélio Procópio  
Disciplina: Programação Web Back-End  
Profª. Dra. Tatanne C. N. Rocha  
Data: Dezembro/2025

---

**Boa sorte na apresentação! 🚀**
