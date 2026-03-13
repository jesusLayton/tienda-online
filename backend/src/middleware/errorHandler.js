const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  // Log the error
  if (env.NODE_ENV !== 'test') {
    console.error(`[ERROR] ${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.error(err.stack || err.message);
  }

  // Sequelize validation errors
  if (err instanceof ValidationError) {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      error: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details: errors,
    });
  }

  // Sequelize unique constraint errors
  if (err instanceof UniqueConstraintError) {
    const fields = err.errors.map((e) => e.path).join(', ');
    return res.status(409).json({
      success: false,
      error: `El valor ya existe: ${fields}`,
      code: 'DUPLICATE_ENTRY',
    });
  }

  // Sequelize foreign key constraint errors
  if (err instanceof ForeignKeyConstraintError) {
    return res.status(409).json({
      success: false,
      error: 'No se puede completar la operación por referencias existentes',
      code: 'FOREIGN_KEY_CONSTRAINT',
    });
  }

  // Express-validator errors (passed via next())
  if (err.type === 'validation') {
    return res.status(422).json({
      success: false,
      error: err.message || 'Error de validación',
      code: 'VALIDATION_ERROR',
      details: err.details || [],
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido',
      code: 'INVALID_TOKEN',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expirado',
      code: 'TOKEN_EXPIRED',
    });
  }

  // Custom application errors
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      error: err.message,
      code: err.code || 'APP_ERROR',
    });
  }

  // Default 500 error — nunca exponer detalles internos
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    code: 'INTERNAL_SERVER_ERROR',
  });
};

// Helper to create app errors
const createError = (status, message, code) => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
};

module.exports = { errorHandler, createError };
