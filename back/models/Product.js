const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true },
  sku: { type: DataTypes.STRING, unique: true },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
  costPrice: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  comparePrice: { type: DataTypes.DECIMAL(10,2) },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  lowStockThreshold: { type: DataTypes.INTEGER, defaultValue: 5 },
  image: { type: DataTypes.STRING },
  images: { type: DataTypes.JSON },
  videos: { type: DataTypes.JSON },
  categoryId: { type: DataTypes.INTEGER },
  supplierId: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('active','inactive','draft'), defaultValue: 'active' },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  weight: { type: DataTypes.DECIMAL(8,2) },
  unit: { type: DataTypes.STRING, defaultValue: 'pcs' },
  metaTitle: { type: DataTypes.STRING },
  metaDescription: { type: DataTypes.TEXT }
});

module.exports = Product;
