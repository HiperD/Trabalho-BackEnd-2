const sequelize = require('./config/database');

async function migrateClientes() {
  try {
    console.log('Iniciando migração da tabela clientes...');

    // Adicionar novas colunas
    await sequelize.query(`
      ALTER TABLE clientes 
      ADD COLUMN IF NOT EXISTS cep VARCHAR(10),
      ADD COLUMN IF NOT EXISTS logradouro VARCHAR(255),
      ADD COLUMN IF NOT EXISTS numero VARCHAR(10),
      ADD COLUMN IF NOT EXISTS complemento VARCHAR(255),
      ADD COLUMN IF NOT EXISTS bairro VARCHAR(255),
      ADD COLUMN IF NOT EXISTS cidade VARCHAR(255),
      ADD COLUMN IF NOT EXISTS estado VARCHAR(2);
    `);

    console.log('✅ Migração concluída com sucesso!');
    console.log('Novas colunas adicionadas: cep, logradouro, numero, complemento, bairro, cidade, estado');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    process.exit(1);
  }
}

migrateClientes();
