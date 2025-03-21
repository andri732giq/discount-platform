const { Sequelize } = require('sequelize');
require('dotenv').config();

const mysqlDB = new Sequelize(
  process.env.MYSQL_DATABASE,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASSWORD,
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    logging: false
  }
);

mysqlDB.authenticate()
  .then(() => console.log('MySQL підключено'))
  .catch(err => console.error('Помилка MySQL:', err));

module.exports = mysqlDB;