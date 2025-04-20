const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    type: { 
        type: String, 
        enum: ['comment', 'like', 'mention'],
        required: true
    },
    post: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post',
        required: true
    },
    from: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    read: { 
        type: Boolean, 
        default: false 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema); 