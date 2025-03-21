const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./userModel');
const { validationResult } = require('express-validator');

const register = async (req, res) => {
  // Перевірка помилок валідації
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role } = req.body;

  try {
    // Перевірка, чи користувач уже існує
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Користувач з таким email уже існує' });
    }

    // Створення нового користувача
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user' // Якщо role не вказано, за замовчуванням 'user'
    });

    res.status(201).json({ message: 'Користувач створений!', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  // Перевірка помилок валідації
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Пошук користувача
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Невірний email або пароль' });
    }

    // Перевірка пароля
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Невірний email або пароль' });
    }

    // Генерація JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login };