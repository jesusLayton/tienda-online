const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { Product, Category } = require('../models');
const { createError } = require('../middleware/errorHandler');

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const where = { slug };
    if (excludeId) where.id = { [Op.ne]: excludeId };
    const existing = await Product.findOne({ where });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
};

// GET /products
const getProducts = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    search,
    min_price,
    max_price,
    is_active,
    sort = 'created_at',
    order = 'DESC',
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const where = {};

  // Only show active products to non-admins
  if (!req.user || req.user.role !== 'admin') {
    where.is_active = true;
  } else if (is_active !== undefined) {
    where.is_active = is_active === 'true';
  }

  if (category) {
    // Support category id or slug
    if (isNaN(category)) {
      const cat = await Category.findOne({ where: { slug: category } });
      if (cat) where.category_id = cat.id;
      else where.category_id = -1; // No results
    } else {
      where.category_id = parseInt(category);
    }
  }

  if (search) {
    const safeSearch = search.replace(/[%_\\]/g, '\\$&');
    where[Op.or] = [
      { name: { [Op.like]: `%${safeSearch}%` } },
      { description: { [Op.like]: `%${safeSearch}%` } },
    ];
  }

  if (min_price !== undefined || max_price !== undefined) {
    where.price = {};
    if (min_price !== undefined) where.price[Op.gte] = parseFloat(min_price);
    if (max_price !== undefined) where.price[Op.lte] = parseFloat(max_price);
  }

  const allowedSortFields = ['created_at', 'updated_at', 'price', 'name', 'stock'];
  const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
  const sortOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

  const { count, rows: products } = await Product.findAndCountAll({
    where,
    include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
    order: [[sortField, sortOrder]],
    limit: limitNum,
    offset,
  });

  res.json({
    success: true,
    data: products,
    message: 'Productos obtenidos exitosamente',
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count,
      totalPages: Math.ceil(count / limitNum),
    },
  });
};

// GET /products/:id
const getProduct = async (req, res, next) => {
  const { id } = req.params;
  const numId = parseInt(id);
  const where = (!isNaN(numId) && numId > 0) ? { id: numId } : { slug: id };

  const product = await Product.findOne({
    where,
    include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
  });

  if (!product) {
    return next(createError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND'));
  }

  // Non-admins cannot see inactive products
  if (!product.is_active && (!req.user || req.user.role !== 'admin')) {
    return next(createError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND'));
  }

  res.json({
    success: true,
    data: product,
    message: 'Producto obtenido exitosamente',
  });
};

// POST /products (admin)
const createProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details: errors.array(),
    });
  }

  const { name, description, price, stock, image_url, category_id, is_active } = req.body;

  if (category_id) {
    const category = await Category.findByPk(category_id);
    if (!category) {
      return next(createError(404, 'Categoría no encontrada', 'CATEGORY_NOT_FOUND'));
    }
  }

  const baseSlug = slugify(name);
  const slug = await ensureUniqueSlug(baseSlug);

  const product = await Product.create({
    name,
    slug,
    description,
    price,
    stock: stock ?? 0,
    image_url,
    category_id,
    is_active: is_active !== undefined ? is_active : true,
  });

  const productWithCategory = await Product.findByPk(product.id, {
    include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
  });

  res.status(201).json({
    success: true,
    data: productWithCategory,
    message: 'Producto creado exitosamente',
  });
};

// PUT /products/:id (admin)
const updateProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details: errors.array(),
    });
  }

  const product = await Product.findByPk(req.params.id);
  if (!product) {
    return next(createError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND'));
  }

  const { name, description, price, stock, image_url, category_id, is_active } = req.body;

  if (category_id !== undefined) {
    const category = await Category.findByPk(category_id);
    if (!category) {
      return next(createError(404, 'Categoría no encontrada', 'CATEGORY_NOT_FOUND'));
    }
  }

  if (name && name !== product.name) {
    const baseSlug = slugify(name);
    product.slug = await ensureUniqueSlug(baseSlug, product.id);
    product.name = name;
  }

  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (stock !== undefined) product.stock = stock;
  if (image_url !== undefined) product.image_url = image_url;
  if (category_id !== undefined) product.category_id = category_id;
  if (is_active !== undefined) product.is_active = is_active;

  await product.save();

  const updated = await Product.findByPk(product.id, {
    include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
  });

  res.json({
    success: true,
    data: updated,
    message: 'Producto actualizado exitosamente',
  });
};

// DELETE /products/:id (admin)
const deleteProduct = async (req, res, next) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) {
    return next(createError(404, 'Producto no encontrado', 'PRODUCT_NOT_FOUND'));
  }

  // Soft delete by deactivating
  product.is_active = false;
  await product.save();

  res.json({
    success: true,
    data: null,
    message: 'Producto eliminado exitosamente',
  });
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
