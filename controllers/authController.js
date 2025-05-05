const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Joi = require('joi');
const { AppError } = require('../middleware/errorHandler');

// Схема валидации для регистрации
const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
        'string.empty': 'Имя обязательно для заполнения',
        'string.min': 'Имя должно содержать минимум 2 символа',
        'string.max': 'Имя не должно превышать 50 символов'
    }),
    email: Joi.string().email().required().messages({
        'string.empty': 'Email обязателен для заполнения',
        'string.email': 'Пожалуйста, введите корректный email'
    }),
    password: Joi.string().min(6).required().messages({
        'string.empty': 'Пароль обязателен для заполнения',
        'string.min': 'Пароль должен содержать минимум 6 символов'
    })
});

// Схема валидации для входа
const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email обязателен для заполнения',
        'string.email': 'Пожалуйста, введите корректный email'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Пароль обязателен для заполнения'
    })
});

// Регистрация нового пользователя
exports.register = async (req, res, next) => {
    try {
        // Валидация входных данных
        const { error } = registerSchema.validate(req.body);
        if (error) {
            throw new AppError(error.details.map(detail => detail.message).join(', '), 400);
        }

        const { name, email, password } = req.body;

        // Проверяем, существует ли пользователь с таким email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new AppError('Пользователь с таким email уже существует', 400);
        }

        // Создаем нового пользователя
        const user = new User({ name, email, password });
        await user.save();

        // Создаем JWT токен
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Регистрация успешно завершена',
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        next(error);
    }
};

// Вход пользователя
exports.login = async (req, res, next) => {
    try {
        // Валидация входных данных
        const { error } = loginSchema.validate(req.body);
        if (error) {
            throw new AppError(error.details.map(detail => detail.message).join(', '), 400);
        }

        const { email, password } = req.body;

        // Находим пользователя
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError('Неверный email или пароль', 401);
        }

        // Проверяем пароль
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new AppError('Неверный email или пароль', 401);
        }

        // Создаем JWT токен
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Вход выполнен успешно',
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        next(error);
    }
};

// Получение информации о текущем пользователе
exports.me = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            throw new AppError('Пользователь не найден', 404);
        }
        res.json(user.getPublicProfile());
    } catch (error) {
        next(error);
    }
}; 