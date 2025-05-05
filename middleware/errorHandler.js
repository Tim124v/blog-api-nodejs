class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Обработка ошибок валидации
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Ошибка валидации',
            details: Object.values(err.errors).map(error => error.message)
        });
    }

    // Обработка ошибок MongoDB
    if (err.name === 'MongoError' && err.code === 11000) {
        return res.status(400).json({
            message: 'Дублирование уникального поля'
        });
    }

    // Обработка ошибок JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            message: 'Недействительный токен'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            message: 'Срок действия токена истек'
        });
    }

    // Обработка остальных ошибок
    res.status(typeof err.statusCode === 'number' ? err.statusCode : 500).json({
        message: err.message || 'Внутренняя ошибка сервера',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};

module.exports = { AppError, errorHandler }; 