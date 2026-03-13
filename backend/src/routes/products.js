const express = require('express');
const { body, query } = require('express-validator');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const authenticate = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre debe tener entre 2 y 255 caracteres'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un entero no negativo'),
  body('category_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('category_id debe ser un entero positivo'),
  body('image_url')
    .optional({ nullable: true })
    .isURL()
    .withMessage('image_url debe ser una URL válida'),
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active debe ser un booleano'),
];

// GET /products — public, but auth optional (for admin to see inactive)
router.get('/', (req, res, next) => {
  // Optionally authenticate to expose inactive products for admins
  authenticate(req, res, (err) => {
    if (err) return next(); // If no token, continue as guest
    next();
  });
}, getProducts);

// GET /products/:id — public, auth optional
router.get('/:id', (req, res, next) => {
  authenticate(req, res, (err) => {
    if (err) return next();
    next();
  });
}, getProduct);

// POST /products — admin only
router.post(
  '/',
  authenticate,
  adminOnly,
  [
    ...productValidation,
    body('name').notEmpty().withMessage('El nombre es requerido'),
    body('price').notEmpty().withMessage('El precio es requerido'),
  ],
  createProduct
);

// PUT /products/:id — admin only
router.put('/:id', authenticate, adminOnly, productValidation, updateProduct);

// DELETE /products/:id — admin only
router.delete('/:id', authenticate, adminOnly, deleteProduct);

module.exports = router;
