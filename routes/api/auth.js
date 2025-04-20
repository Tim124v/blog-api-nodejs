const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const { validate } = require('../../middleware/validation');
const { AppError } = require('../../middleware/errorHandler');

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', validate('register'), async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            throw new AppError('Пользователь с таким email уже существует', 400);
        }

        // Create new user
        user = new User({
            name,
            email,
            password,
            role: 'user' // По умолчанию роль - user
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user
        await user.save();

        // Create token
        const payload = {
            id: user.id,
            role: user.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        if (err instanceof AppError) {
            throw err;
        }
        console.error('Registration error:', err);
        throw new AppError('Ошибка при регистрации', 500);
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate('login'), async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError('Неверный email или пароль', 400);
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError('Неверный email или пароль', 400);
        }

        // Create token
        const payload = {
            id: user.id,
            role: user.role
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        if (err instanceof AppError) {
            throw err;
        }
        console.error('Login error:', err);
        throw new AppError('Ошибка при входе в систему', 500);
    }
});

// @route   GET /api/auth/me
// @desc    Get logged in user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            throw new AppError('Пользователь не найден', 404);
        }
        res.json(user);
    } catch (err) {
        if (err instanceof AppError) {
            throw err;
        }
        console.error('Get user error:', err);
        throw new AppError('Ошибка при получении данных пользователя', 500);
    }
});

module.exports = router; 