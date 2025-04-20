const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

module.exports = (req, res, next) => {
    if (req.method === 'GET') {
        return next();
    }

    try {
        // Получаем токен из заголовка
        const authHeader = req.header('Authorization');
        
        if (!authHeader) {
            throw new AppError('Нет токена авторизации', 401);
        }

        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;

        if (!token) {
            throw new AppError('Некорректный формат токена', 401);
        }

        // Проверяем токен
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = {
                id: decoded.id,
                role: decoded.role || 'user' // Если роль не указана, используем 'user'
            };
            next();
        } catch (err) {
            throw new AppError('Токен недействителен', 401);
        }
    } catch (err) {
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({ 
                status: 'error',
                message: err.message 
            });
        }
        return res.status(500).json({ 
            status: 'error',
            message: 'Ошибка сервера при проверке авторизации' 
        });
    }
}; 