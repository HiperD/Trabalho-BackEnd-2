const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  rota: {
    type: String,
    required: true,
    index: true
  },
  metodo: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  },
  usuario: {
    type: String,
    required: true,
    index: true
  },
  usuarioId: {
    type: Number,
    required: true
  },
  acao: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  detalhes: {
    type: mongoose.Schema.Types.Mixed
  },
  statusCode: {
    type: Number
  }
});

// Índice composto para consultas eficientes
auditLogSchema.index({ timestamp: -1, usuario: 1 });
auditLogSchema.index({ rota: 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
