const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { User } = require('../models');
const { createError } = require('../middleware/errorHandler');

// GET /users (admin)
const getUsers = async (req, res) => {
  const { page = 1, limit = 10, search, role } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const where = {};

  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  if (role && ['user', 'admin'].includes(role)) {
    where.role = role;
  }

  const { count, rows: users } = await User.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: limitNum,
    offset,
  });

  res.json({
    success: true,
    data: users,
    message: 'Usuarios obtenidos exitosamente',
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count,
      totalPages: Math.ceil(count / limitNum),
    },
  });
};

// GET /users/:id
const getUser = async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return next(createError(404, 'Usuario no encontrado', 'USER_NOT_FOUND'));
  }

  // Non-admin can only see their own profile
  if (req.user.role !== 'admin' && req.user.id !== user.id) {
    return next(createError(403, 'Acceso denegado', 'FORBIDDEN'));
  }

  res.json({
    success: true,
    data: user,
    message: 'Usuario obtenido exitosamente',
  });
};

// PUT /users/:id
const updateUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: 'Error de validación',
      code: 'VALIDATION_ERROR',
      details: errors.array(),
    });
  }

  const user = await User.findByPk(req.params.id);
  if (!user) {
    return next(createError(404, 'Usuario no encontrado', 'USER_NOT_FOUND'));
  }

  // Non-admin can only update their own profile
  if (req.user.role !== 'admin' && req.user.id !== user.id) {
    return next(createError(403, 'Acceso denegado', 'FORBIDDEN'));
  }

  const { name, email, password, role } = req.body;

  if (name) user.name = name;

  if (email && email !== user.email) {
    const existing = await User.findOne({
      where: { email: email.toLowerCase(), id: { [Op.ne]: user.id } },
    });
    if (existing) {
      return next(createError(409, 'El correo electrónico ya está en uso', 'EMAIL_TAKEN'));
    }
    user.email = email.toLowerCase();
  }

  if (password) {
    user.password_hash = password; // Hook will hash it
  }

  // Only admin can change roles
  if (role && req.user.role === 'admin') {
    user.role = role;
  }

  await user.save();

  res.json({
    success: true,
    data: user,
    message: 'Usuario actualizado exitosamente',
  });
};

// DELETE /users/:id (admin)
const deleteUser = async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return next(createError(404, 'Usuario no encontrado', 'USER_NOT_FOUND'));
  }

  // Prevent deleting yourself
  if (req.user.id === user.id) {
    return next(createError(400, 'No puedes eliminar tu propia cuenta', 'CANNOT_DELETE_SELF'));
  }

  await user.destroy();

  res.json({
    success: true,
    data: null,
    message: 'Usuario eliminado exitosamente',
  });
};

module.exports = { getUsers, getUser, updateUser, deleteUser };
