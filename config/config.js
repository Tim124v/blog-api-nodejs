require('dotenv').config();

const config = {
    development: {
        port: process.env.PORT || 8080,
        mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-dev',
        jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
        corsOrigin: ['http://localhost:8080', 'http://localhost:3000'],
        uploadDir: 'public/uploads',
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif']
    },
    production: {
        port: process.env.PORT || 8080,
        mongodbUri: process.env.MONGODB_URI,
        jwtSecret: process.env.JWT_SECRET,
        corsOrigin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [],
        uploadDir: 'public/uploads',
        maxFileSize: 5 * 1024 * 1024,
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif']
    },
    test: {
        port: process.env.PORT || 8081,
        mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-test',
        jwtSecret: process.env.JWT_SECRET || 'test-secret-key',
        corsOrigin: ['http://localhost:8081'],
        uploadDir: 'public/uploads/test',
        maxFileSize: 5 * 1024 * 1024,
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif']
    }
};

const env = process.env.NODE_ENV || 'development';
module.exports = config[env]; 