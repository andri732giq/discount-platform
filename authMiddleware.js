const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Немає доступу, токен відсутній' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Додаємо розшифровані дані користувача в запит
    next();
  } catch (error) {
    res.status(403).json({ error: 'Невірний токен' });
  }
};

module.exports = authMiddleware;