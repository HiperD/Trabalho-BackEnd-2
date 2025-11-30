const Cliente = require('../models/Cliente');

exports.listar = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      order: [['nome', 'ASC']],
    });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar clientes.', details: error.message });
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar cliente.', details: error.message });
  }
};

exports.criar = async (req, res) => {
  try {
    const { nome, cpf, email, telefone, cep, logradouro, numero, complemento, bairro, cidade, estado } = req.body;

    const cpfExiste = await Cliente.findOne({ where: { cpf } });
    if (cpfExiste) {
      return res.status(400).json({ error: 'CPF já cadastrado.' });
    }

    const cliente = await Cliente.create({ nome, cpf, email, telefone, cep, logradouro, numero, complemento, bairro, cidade, estado });
    res.status(201).json({ message: 'Cliente cadastrado com sucesso!', cliente });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cliente.', details: error.message });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, cpf, email, telefone, cep, logradouro, numero, complemento, bairro, cidade, estado } = req.body;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    if (cpf && cpf !== cliente.cpf) {
      const cpfExiste = await Cliente.findOne({ where: { cpf } });
      if (cpfExiste) {
        return res.status(400).json({ error: 'CPF já cadastrado.' });
      }
    }

    await cliente.update({ nome, cpf, email, telefone, cep, logradouro, numero, complemento, bairro, cidade, estado });
    res.json({ message: 'Cliente atualizado com sucesso!', cliente });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar cliente.', details: error.message });
  }
};

exports.deletar = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    await cliente.destroy();
    res.json({ message: 'Cliente deletado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar cliente.', details: error.message });
  }
};
