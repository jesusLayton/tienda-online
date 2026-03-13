const { validationResult } = require('express-validator');
const { Category, Product } = require('../models');
const { createError } = require('../middleware/errorHandler');

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// GET /categories
const getCategories = async (req, res) => {
  const categories = await Category.findAll({
    order: [['name', 'ASC']],
    include: [
      {
        model: Product,
        as: 'products',
        attributes: [],
        where: { is_active: true },
        required: false,
      },
    ],
    attributes: {
      include: [
        [
          Category.sequelize.fn('COUNT', Category.sequelize.col('products.id')),
          'product_count',
        ],
      ],
    },
    group: ['Category.id'],
  });

  res.json({
    success: true,
    data: categories,
    message: 'Categorías obtenidas exitosamente',
  });
};

// GET /categories/:id
const getCategory = async (req, res, next) => {
  const { id } = req.params;
  const numId = parseInt(id);
  const where = (!isNaN(numId) && numId > 0) ? { id: numId } : { slug: id };

  const category = await Category.findOne({
    where,
    include: [
      {
        model: Product,
        as: 'products',
        where: { is_active: true },
        required: false,
        attributes: ['id', 'name', 'slug', 'price', 'stock', 'image_url'],
      },
    ],
  });

  if (!category) {
    return next(createError(404, 'Categoría no encontrada', 'CATEGORY_NOT_FOUND'));
  }

  res.json({
    success: true,
    data: category,
    message: 'Categoría obtenida exitosamente',
  });
};

// POST /categories (admin)
const createCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details: errors.array(),
    });
  }

  const { name, description, image_url } = req.body;
  const slug = slugify(name);

  const existing = await Category.findOne({ where: { slug } });
  if (existing) {
    return next(createError(409, 'Ya existe una categoría con ese nombre', 'CATEGORY_EXISTS'));
  }

  const category = await Category.create({ name, slug, description, image_url });

  res.status(201).json({
    success: true,
    data: category,
    message: 'Categoría creada exitosamente',
  });
};

// PUT /categories/:id (admin)
const updateCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details: errors.array(),
    });
  }

  const category = await Category.findByPk(req.params.id);
  if (!category) {
    return next(createError(404, 'Categoría no encontrada', 'CATEGORY_NOT_FOUND'));
  }

  const { name, description, image_url } = req.body;

  if (name && name !== category.name) {
    const newSlug = slugify(name);
    const existing = await Category.findOne({
      where: { slug: newSlug, id: { [require('sequelize').Op.ne]: category.id } },
    });
    if (existing) {
      return next(createError(409, 'Ya existe una categoría con ese nombre', 'CATEGORY_EXISTS'));
    }
    category.name = name;
    category.slug = newSlug;
  }

  if (description !== undefined) category.description = description;
  if (image_url !== undefined) category.image_url = image_url;

  await category.save();

  res.json({
    success: true,
    data: category,
    message: 'Categoría actualizada exitosamente',
  });
};

// DELETE /categories/:id (admin)
const deleteCategory = async (req, res, next) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    return next(createError(404, 'Categoría no encontrada', 'CATEGORY_NOT_FOUND'));
  }

  // Check for associated products
  const productCount = await Product.count({ where: { category_id: category.id, is_active: true } });
  if (productCount > 0) {
    return next(
      createError(
        409,
        `No se puede eliminar la categoría porque tiene ${productCount} producto(s) activo(s) asociado(s)`,
        'CATEGORY_HAS_PRODUCTS'
      )
    );
  }

  await category.destroy();

  res.json({
    success: true,
    data: null,
    message: 'Categoría eliminada exitosamente',
  });
};

module.exports = { getCategories, getCategory, createCategory, updateCategory, deleteCategory };
