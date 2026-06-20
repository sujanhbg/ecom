const sequelize = require('../config/database');
const User = require('./User');
const Role = require('./Role');
const { Permission, RolePermission } = require('./Permission');
const Category = require('./Category');
const Product = require('./Product');
const ProductVariation = require('./ProductVariation');
const Supplier = require('./Supplier');
const { Order, OrderItem, CourierService } = require('./Order');
const Transaction = require('./Transaction');
const { Promotion, Newsletter, Campaign } = require('./Marketing');
const Page = require('./Page');
const FAQ = require('./FAQ');
const Setting = require('./Setting');
const Menu = require('./Menu');

// Associations
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId' });

Product.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Product, { foreignKey: 'categoryId' });

Product.hasMany(ProductVariation, { foreignKey: 'productId', as: 'variations' });
ProductVariation.belongsTo(Product, { foreignKey: 'productId' });

Product.belongsTo(Supplier, { foreignKey: 'supplierId' });
Supplier.hasMany(Product, { foreignKey: 'supplierId' });

Order.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId' });

Order.belongsTo(CourierService, { foreignKey: 'courierId' });
CourierService.hasMany(Order, { foreignKey: 'courierId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

Transaction.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = {
  sequelize, User, Role, Permission, RolePermission,
  Category, Product, ProductVariation, Supplier, Order, OrderItem,
  CourierService, Transaction, Promotion, Newsletter, Campaign,
  Page, FAQ, Setting, Menu
};
