const Post = require('../models/Post');

const postController = {
  async createPost(req, res) {
    try {
      const { title, content, tags } = req.body;
      const post = new Post({
        title,
        content,
        author: req.user.userId,
        tags
      });
      await post.save();
      await post.populate('author', 'name avatar');
      res.status(201).json(post);
    } catch (error) {
      console.error('Ошибка при создании поста:', error);
      res.status(500).json({ message: 'Ошибка при создании поста' });
    }
  },

  async getPosts(req, res) {
    try {
      const posts = await Post.find()
        .populate('author', 'name avatar')
        .populate('comments.author', 'name avatar')
        .sort({ createdAt: -1 });
      res.json(posts);
    } catch (error) {
      console.error('Ошибка при получении постов:', error);
      res.status(500).json({ message: 'Ошибка при получении постов' });
    }
  },

  async getPost(req, res) {
    try {
      const post = await Post.findById(req.params.id)
        .populate('author', 'name')
        .populate('comments.author', 'name');
      if (!post) {
        return res.status(404).json({ message: 'Пост не найден' });
      }
      res.json(post);
    } catch (error) {
      console.error('Ошибка при получении поста:', error);
      res.status(500).json({ message: 'Ошибка при получении поста' });
    }
  },

  async updatePost(req, res) {
    try {
      const { title, content, tags } = req.body;
      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: 'Пост не найден' });
      }
      
      // Проверяем, является ли пользователь автором поста
      if (post.author.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Нет прав для редактирования этого поста' });
      }
      
      post.title = title;
      post.content = content;
      post.tags = tags;
      await post.save();
      await post.populate('author', 'name avatar');
      
      res.json(post);
    } catch (error) {
      console.error('Ошибка при обновлении поста:', error);
      res.status(500).json({ message: 'Ошибка при обновлении поста' });
    }
  },

  async deletePost(req, res) {
    try {
      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: 'Пост не найден' });
      }
      
      // Проверяем, является ли пользователь автором поста
      if (post.author.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Нет прав для удаления этого поста' });
      }
      
      await post.deleteOne();
      res.json({ message: 'Пост успешно удален' });
    } catch (error) {
      console.error('Ошибка при удалении поста:', error);
      res.status(500).json({ message: 'Ошибка при удалении поста' });
    }
  },

  async addComment(req, res) {
    try {
      const { content } = req.body;
      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: 'Пост не найден' });
      }
      
      post.comments.push({
        content,
        author: req.user.userId
      });
      
      await post.save();
      await post.populate('comments.author', 'name');
      
      res.status(201).json(post.comments[post.comments.length - 1]);
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
      res.status(500).json({ message: 'Ошибка при добавлении комментария' });
    }
  },

  async deleteComment(req, res) {
    try {
      const post = await Post.findById(req.params.postId);
      
      if (!post) {
        return res.status(404).json({ message: 'Пост не найден' });
      }
      
      const comment = post.comments.id(req.params.commentId);
      
      if (!comment) {
        return res.status(404).json({ message: 'Комментарий не найден' });
      }
      
      // Проверяем, является ли пользователь автором комментария
      if (comment.author.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Нет прав для удаления этого комментария' });
      }
      
      comment.remove();
      await post.save();
      
      res.json({ message: 'Комментарий удален' });
    } catch (error) {
      console.error('Ошибка при удалении комментария:', error);
      res.status(500).json({ message: 'Ошибка при удалении комментария' });
    }
  }
};

module.exports = postController; 