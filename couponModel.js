const { DataTypes } = require('sequelize');
const mysqlDB = require('./mysql');

const Coupon = mysqlDB.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  discount: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  expirationDate: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'coupons'
});

module.exports = Coupon;