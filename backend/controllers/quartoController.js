const Quarto = require('../models/Quarto');
const Reserva = require('../models/Reserva');
const { Op } = require('sequelize');

exports.listar = async (req, res) => {
  try {
    const { page = 1, limit = 10, numero, tipo, disponivel, valorMin, valorMax } = req.query;
    const offset = (page - 1) * limit;

    // Construir condições de filtro
    const whereClause = {};
    
    if (numero) {
      whereClause.numero = { [Op.like]: `%${numero}%` };
    }
    
    if (tipo) {
      whereClause.tipo = tipo;
    }
    
    if (disponivel !== undefined) {
      whereClause.disponivel = disponivel === 'true';
    }
    
    if (valorMin) {
      whereClause.valorDiaria = { ...whereClause.valorDiaria, [Op.gte]: parseFloat(valorMin) };
    }
    
    if (valorMax && valorMax !== '1500') {
      whereClause.valorDiaria = { ...whereClause.valorDiaria, [Op.lte]: parseFloat(valorMax) };
    }

    const { count, rows } = await Quarto.findAndCountAll({
      where: whereClause,
      order: [['numero', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      quartos: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar quartos.', details: error.message });
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const quarto = await Quarto.findByPk(id);

    if (!quarto) {
      return res.status(404).json({ error: 'Quarto não encontrado.' });
    }

    res.json(quarto);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar quarto.', details: error.message });
  }
};

exports.criar = async (req, res) => {
  try {
    const { numero, tipo, capacidade, valorDiaria, disponivel, descricao } = req.body;

    const numeroExiste = await Quarto.findOne({ where: { numero } });
    if (numeroExiste) {
      return res.status(400).json({ error: 'Número de quarto já cadastrado.' });
    }

    const quarto = await Quarto.create({ numero, tipo, capacidade, valorDiaria, disponivel, descricao });
    res.status(201).json({ message: 'Quarto cadastrado com sucesso!', quarto });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar quarto.', details: error.message });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, tipo, capacidade, valorDiaria, disponivel, descricao } = req.body;

    const quarto = await Quarto.findByPk(id);
    if (!quarto) {
      return res.status(404).json({ error: 'Quarto não encontrado.' });
    }

    // Verificar se há reservas ativas (Confirmada)
    const reservaAtiva = await Reserva.findOne({
      where: {
        quartoId: id,
        status: 'Confirmada'
      }
    });

    if (reservaAtiva) {
      return res.status(400).json({ error: 'Não é possível alterar este quarto pois há reservas ativas nele.' });
    }

    if (numero && numero !== quarto.numero) {
      const numeroExiste = await Quarto.findOne({ where: { numero } });
      if (numeroExiste) {
        return res.status(400).json({ error: 'Número de quarto já cadastrado.' });
      }
    }

    await quarto.update({ numero, tipo, capacidade, valorDiaria, disponivel, descricao });
    res.json({ message: 'Quarto atualizado com sucesso!', quarto });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar quarto.', details: error.message });
  }
};

exports.deletar = async (req, res) => {
  try {
    const { id } = req.params;

    const quarto = await Quarto.findByPk(id);
    if (!quarto) {
      return res.status(404).json({ error: 'Quarto não encontrado.' });
    }

    // Verificar se há reservas ativas (Confirmada)
    const reservaAtiva = await Reserva.findOne({
      where: {
        quartoId: id,
        status: 'Confirmada'
      }
    });

    if (reservaAtiva) {
      return res.status(400).json({ error: 'Não é possível excluir este quarto pois há reservas ativas nele.' });
    }

    await quarto.destroy();
    res.json({ message: 'Quarto deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar quarto:', error);
    res.status(500).json({ error: error.message || 'Erro ao deletar quarto.', details: error.message });
  }
};
