const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quarto = sequelize.define('Quarto', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  numero: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  tipo: {
    type: DataTypes.ENUM('Solteiro', 'Casal', 'Suíte', 'Luxo'),
    allowNull: false,
  },
  valorDiaria: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  disponivel: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'quartos',
  timestamps: true,
});

module.exports = Quarto;
