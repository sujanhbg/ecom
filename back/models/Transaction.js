const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.ENUM('income','expense','refund'), allowNull: false },
  category: { type: DataTypes.STRING },
  amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  description: { type: DataTypes.TEXT },
  reference: { type: DataTypes.STRING },
  orderId: { type: DataTypes.INTEGER },
  date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.ENUM('completed','pending','cancelled'), defaultValue: 'completed' }
});

module.exports = Transaction;
