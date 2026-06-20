const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, unique: true },
  description: { type: DataTypes.TEXT },
  image: { type: DataTypes.STRING },
  parentId: { type: DataTypes.INTEGER, defaultValue: null },
  status: { type: DataTypes.ENUM('active','inactive'), defaultValue: 'active' },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 }
});

Category.hasMany(Category, { as: 'children', foreignKey: 'parentId' });
Category.belongsTo(Category, { as: 'parent', foreignKey: 'parentId' });

module.exports = Category;
