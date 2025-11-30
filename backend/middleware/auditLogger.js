const AuditLog = require('../models/AuditLog');

const auditLogger = (acao) => {
  return async (req, res, next) => {
    // Captura os dados originais de res.json para incluir statusCode
    const originalJson = res.json;
    
    res.json = function(data) {
      // Registra o log de auditoria de forma assíncrona (não bloqueia a resposta)
      const logData = {
        rota: req.originalUrl || req.url,
        metodo: req.method,
        usuario: req.user?.nome || 'Desconhecido',
        usuarioId: req.user?.id || 0,
        acao: acao || `${req.method} ${req.path}`,
        ip: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for']?.split(',')[0].trim() || 'IP desconhecido',
        detalhes: {
          body: req.body,
          params: req.params,
          query: req.query
        },
        statusCode: res.statusCode
      };

      // Não aguarda a conclusão do log (async sem await)
      AuditLog.create(logData).catch(err => {
        console.error('❌ Erro ao registrar log de auditoria:', err.message);
      });

      // Chama a função original
      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = auditLogger;
