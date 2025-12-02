const Reserva = require('../models/Reserva');
const Cliente = require('../models/Cliente');
const Quarto = require('../models/Quarto');

exports.listar = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Quarto, as: 'quarto' },
      ],
      order: [['dataCheckIn', 'DESC']],
    });
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar reservas.', details: error.message });
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const reserva = await Reserva.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Quarto, as: 'quarto' },
      ],
    });

    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }

    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar reserva.', details: error.message });
  }
};

exports.criar = async (req, res) => {
  try {
    const { clienteId, quartoId, dataCheckIn, dataCheckOut } = req.body;

    // Verificar se cliente existe
    const cliente = await Cliente.findByPk(clienteId);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    // Verificar se quarto existe
    const quarto = await Quarto.findByPk(quartoId);
    if (!quarto) {
      return res.status(404).json({ error: 'Quarto não encontrado.' });
    }

    // Verificar se há conflito de datas com outras reservas confirmadas
    const { Op } = require('sequelize');
    const reservasConflitantes = await Reserva.findAll({
      where: {
        quartoId,
        status: 'Confirmada',
        [Op.or]: [
          {
            // Nova reserva começa durante uma reserva existente
            [Op.and]: [
              { dataCheckIn: { [Op.lte]: dataCheckIn } },
              { dataCheckOut: { [Op.gt]: dataCheckIn } }
            ]
          },
          {
            // Nova reserva termina durante uma reserva existente
            [Op.and]: [
              { dataCheckIn: { [Op.lt]: dataCheckOut } },
              { dataCheckOut: { [Op.gte]: dataCheckOut } }
            ]
          },
          {
            // Nova reserva envolve completamente uma reserva existente
            [Op.and]: [
              { dataCheckIn: { [Op.gte]: dataCheckIn } },
              { dataCheckOut: { [Op.lte]: dataCheckOut } }
            ]
          }
        ]
      }
    });

    if (reservasConflitantes.length > 0) {
      return res.status(400).json({ 
        error: 'Quarto não está disponível para o período selecionado. Já existe uma reserva confirmada neste período.' 
      });
    }

    // Calcular número de dias e valor total
    const checkIn = new Date(dataCheckIn);
    const checkOut = new Date(dataCheckOut);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return res.status(400).json({ error: 'Data de check-out deve ser posterior ao check-in.' });
    }

    const valorTotal = parseFloat(quarto.valorDiaria) * diffDays;

    // Criar reserva
    const reserva = await Reserva.create({
      clienteId,
      quartoId,
      dataCheckIn,
      dataCheckOut,
      valorTotal,
    });

    const reservaCompleta = await Reserva.findByPk(reserva.id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Quarto, as: 'quarto' },
      ],
    });

    res.status(201).json({ message: 'Reserva criada com sucesso!', reserva: reservaCompleta });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar reserva.', details: error.message });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, clienteId, quartoId, dataCheckIn, dataCheckOut } = req.body;

    const reserva = await Reserva.findByPk(id);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }

    // Se está atualizando apenas o status
    if (status && !clienteId && !quartoId && !dataCheckIn && !dataCheckOut) {
      await reserva.update({ status });
    } else {
      // Atualização completa da reserva
      const quartoAntigoId = reserva.quartoId;
      
      // Verificar se o novo quarto tem conflito de datas (se mudou de quarto ou datas)
      if (quartoId || dataCheckIn || dataCheckOut) {
        const quartoParaVerificar = parseInt(quartoId) || quartoAntigoId;
        const checkInParaVerificar = dataCheckIn || reserva.dataCheckIn;
        const checkOutParaVerificar = dataCheckOut || reserva.dataCheckOut;
        
        const { Op } = require('sequelize');
        const reservasConflitantes = await Reserva.findAll({
          where: {
            id: { [Op.ne]: id }, // Excluir a reserva atual
            quartoId: quartoParaVerificar,
            status: 'Confirmada',
            [Op.or]: [
              {
                // Nova reserva começa durante uma reserva existente
                [Op.and]: [
                  { dataCheckIn: { [Op.lte]: checkInParaVerificar } },
                  { dataCheckOut: { [Op.gt]: checkInParaVerificar } }
                ]
              },
              {
                // Nova reserva termina durante uma reserva existente
                [Op.and]: [
                  { dataCheckIn: { [Op.lt]: checkOutParaVerificar } },
                  { dataCheckOut: { [Op.gte]: checkOutParaVerificar } }
                ]
              },
              {
                // Nova reserva envolve completamente uma reserva existente
                [Op.and]: [
                  { dataCheckIn: { [Op.gte]: checkInParaVerificar } },
                  { dataCheckOut: { [Op.lte]: checkOutParaVerificar } }
                ]
              }
            ]
          }
        });

        if (reservasConflitantes.length > 0) {
          return res.status(400).json({ 
            error: 'Quarto não está disponível para o período selecionado. Já existe uma reserva confirmada neste período.' 
          });
        }
      }

      // Recalcular valor total se mudou o período ou o quarto
      let valorTotal = reserva.valorTotal;
      if (dataCheckIn && dataCheckOut) {
        const checkIn = new Date(dataCheckIn);
        const checkOut = new Date(dataCheckOut);
        const diffTime = Math.abs(checkOut - checkIn);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) {
          return res.status(400).json({ error: 'Data de check-out deve ser posterior ao check-in.' });
        }

        const quarto = await Quarto.findByPk(quartoId || quartoAntigoId);
        valorTotal = parseFloat(quarto.valorDiaria) * diffDays;
      }

      // Atualizar a reserva
      const novoStatus = status || reserva.status;
      await reserva.update({
        clienteId: clienteId || reserva.clienteId,
        quartoId: quartoId || reserva.quartoId,
        dataCheckIn: dataCheckIn || reserva.dataCheckIn,
        dataCheckOut: dataCheckOut || reserva.dataCheckOut,
        valorTotal,
        status: novoStatus
      });
    }

    const reservaAtualizada = await Reserva.findByPk(id, {
      include: [
        { model: Cliente, as: 'cliente' },
        { model: Quarto, as: 'quarto' },
      ],
    });

    res.json({ message: 'Reserva atualizada com sucesso!', reserva: reservaAtualizada });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar reserva.', details: error.message });
  }
};

exports.deletar = async (req, res) => {
  try {
    const { id } = req.params;

    const reserva = await Reserva.findByPk(id);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva não encontrada.' });
    }

    await reserva.destroy();
    res.json({ message: 'Reserva deletada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar reserva.', details: error.message });
  }
};
