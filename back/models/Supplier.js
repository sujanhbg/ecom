const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Supplier = sequelize.define('Supplier', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  company: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  city: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('active','inactive'), defaultValue: 'active' },
  notes: { type: DataTypes.TEXT }
});

module.exports = Supplier;
