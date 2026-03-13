const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: 'pending',
        allowNull: false,
        validate: {
          isIn: [['pending', 'processing', 'shipped', 'delivered', 'cancelled']],
        },
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
          isDecimal: true,
        },
      },
      shipping_address: {
        type: DataTypes.TEXT,
        allowNull: false,
        get() {
          const val = this.getDataValue('shipping_address');
          return val ? JSON.parse(val) : null;
        },
        set(val) {
          this.setDataValue('shipping_address', JSON.stringify(val));
        },
      },
    },
    {
      tableName: 'orders',
      timestamps: true,
      underscored: true,
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
    Order.hasMany(models.OrderItem, {
      foreignKey: 'order_id',
      as: 'items',
    });
  };

  return Order;
};
