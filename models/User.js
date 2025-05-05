const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Имя обязательно для заполнения'],
        trim: true,
        minlength: [2, 'Имя должно содержать минимум 2 символа'],
        maxlength: [50, 'Имя не должно превышать 50 символов']
    },
    email: {
        type: String,
        required: [true, 'Email обязателен для заполнения'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Пожалуйста, введите корректный email']
    },
    password: {
        type: String,
        required: [true, 'Пароль обязателен для заполнения'],
        minlength: [6, 'Пароль должен содержать минимум 6 символов']
    },
    avatar: {
        type: String,
        default: 'https://via.placeholder.com/150'
    },
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    },
    bio: {
        type: String,
        maxlength: [200, 'Биография не должна превышать 200 символов'],
        default: ''
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            return ret;
        }
    }
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
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Ошибка при сравнении паролей');
    }
};

// Метод для получения публичного профиля
userSchema.methods.getPublicProfile = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.__v;
    return userObject;
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