const express = require('express');
const router = express.Router();
const path = require('path');

// Обработка GET запросов к основным страницам
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обработка всех остальных GET запросов
router.get('*', (req, res, next) => {
    // Проверяем, не является ли запрос API запросом
    if (!req.url.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        next(); // Передаем управление следующему обработчику для API запросов
    }
});

module.exports = router; 