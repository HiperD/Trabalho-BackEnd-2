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

    // Verificar se quarto existe e está disponível
    const quarto = await Quarto.findByPk(quartoId);
    if (!quarto) {
      return res.status(404).json({ error: 'Quarto não encontrado.' });
    }

    if (!quarto.disponivel) {
      return res.status(400).json({ error: 'Quarto não está disponível.' });
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

    // Atualizar disponibilidade do quarto
    await quarto.update({ disponivel: false });

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

      // Atualizar disponibilidade do quarto baseado no status
      const quarto = await Quarto.findByPk(reserva.quartoId);
      if (quarto) {
        if (status === 'Confirmada') {
          // Reserva confirmada = quarto ocupado (indisponível)
          await quarto.update({ disponivel: false });
        } else if (status === 'Cancelada' || status === 'Finalizada') {
          // Reserva cancelada ou finalizada = quarto livre (disponível)
          await quarto.update({ disponivel: true });
        }
      }
    } else {
      // Atualização completa da reserva
      const quartoAntigoId = reserva.quartoId;
      
      // Verificar se o novo quarto existe e está disponível (se mudou de quarto)
      // Converter para número para comparação correta
      if (quartoId && parseInt(quartoId) !== quartoAntigoId) {
        const novoQuarto = await Quarto.findByPk(quartoId);
        if (!novoQuarto) {
          return res.status(404).json({ error: 'Quarto não encontrado.' });
        }
        if (!novoQuarto.disponivel) {
          return res.status(400).json({ error: 'Quarto não está disponível.' });
        }
        
        // Liberar o quarto antigo
        const quartoAntigo = await Quarto.findByPk(quartoAntigoId);
        if (quartoAntigo) {
          await quartoAntigo.update({ disponivel: true });
        }
        
        // Ocupar o novo quarto
        await novoQuarto.update({ disponivel: false });
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

      // Atualizar disponibilidade do quarto atual baseado no status
      const quartoAtualId = quartoId || quartoAntigoId;
      const quartoAtual = await Quarto.findByPk(quartoAtualId);
      if (quartoAtual) {
        if (novoStatus === 'Confirmada') {
          // Reserva confirmada = quarto ocupado (indisponível)
          await quartoAtual.update({ disponivel: false });
        } else if (novoStatus === 'Cancelada' || novoStatus === 'Finalizada') {
          // Reserva cancelada ou finalizada = quarto livre (disponível)
          await quartoAtual.update({ disponivel: true });
        }
      }
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

    // Liberar o quarto
    const quarto = await Quarto.findByPk(reserva.quartoId);
    if (quarto) {
      await quarto.update({ disponivel: true });
    }

    await reserva.destroy();
    res.json({ message: 'Reserva deletada com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar reserva.', details: error.message });
  }
};
