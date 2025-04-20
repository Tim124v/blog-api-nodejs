const User = require('../models/User');
const Post = require('../models/Post');

const userController = {
    async exportUserData(req, res) {
        try {
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
        } catch (error) {
            console.error('Ошибка при экспорте данных:', error);
            res.status(500).json({ message: 'Ошибка при экспорте данных' });
        }
    }
};

module.exports = userController; 