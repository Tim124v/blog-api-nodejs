const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const postsRouter = require('./routes/api/posts');
const authController = require('./controllers/authController');
const auth = require('./middleware/auth');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:8080'],
    credentials: true
}));

// Настройка Content Security Policy
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
    );
    next();
});

// API маршруты (должны быть перед основными маршрутами и статическими файлами)
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', auth, authController.me);
app.use('/api/posts', auth, postsRouter);

// Маршрут для очистки (временный)
app.delete('/api/cleanup/posts', async (req, res) => {
    try {
        const Post = require('./models/Post');
        const result = await Post.deleteMany({ 
            $or: [
                { author: null },
                { author: { $exists: false } }
            ]
        });
        res.json({ message: `Удалено ${result.deletedCount} постов` });
    } catch (err) {
        console.error('Ошибка при удалении постов:', err);
        res.status(500).json({ message: 'Ошибка при удалении постов' });
    }
});

// Обработка 404 для API запросов
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

// Статические файлы и основные маршруты
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

// Обработка 404 для остальных запросов
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
.then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app; 