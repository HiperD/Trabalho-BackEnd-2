const sequelize = require('../config/database');
const User = require('./User');
const Cliente = require('./Cliente');
const Quarto = require('./Quarto');
const Reserva = require('./Reserva');

// Definir relacionamentos
Reserva.belongsTo(Cliente, { foreignKey: 'clienteId', as: 'cliente' });
Reserva.belongsTo(Quarto, { foreignKey: 'quartoId', as: 'quarto' });

const models = {
  User,
  Cliente,
  Quarto,
  Reserva,
};

module.exports = { sequelize, models };
