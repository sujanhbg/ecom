const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setting = sequelize.define('Setting', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  key: { type: DataTypes.STRING, unique: true, allowNull: false }, // 'siteTitle', 'metaDescription', 'metaKeywords'
  value: { type: DataTypes.TEXT }
});

module.exports = Setting;
