const mongoose = require('mongoose');

const connectMongoDB = async () => {
  try {
    const mongoUri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`;
    
    await mongoose.connect(mongoUri);
    
    console.log('✅ MongoDB Atlas conectado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao conectar MongoDB Atlas:', error.message);
    // Não encerra o processo, apenas loga o erro
    // A aplicação PostgreSQL pode continuar funcionando
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB Atlas desconectado');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erro no MongoDB Atlas:', err);
});

module.exports = connectMongoDB;
