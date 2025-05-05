const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const checkRole = require('../../middleware/checkRole');
const { validate } = require('../../middleware/validation');
const { AppError } = require('../../middleware/errorHandler');

// Публичные маршруты (без авторизации)
// Временный маршрут для удаления постов по заголовку
router.delete('/cleanup/title/:title', async (req, res) => {
    try {
        const result = await Post.deleteMany({ title: req.params.title });
        res.json({ message: `Удалено ${result.deletedCount} постов` });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при удалении постов' });
    }
});

// Публичный маршрут для получения всех активных постов
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'active' })
            .populate('author', 'name')
            .populate('comments.author', 'name')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при получении постов' });
    }
});

// Защищенные маршруты (требуют авторизации)
router.use(auth);

// Получение конкретного поста
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findOne({ 
            _id: req.params.id,
            status: 'active'
        })
        .populate('author', 'name')
        .populate('comments.author', 'name');

        if (!post) {
            throw new AppError('Пост не найден', 404);
        }
        res.json(post);
    } catch (err) {
        if (err.name === 'CastError') {
            throw new AppError('Неверный формат ID поста', 400);
        }
        throw err;
    }
});

// Создание нового поста
router.post('/', [auth, validate('post')], async (req, res) => {
    try {
        const { title, content } = req.body;
        
        const post = new Post({
            title,
            content,
            author: req.user.userId,
            status: 'active'
        });

        await post.save();
        await post.populate('author', 'name');
        
        res.status(201).json(post);
    } catch (err) {
        console.error('Error creating post:', err);
        if (err instanceof AppError) {
            throw err;
        }
        throw new AppError('Ошибка при создании поста: ' + err.message, 500);
    }
});

// Обновление поста
router.put('/:id', [auth, validate('post')], async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            throw new AppError('Пост не найден', 404);
        }

        if (post.author.toString() !== req.user.id) {
            throw new AppError('Нет прав для редактирования этого поста', 403);
        }

        post.title = req.body.title;
        post.content = req.body.content;
        await post.save();
        await post.populate('author', 'name');
        res.json(post);
    } catch (err) {
        if (err.name === 'CastError') {
            throw new AppError('Неверный формат ID поста', 400);
        }
        throw err;
    }
});

// Удаление поста
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            throw new AppError('Пост не найден', 404);
        }

        if (post.author.toString() !== req.user.id && !['admin', 'moderator'].includes(req.user.role)) {
            throw new AppError('Нет прав для удаления этого поста', 403);
        }

        post.status = 'deleted';
        await post.save();
        res.json({ message: 'Пост успешно удален' });
    } catch (err) {
        if (err.name === 'CastError') {
            throw new AppError('Неверный формат ID поста', 400);
        }
        throw err;
    }
});

// Модерация поста (только для модераторов и админов)
router.post('/:id/moderate', [auth, checkRole(['admin', 'moderator'])], async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'hidden'].includes(status)) {
            throw new AppError('Неверный статус модерации', 400);
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            throw new AppError('Пост не найден', 404);
        }

        post.status = status;
        await post.save();
        res.json({ message: 'Статус поста успешно обновлен', status });
    } catch (err) {
        if (err.name === 'CastError') {
            throw new AppError('Неверный формат ID поста', 400);
        }
        throw err;
    }
});

// Добавление комментария к посту
router.post('/:id/comments', [auth, validate('comment')], async (req, res) => {
    try {
        const post = await Post.findOne({ 
            _id: req.params.id,
            status: 'active'
        });
        
        if (!post) {
            throw new AppError('Пост не найден', 404);
        }

        post.comments.push({
            content: req.body.content,
            author: req.user.id
        });

        await post.save();
        await post.populate('comments.author', 'name');
        res.status(201).json(post.comments[post.comments.length - 1]);
    } catch (err) {
        if (err.name === 'CastError') {
            throw new AppError('Неверный формат ID поста', 400);
        }
        throw err;
    }
});

module.exports = router; 