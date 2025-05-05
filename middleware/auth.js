const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

module.exports = (req, res, next) => {
    try {
        // Получаем токен из заголовка
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Нет токена авторизации' });
        }

        // Проверяем токен
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Добавляем информацию о пользователе в запрос
        req.user = decoded;
        
        next();
    } catch (error) {
        res.status(401).json({ message: 'Токен недействителен' });
    }
}; 