const { DataTypes } = require('sequelize');
const mysqlDB = require('./mysql');
const User = require('./userModel');
const Coupon = require('./couponModel');

const Redemption = mysqlDB.define('Redemption', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  couponId: {
    type: DataTypes.INTEGER,
    references: {
      model: Coupon,
      key: 'id'
    }
  },
  redemptionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'redemptions'
});

User.hasMany(Redemption, { foreignKey: 'userId' });
Coupon.hasMany(Redemption, { foreignKey: 'couponId' });
Redemption.belongsTo(User, { foreignKey: 'userId' });
Redemption.belongsTo(Coupon, { foreignKey: 'couponId' });

module.exports = Redemption;