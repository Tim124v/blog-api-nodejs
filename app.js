const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:8080'],
    credentials: true
}));
app.use(express.json());
app.use(express.static('public'));

// CSP middleware
app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
        "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
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
    console.log('GET request to /');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404
app.use((req, res, next) => {
    console.log('404 handler:', req.path);
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
console.log('Starting server on port:', PORT);

let server;

// Connect to MongoDB and start server
async function startServer() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('MongoDB Connected');

        server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });

        // Обработка ошибок сервера
        server.on('error', (error) => {
            console.error('Server error:', error);
            if (error.code === 'EADDRINUSE') {
                console.log(`Port ${PORT} is busy, trying to close previous connection...`);
                require('child_process').exec(`npx kill-port ${PORT}`, (err) => {
                    if (err) {
                        console.error('Error killing process on port:', err);
                    } else {
                        console.log(`Successfully killed process on port ${PORT}`);
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
    console.log('Received kill signal, shutting down gracefully');
    if (server) {
        server.close(() => {
            console.log('Server closed');
            mongoose.connection.close(false, () => {
                console.log('MongoDB connection closed');
                process.exit(0);
            });
        });
    } else {
        process.exit(0);
    }
}

startServer(); 