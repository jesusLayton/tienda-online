const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const env = require('../config/env');
const { createError } = require('../middleware/errorHandler');

const COOKIE_NAME = 'auth_token';
const COOKIE_OPTIONS = {
  httpOnly: true,          // No accesible desde JS — protege contra XSS
  secure: env.NODE_ENV === 'production', // Solo HTTPS en producción
  sameSite: 'strict',      // Protección CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en ms
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

// POST /auth/register
const register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details: errors.array(),
    });
  }

  const { email, password, name } = req.body;

  const existing = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existing) {
    return next(createError(409, 'El correo electrónico ya está registrado', 'EMAIL_TAKEN'));
  }

  const user = await User.create({
    email: email.toLowerCase(),
    password_hash: password,
    name,
    role: 'user',
  });

  const token = generateToken(user);
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

  res.status(201).json({
    success: true,
    data: { user, token },
    message: 'Usuario registrado exitosamente',
  });
};

// POST /auth/login
const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details: errors.array(),
    });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user) {
    return next(createError(401, 'Credenciales inválidas', 'INVALID_CREDENTIALS'));
  }

  const isValid = await user.validatePassword(password);
  if (!isValid) {
    return next(createError(401, 'Credenciales inválidas', 'INVALID_CREDENTIALS'));
  }

  const token = generateToken(user);
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

  res.json({
    success: true,
    data: { user, token },
    message: 'Inicio de sesión exitoso',
  });
};

// POST /auth/logout
const logout = (req, res) => {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
  res.json({ success: true, data: null, message: 'Sesión cerrada exitosamente' });
};

// GET /auth/me
const getMe = async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
    message: 'Perfil obtenido exitosamente',
  });
};

module.exports = { register, login, logout, getMe };
