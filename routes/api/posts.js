const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const User = require('../../models/User');
const auth = require('../../middleware/auth');

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

// Защищенные маршруты (требуют авторизации)
router.use(auth);

// @route   GET api/posts
// @desc    Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author')
            .populate('comments.author')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при получении постов' });
    }
});

// @route   POST api/posts
// @desc    Create a post
router.post('/', async (req, res) => {
    try {
        const { title, content } = req.body;
        
        if (!title || !content) {
            return res.status(400).json({ message: 'Заголовок и содержание обязательны' });
        }

        const post = new Post({
            title,
            content,
            author: req.user.userId
        });

        const savedPost = await post.save();
        await savedPost.populate('author');
        
        res.json(savedPost);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при создании поста' });
    }
});

// @route   GET api/posts/:id
// @desc    Get post by ID
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Пост не найден' });
        }

        if (post.author.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Нет прав для удаления этого поста' });
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Пост успешно удален' });
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при удалении поста' });
    }
});

// @route   PUT api/posts/:id
// @desc    Update a post
router.put('/:id', async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Пост не найден' });
        }

        if (post.author.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Нет прав для редактирования этого поста' });
        }

        post.title = title || post.title;
        post.content = content || post.content;

        const updatedPost = await post.save();
        await updatedPost.populate('author');
        await updatedPost.populate('comments.author');

        res.json(updatedPost);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при обновлении поста' });
    }
});

// @route   POST api/posts/:id/comments
// @desc    Add a comment to a post
router.post('/:id/comments', async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content) {
            return res.status(400).json({ message: 'Содержание комментария обязательно' });
        }

        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Пост не найден' });
        }

        post.comments.push({
            content,
            author: req.user.userId
        });

        const updatedPost = await post.save();
        await updatedPost.populate('author');
        await updatedPost.populate('comments.author');

        res.json(updatedPost);
    } catch (err) {
        res.status(500).json({ message: 'Ошибка при добавлении комментария' });
    }
});

module.exports = router; 