const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Order, OrderItem, Product, User, sequelize } = require('../models');
const { createError } = require('../middleware/errorHandler');

// GET /orders  (admin: all orders, user: own orders)
const getOrders = async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const where = {};

  if (req.user.role !== 'admin') {
    where.user_id = req.user.id;
  }

  if (status) {
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (validStatuses.includes(status)) {
      where.status = status;
    }
  }

  const { count, rows: orders } = await Order.findAndCountAll({
    where,
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'slug', 'image_url'],
          },
        ],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit: limitNum,
    offset,
    distinct: true,
  });

  res.json({
    success: true,
    data: orders,
    message: 'Pedidos obtenidos exitosamente',
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count,
      totalPages: Math.ceil(count / limitNum),
    },
  });
};

// GET /orders/:id
const getOrder = async (req, res, next) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'slug', 'image_url', 'price'],
          },
        ],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email'],
      },
    ],
  });

  if (!order) {
    return next(createError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND'));
  }

  // Users can only see their own orders
  if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
    return next(createError(403, 'No tienes permiso para ver este pedido', 'FORBIDDEN'));
  }

  res.json({
    success: true,
    data: order,
    message: 'Pedido obtenido exitosamente',
  });
};

// POST /orders
const createOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details: errors.array(),
    });
  }

  const { items, shipping_address } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return next(createError(422, 'El pedido debe tener al menos un producto', 'EMPTY_ORDER'));
  }

  const t = await sequelize.transaction();

  try {
    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product_id, { transaction: t, lock: t.LOCK.UPDATE });

      if (!product || !product.is_active) {
        await t.rollback();
        return next(createError(404, `Producto con ID ${item.product_id} no encontrado`, 'PRODUCT_NOT_FOUND'));
      }

      if (product.stock < item.quantity) {
        await t.rollback();
        return next(
          createError(
            409,
            `Stock insuficiente para "${product.name}". Disponible: ${product.stock}`,
            'INSUFFICIENT_STOCK'
          )
        );
      }

      // Deduct stock
      product.stock -= item.quantity;
      await product.save({ transaction: t });

      const subtotal = parseFloat(product.price) * item.quantity;
      total += subtotal;

      orderItemsData.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: product.price,
      });
    }

    const order = await Order.create(
      {
        user_id: req.user.id,
        status: 'pending',
        total: total.toFixed(2),
        shipping_address,
      },
      { transaction: t }
    );

    const orderItems = orderItemsData.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    await OrderItem.bulkCreate(orderItems, { transaction: t });

    await t.commit();

    const fullOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'image_url', 'price'],
            },
          ],
        },
      ],
    });

    res.status(201).json({
      success: true,
      data: fullOrder,
      message: 'Pedido creado exitosamente',
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

// PUT /orders/:id/status (admin)
const updateOrderStatus = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details: errors.array(),
    });
  }

  const order = await Order.findByPk(req.params.id);
  if (!order) {
    return next(createError(404, 'Pedido no encontrado', 'ORDER_NOT_FOUND'));
  }

  const { status } = req.body;

  // Validate state transitions
  const validTransitions = {
    pending: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  if (!validTransitions[order.status].includes(status)) {
    return next(
      createError(
        422,
        `No se puede cambiar el estado de "${order.status}" a "${status}"`,
        'INVALID_STATUS_TRANSITION'
      )
    );
  }

  // If cancelling, restore stock
  if (status === 'cancelled') {
    const t = await sequelize.transaction();
    try {
      const orderItems = await OrderItem.findAll({ where: { order_id: order.id }, transaction: t });
      for (const item of orderItems) {
        const product = await Product.findByPk(item.product_id, { transaction: t });
        if (product) {
          product.stock += item.quantity;
          await product.save({ transaction: t });
        }
      }
      order.status = status;
      await order.save({ transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } else {
    order.status = status;
    await order.save();
  }

  res.json({
    success: true,
    data: order,
    message: `Estado del pedido actualizado a "${status}"`,
  });
};

module.exports = { getOrders, getOrder, createOrder, updateOrderStatus };
