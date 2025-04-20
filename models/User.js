const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: 'https://via.placeholder.com/30'
    },
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});

// Хэширование пароля перед сохранением
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Метод для сравнения паролей
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 

async function exportUserData(req, res) {
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
} 

// Middleware для проверки роли
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Доступ запрещен' });
        }
        next();
    };
}; 