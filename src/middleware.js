
function isAuthenticated(req, res, next) {
    console.log(req.session)
    console.log(req.session.username)
    if (req.session && req.session.userName) {
        return next(); // Пользователь авторизован, продолжаем выполнение запроса
    } else {
        res.redirect('/login'); // Пользователь не авторизован, перенаправляем на страницу входа
    }
}

function isAdmin(role) {
    return (req, res, next) => {
        // Предполагается, что информация о роли пользователя хранится в сессии или базе данных
        const userRole = req.session.role; // Здесь используется session, но вы можете использовать вашу собственную логику

        if (userRole && userRole === role) {
            return next(); // Пользователь имеет правильную роль, продолжаем выполнение запроса
        } else {
            res.status(403).send('У вас нет прав для выполнения этого действия');
        }
    };
}

module.exports = {
    isAuthenticated,
    isAdmin
};
