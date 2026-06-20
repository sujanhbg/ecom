const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductVariation = sequelize.define('ProductVariation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false }, // e.g., "XL", "Blue"
  sku: { type: DataTypes.STRING },
  price: { type: DataTypes.DECIMAL(10,2) },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  image: { type: DataTypes.STRING } // Variation specific image
});

module.exports = ProductVariation;
