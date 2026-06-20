const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Menu = sequelize.define('Menu', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false }, // 'Home', 'All Products', etc.
  url: { type: DataTypes.STRING, allowNull: false }, // '/', '/products', etc.
  type: { type: DataTypes.ENUM('top', 'footer'), allowNull: false, defaultValue: 'top' },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 }
});

module.exports = Menu;
