const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Permission = sequelize.define('Permission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  module: { type: DataTypes.STRING, allowNull: false },
  action: { type: DataTypes.ENUM('create','read','update','delete','manage'), allowNull: false },
  description: { type: DataTypes.STRING }
});

const RolePermission = sequelize.define('RolePermission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  roleId: { type: DataTypes.INTEGER, allowNull: false },
  permissionId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = { Permission, RolePermission };
