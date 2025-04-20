const User = require('../models/User');
const Post = require('../models/Post');
const { checkRole } = require('../middleware/checkRole');

const userController = {
    // Получить профиль текущего пользователя
    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.userId).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
            res.json(user);
        } catch (error) {
            console.error('Ошибка при получении профиля:', error);
            res.status(500).json({ message: 'Ошибка при получении профиля' });
        }
    },

    // Обновить профиль текущего пользователя
    async updateProfile(req, res) {
        try {
            const { name, email } = req.body;
            const user = await User.findById(req.user.userId);
            
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            user.name = name || user.name;
            user.email = email || user.email;

            await user.save();
            res.json({ message: 'Профиль успешно обновлен', user });
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            res.status(500).json({ message: 'Ошибка при обновлении профиля' });
        }
    },

    // Получить список всех пользователей (только для админов)
    async getUsers(req, res) {
        try {
            if (!checkRole(['admin'])(req, res, () => {})) {
                return res.status(403).json({ message: 'Доступ запрещен' });
            }
            const users = await User.find().select('-password');
            res.json(users);
        } catch (error) {
            console.error('Ошибка при получении списка пользователей:', error);
            res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
        }
    },

    // Получить пользователя по ID (только для админов)
    async getUserById(req, res) {
        try {
            if (!checkRole(['admin'])(req, res, () => {})) {
                return res.status(403).json({ message: 'Доступ запрещен' });
            }
            const user = await User.findById(req.params.id).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
            res.json(user);
        } catch (error) {
            console.error('Ошибка при получении пользователя:', error);
            res.status(500).json({ message: 'Ошибка при получении пользователя' });
        }
    },

    // Обновить пользователя (только для админов)
    async updateUser(req, res) {
        try {
            if (!checkRole(['admin'])(req, res, () => {})) {
                return res.status(403).json({ message: 'Доступ запрещен' });
            }
            const { name, email, role } = req.body;
            const user = await User.findById(req.params.id);
            
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            user.name = name || user.name;
            user.email = email || user.email;
            user.role = role || user.role;

            await user.save();
            res.json({ message: 'Пользователь успешно обновлен', user });
        } catch (error) {
            console.error('Ошибка при обновлении пользователя:', error);
            res.status(500).json({ message: 'Ошибка при обновлении пользователя' });
        }
    },

    // Удалить пользователя (только для админов)
    async deleteUser(req, res) {
        try {
            if (!checkRole(['admin'])(req, res, () => {})) {
                return res.status(403).json({ message: 'Доступ запрещен' });
            }
            const user = await User.findById(req.params.id);
            
            if (!user) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }

            await user.remove();
            res.json({ message: 'Пользователь успешно удален' });
        } catch (error) {
            console.error('Ошибка при удалении пользователя:', error);
            res.status(500).json({ message: 'Ошибка при удалении пользователя' });
        }
    },

    // Экспорт данных пользователя
    async exportUserData(req, res) {
        try {
            const user = await User.findById(req.user.userId);
            const posts = await Post.find({ author: req.user.userId });
            const comments = await Post.aggregate([
                { $unwind: "$comments" },
                { $match: { "comments.author": req.user.userId } }
            ]);
            
            const data = {
                user,
                posts,
                comments
            };
            
            res.json(data);
        } catch (error) {
            console.error('Ошибка при экспорте данных:', error);
            res.status(500).json({ message: 'Ошибка при экспорте данных' });
        }
    }
};

module.exports = userController; 