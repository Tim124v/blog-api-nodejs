const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    if (req.method === 'GET') {
        return next();
    }

    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Нет токена авторизации' });
        }

        try {
            // Проверяем токен
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            res.status(401).json({ message: 'Токен недействителен' });
        }
    } catch (err) {
        res.status(401).json({ message: 'Ошибка авторизации' });
    }
}; 