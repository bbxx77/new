// routes.js

const express = require('express');
const router = express.Router();
const {isAdmin} = require('./authMiddleware'); // Путь к вашему middleware

// Защита маршрута, доступного только авторизованным пользователям
router.get('/protected-route', (req, res) => {
    res.send('Это защищенный маршрут, только для авторизованных пользователей');
});

// Защита маршрута, доступного только пользователям с ролью 'admin'
router.get('/admin-route', isAdmin, (req, res) => {
    res.send('Это защищенный маршрут только для администраторов');
});

module.exports = router;
