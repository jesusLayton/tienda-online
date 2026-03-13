const express = require('express');
const { body } = require('express-validator');
const { register, login, logout, getMe } = require('../controllers/authController');
const authenticate = require('../middleware/auth');

const router = express.Router();

// POST /auth/register
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Debe ser un correo electrónico válido').normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('La contraseña debe tener al menos 8 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 255 })
      .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
  ],
  register
);

// POST /auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Debe ser un correo electrónico válido').normalizeEmail(),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
  ],
  login
);

// GET /auth/me
router.get('/me', authenticate, getMe);

// POST /auth/logout
router.post('/logout', authenticate, logout);

module.exports = router;
