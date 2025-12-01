require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const connectMongoDB = require('./config/mongodb');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/quartos', require('./routes/quartos'));
app.use('/api/reservas', require('./routes/reservas'));

// Rota raiz
app.get('/', (req, res) => {
  res.json({ message: 'API do Sistema de Gerenciamento de Hotel' });
});

// Sincronizar banco de dados e iniciar servidor
const PORT = process.env.PORT || 3000;

// Conectar ao MongoDB Atlas para auditoria
connectMongoDB();

sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Banco de dados sincronizado');
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}).catch((error) => {
  console.error('❌ Erro ao sincronizar banco de dados:', error);
});
