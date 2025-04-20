const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'hidden', 'deleted'],
        default: 'active'
    },
    comments: [commentSchema]
}, {
    timestamps: true
});

// Добавляем виртуальное поле для аватара автора
postSchema.virtual('authorDetails', {
    ref: 'User',
    localField: 'author',
    foreignField: '_id',
    justOne: true
});

// Настраиваем преобразование в JSON
postSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        if (ret.authorDetails) {
            ret.author = {
                _id: ret.authorDetails._id,
                name: ret.authorDetails.name,
                avatar: ret.authorDetails.avatar || 'https://via.placeholder.com/30'
            };
        }
        delete ret.authorDetails;
        return ret;
    }
});

module.exports = mongoose.model('Post', postSchema); 