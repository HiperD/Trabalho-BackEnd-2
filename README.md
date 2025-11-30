# Sistema de Gerenciamento de Hotel 🏨

Sistema completo para gerenciamento de hotel com cadastro de clientes, quartos e reservas. Interface moderna com formulários em múltiplas etapas, filtros avançados e auditoria de operações.

## 🚀 Início Rápido

### Pré-requisitos
- Node.js v16+
- PostgreSQL
- MongoDB Atlas (para auditoria)

### Instalação

1. **Criar banco de dados PostgreSQL:**
```sql
CREATE DATABASE hotel_db;
```

2. **Instalar dependências e rodar:**
```bash
npm run install:all
npm run dev
```

✅ **Backend:** http://localhost:3000  
✅ **Frontend:** http://localhost:5173

## 🛠️ Tecnologias

**Backend:** Node.js, Express, Sequelize (PostgreSQL), Mongoose (MongoDB Atlas), JWT  
**Frontend:** React, Vite, Axios, React Router, Flatpickr

## ✨ Funcionalidades

- 🔐 Autenticação JWT
- 👥 Cadastro de clientes (formulário em 2 etapas)
- 🛏️ Gerenciamento de quartos (tipos, capacidades, preços)
- 📅 Sistema de reservas com cálculo automático de valores
- 🔍 Filtros avançados (datas, capacidade, preços com slider)
- 📊 Resumo financeiro em tempo real
- 📝 Auditoria completa em MongoDB Atlas (rota, usuário, IP, timestamp)
- 🎨 Tema claro/escuro automático

## 👥 Desenvolvedores

**Pedro Bittencourt • Lucas • Leo**  
UTFPR - Universidade Tecnológica Federal do Paraná  
© 2025
