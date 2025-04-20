const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Post = require('../models/Post');

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Удаляем все посты
        const result = await Post.deleteMany({});
        console.log(`Удалено ${result.deletedCount} постов`);

        // Закрываем соединение
        await mongoose.connection.close();
        console.log('Соединение с MongoDB закрыто');
        
        process.exit(0);
    } catch (err) {
        console.error('Ошибка:', err);
        process.exit(1);
    }
}

cleanup(); 