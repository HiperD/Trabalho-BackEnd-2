const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cliente = require('./Cliente');
const Quarto = require('./Quarto');

const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Cliente,
      key: 'id',
    },
  },
  clienteIds: {
    type: DataTypes.JSONB, // Array de IDs dos hóspedes
    allowNull: false,
    defaultValue: [],
  },
  quartoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Quarto,
      key: 'id',
    },
  },
  dataCheckIn: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  dataCheckOut: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  valorTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  numeroHospedes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  status: {
    type: DataTypes.ENUM('Confirmada', 'Cancelada', 'Finalizada'),
    defaultValue: 'Confirmada',
  },
}, {
  tableName: 'reservas',
  timestamps: true,
});

module.exports = Reserva;

Cliente.hasMany(Reserva, { foreignKey: 'clienteId', as: 'reservas' });
Quarto.hasMany(Reserva, { foreignKey: 'quartoId', as: 'reservas' });

module.exports = Reserva;
