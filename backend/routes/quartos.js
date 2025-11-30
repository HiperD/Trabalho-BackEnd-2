const express = require('express');
const router = express.Router();
const quartoController = require('../controllers/quartoController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', quartoController.listar);
router.get('/:id', quartoController.buscarPorId);
router.post('/', quartoController.criar);
router.put('/:id', quartoController.atualizar);
router.delete('/:id', quartoController.deletar);

module.exports = router;
