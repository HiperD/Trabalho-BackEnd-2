const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const authMiddleware = require('../middleware/auth');
const auditLogger = require('../middleware/auditLogger');

router.use(authMiddleware);

router.get('/', auditLogger('Listar reservas'), reservaController.listar);
router.get('/:id', auditLogger('Buscar reserva por ID'), reservaController.buscarPorId);
router.post('/', auditLogger('Criar reserva'), reservaController.criar);
router.put('/:id', auditLogger('Atualizar reserva'), reservaController.atualizar);
router.delete('/:id', auditLogger('Deletar reserva'), reservaController.deletar);

module.exports = router;
