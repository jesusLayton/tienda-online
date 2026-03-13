const express = require('express');
const { body } = require('express-validator');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un correo electrónico válido')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('El rol debe ser "user" o "admin"'),
];

// GET /users — admin only
router.get('/', authenticate, adminOnly, getUsers);

// GET /users/:id — authenticated (users can only see their own)
router.get('/:id', authenticate, getUser);

// PUT /users/:id — authenticated (users can only update their own, admin can update any)
router.put('/:id', authenticate, updateUserValidation, updateUser);

// DELETE /users/:id — admin only
router.delete('/:id', authenticate, adminOnly, deleteUser);

module.exports = router;
