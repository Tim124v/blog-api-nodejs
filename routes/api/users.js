const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Регистрация пользователя
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Проверяем, существует ли пользователь
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        // Создаем нового пользователя
        user = new User({
            name,
            email,
            password
        });

        await user.save();

        // Создаем JWT токен
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Отправляем ответ без пароля
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            token,
            user: userResponse
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при регистрации пользователя' });
    }
});

// Вход пользователя
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Проверяем существование пользователя
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Неверный email или пароль' });
        }

        // Проверяем пароль
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Неверный email или пароль' });
        }

        // Создаем JWT токен
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Отправляем ответ без пароля
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            token,
            user: userResponse
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при входе в систему' });
    }
});

// Получение информации о текущем пользователе
router.get('/me', async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при получении данных пользователя' });
    }
});

module.exports = router; 