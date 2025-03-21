const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { body } = require('express-validator');
require('dotenv').config();
const mysqlDB = require('./mysql');
const Coupon = require('./couponModel');
const User = require('./userModel');
const Redemption = require('./redemptionModel');
const { register, login } = require('./authController');
const authMiddleware = require('./authMiddleware');
const adminMiddleware = require('./adminMiddleware');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Синхронізація моделей з базою даних
mysqlDB.sync({ force: true }).then(() => {
  console.log('Таблиці створено');
});

// Реєстрація користувача з валідацією
app.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Ім\'я обов\'язкове'),
    body('email').isEmail().withMessage('Невірний формат email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Пароль повинен містити мінімум 6 символів'),
    body('role').optional().isIn(['user', 'admin']).withMessage('Роль має бути "user" або "admin"')
  ],
  register
);

// Вхід користувача з валідацією
app.post(
  '/login',
  [
    body('email').isEmail().withMessage('Невірний формат email'),
    body('password').notEmpty().withMessage('Пароль обов\'язковий')
  ],
  login
);

// CRUD для купонів

// Додати новий купон (доступно лише для адмінів)
app.post(
  '/coupons',
  authMiddleware,
  adminMiddleware,
  [
    body('code').notEmpty().withMessage('Код купона обов\'язковий'),
    body('discount')
      .isInt({ min: 1, max: 100 })
      .withMessage('Знижка має бути числом від 1 до 100'),
    body('expirationDate')
      .isISO8601()
      .withMessage('Невірний формат дати (потрібно YYYY-MM-DD)')
  ],
  async (req, res) => {
    try {
      const { code, discount, expirationDate } = req.body;
      const coupon = await Coupon.create({ code, discount, expirationDate });
      res.status(201).json(coupon);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Отримати доступні знижки (доступно для всіх автентифікованих користувачів)
app.get('/coupons/available', authMiddleware, async (req, res) => {
  try {
    const coupons = await Coupon.findAll({
      where: {
        expirationDate: { [mysqlDB.Sequelize.Op.gte]: new Date() }
      }
    });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Використати купон (доступно для всіх автентифікованих користувачів)
app.post(
  '/redemptions',
  authMiddleware,
  [
    body('couponId').isInt().withMessage('couponId має бути числом')
  ],
  async (req, res) => {
    try {
      const { couponId } = req.body;
      const userId = req.user.id; // Отримуємо userId з токена

      // Перевірка, чи існує купон і чи він дійсний
      const coupon = await Coupon.findByPk(couponId);
      if (!coupon) {
        return res.status(404).json({ error: `Купон з id ${couponId} не знайдений` });
      }
      if (coupon.expirationDate < new Date()) {
        return res.status(400).json({ error: 'Купон прострочений' });
      }

      // Створення запису в redemptions
      const redemption = await Redemption.create({ userId, couponId });
      res.status(201).json(redemption);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Видалити прострочені купони (доступно лише для адмінів)
app.delete('/coupons/expired', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deleted = await Coupon.destroy({
      where: {
        expirationDate: { [mysqlDB.Sequelize.Op.lt]: new Date() }
      }
    });
    res.json({ message: `Видалено ${deleted} прострочених купонів` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Видалити користувача (доступно лише для адмінів)
app.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: `Користувач з id ${id} не знайдений` });
    }
    await user.destroy();
    res.json({ message: 'Користувача видалено' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущено на порту ${port}`);
});