const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Page = sequelize.define('Page', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  key: { type: DataTypes.STRING, unique: true, allowNull: false }, // 'about', 'contact', 'delivery_rules'
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  metaTitle: { type: DataTypes.STRING },
  metaDescription: { type: DataTypes.TEXT },
  metaKeywords: { type: DataTypes.STRING }
});

module.exports = Page;
