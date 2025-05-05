require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const { errorHandler } = require('./middleware/errorHandler');
const connectDB = require('./config/db');

const app = express();

// Подключение к базе данных
connectDB();

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// CSP middleware
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' http://localhost:* https://localhost:*; " +
        "script-src 'self' 'unsafe-inline'"
    );
    next();
});

// API Routes
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/posts', require('./routes/api/posts'));

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        const error = new Error('Not Found');
        error.statusCode = 404;
        next(error);
    } else {
        res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
    }
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 8080;
let server;

// Connect to MongoDB and start server
async function startServer() {
    try {
        await connectDB();
        console.log('MongoDB Connected');

        server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });

        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                require('child_process').exec(`npx kill-port ${PORT}`, (err) => {
                    if (!err) {
                        startServer();
                    }
                });
            }
        });

    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
    if (server) {
        server.close(() => {
            mongoose.connection.close(false, () => {
                process.exit(0);
            });
        });
    } else {
        process.exit(0);
    }
}

startServer(); 