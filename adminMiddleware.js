const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ заборонено. Потрібні права адміністратора' });
    }
    next();
  };
  
  module.exports = adminMiddleware;