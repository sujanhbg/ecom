const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  avatar: { type: DataTypes.STRING },
  role: { type: DataTypes.ENUM('superadmin','admin','staff','client'), defaultValue: 'client' },
  status: { type: DataTypes.ENUM('active','inactive','banned'), defaultValue: 'active' },
  address: { type: DataTypes.TEXT },
  city: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) user.password = await bcrypt.hash(user.password, 10);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10);
    }
  }
});

User.prototype.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = User;
