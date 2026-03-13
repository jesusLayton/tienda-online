const express = require('express');
const { body } = require('express-validator');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const authenticate = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
  body('description')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres'),
  body('image_url')
    .optional({ nullable: true })
    .isURL()
    .withMessage('image_url debe ser una URL válida'),
];

// GET /categories — public
router.get('/', getCategories);

// GET /categories/:id — public
router.get('/:id', getCategory);

// POST /categories — admin only
router.post(
  '/',
  authenticate,
  adminOnly,
  [
    ...categoryValidation,
    body('name').notEmpty().withMessage('El nombre es requerido'),
  ],
  createCategory
);

// PUT /categories/:id — admin only
router.put('/:id', authenticate, adminOnly, categoryValidation, updateCategory);

// DELETE /categories/:id — admin only
router.delete('/:id', authenticate, adminOnly, deleteCategory);

module.exports = router;
