const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourierService = sequelize.define('CourierService', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.STRING, unique: true },
  trackingUrl: { type: DataTypes.STRING },
  contactPhone: { type: DataTypes.STRING },
  contactEmail: { type: DataTypes.STRING },
  baseCost: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  perKgCost: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  estimatedDays: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('active','inactive'), defaultValue: 'active' }
});

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderNumber: { type: DataTypes.STRING, unique: true },
  userId: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('pending','confirmed','processing','shipped','delivered','cancelled','returned'), defaultValue: 'pending' },
  paymentStatus: { type: DataTypes.ENUM('unpaid','paid','refunded','partial'), defaultValue: 'unpaid' },
  paymentMethod: { type: DataTypes.STRING },
  subtotal: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  discount: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  shippingCost: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  tax: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  shippingAddress: { type: DataTypes.TEXT },
  billingAddress: { type: DataTypes.TEXT },
  courierId: { type: DataTypes.INTEGER },
  trackingNumber: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
  shippedAt: { type: DataTypes.DATE },
  deliveredAt: { type: DataTypes.DATE }
});

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER },
  productName: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL(10,2) },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  total: { type: DataTypes.DECIMAL(10,2) }
});

module.exports = { Order, OrderItem, CourierService };
