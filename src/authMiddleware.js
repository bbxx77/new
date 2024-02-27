// authMiddleware.js

function isAdmin(req, res, next) {
    // Проверяем, является ли текущий пользователь администратором
    if (req.session && req.session.userName && req.session.role === 'admin') {
      return next();
    } else {
      return res.redirect('/login'); // Редирект, если не администратор
    }
  }
  
  function isAuthenticated(req, res, next) {
    if (req.session && req.session.userName) {
      return next();
    } else {
      return res.redirect('/login');
    }
  }
  
  module.exports = {
    isAdmin,
    isAuthenticated,
  };
  