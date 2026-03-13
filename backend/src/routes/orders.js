const express = require('express');
const { body } = require('express-validator');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const authenticate = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

const shippingAddressValidation = body('shipping_address')
  .isObject()
  .withMessage('shipping_address debe ser un objeto')
  .custom((address) => {
    const required = ['street', 'city', 'state', 'zip_code', 'country'];
    const missing = required.filter((field) => !address[field]);
    if (missing.length > 0) {
      throw new Error(`Campos requeridos en shipping_address: ${missing.join(', ')}`);
    }
    return true;
  });

// GET /orders — authenticated
router.get('/', authenticate, getOrders);

// GET /orders/:id — authenticated
router.get('/:id', authenticate, getOrder);

// POST /orders — authenticated
router.post(
  '/',
  authenticate,
  [
    shippingAddressValidation,
    body('items')
      .isArray({ min: 1 })
      .withMessage('Items debe ser un array con al menos un elemento'),
    body('items.*.product_id')
      .isInt({ min: 1 })
      .withMessage('Cada item debe tener un product_id válido'),
    body('items.*.quantity')
      .isInt({ min: 1 })
      .withMessage('La cantidad de cada item debe ser al menos 1'),
  ],
  createOrder
);

// PUT /orders/:id/status — admin only
router.put(
  '/:id/status',
  authenticate,
  adminOnly,
  [
    body('status')
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Estado inválido. Valores permitidos: pending, processing, shipped, delivered, cancelled'),
  ],
  updateOrderStatus
);

module.exports = router;
