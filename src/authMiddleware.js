// authMiddleware.js

function isAdmin(req, res, next) {
    // Проверяем, является ли текущий пользователь администратором
    if (req.session &&req.session.user.isAdmin) {
      return next();
    } else {
      return res.redirect('/login'); // Редирект, если не администратор
    }
  }
  
  function isAuthenticated(req, res, next) {
    if (req.session.user) {
      return next();
    } else {
      return res.redirect('/login');
    }
  }
  
  module.exports = {
    isAdmin,
    isAuthenticated,
  };
  