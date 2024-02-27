// routes.js

const express = require('express');
const router = express.Router();
const middleware = require('./middleware'); // Путь к вашему middleware

// Защита маршрута, доступного только авторизованным пользователям
router.get('/protected-route', middleware.isAuthenticated, (req, res) => {
    res.send('Это защищенный маршрут, только для авторизованных пользователей');
});

// Защита маршрута, доступного только пользователям с ролью 'admin'
router.get('/admin-route', middleware.isAuthenticated, middleware.checkRole('admin'), (req, res) => {
    res.send('Это защищенный маршрут только для администраторов');
});

module.exports = router;
