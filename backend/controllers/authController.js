const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ error: 'Email já cadastrado.' });
    }

    const user = await User.create({ nome, email, senha });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'Usuário registrado com sucesso!',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar usuário.', details: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    const senhaValida = await user.validarSenha(senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Login realizado com sucesso!',
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login.', details: error.message });
  }
};
