const sequelize = require('../config/database');
const User = require('./User');
const Cliente = require('./Cliente');
const Quarto = require('./Quarto');
const Reserva = require('./Reserva');

const models = {
  User,
  Cliente,
  Quarto,
  Reserva,
};

module.exports = { sequelize, models };
