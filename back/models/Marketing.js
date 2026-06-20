const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Promotion = sequelize.define('Promotion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  code: { type: DataTypes.STRING, unique: true },
  type: { type: DataTypes.ENUM('percentage','fixed','free_shipping'), defaultValue: 'percentage' },
  value: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  minOrderAmount: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
  maxUses: { type: DataTypes.INTEGER },
  usedCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  startDate: { type: DataTypes.DATE },
  endDate: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('active','inactive','expired'), defaultValue: 'active' },
  description: { type: DataTypes.TEXT }
});

const Newsletter = sequelize.define('Newsletter', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM('subscribed','unsubscribed'), defaultValue: 'subscribed' },
  subscribedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const Campaign = sequelize.define('Campaign', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  subject: { type: DataTypes.STRING },
  content: { type: DataTypes.TEXT('long') },
  status: { type: DataTypes.ENUM('draft','sent','scheduled'), defaultValue: 'draft' },
  sentAt: { type: DataTypes.DATE },
  recipientCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  scheduledAt: { type: DataTypes.DATE }
});

module.exports = { Promotion, Newsletter, Campaign };
