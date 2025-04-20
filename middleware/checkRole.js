const { AppError } = require('./errorHandler');

module.exports = (roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError('Пользователь не аутентифицирован', 401);
            }

            if (!roles.includes(req.user.role)) {
                throw new AppError('У вас нет прав для выполнения этого действия', 403);
            }

            next();
        } catch (err) {
            if (err instanceof AppError) {
                return res.status(err.statusCode).json({
                    status: err.status,
                    message: err.message
                });
            }
            return res.status(500).json({
                status: 'error',
                message: 'Ошибка сервера при проверке прав доступа'
            });
        }
    };
}; 