const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Post = require('../models/Post');

beforeAll(async () => {
  // Подключаемся к тестовой базе данных
  await mongoose.connect('mongodb://127.0.0.1:27017/blog-api-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

beforeEach(async () => {
  // Очищаем базу данных перед каждым тестом
  await Post.deleteMany({});
});

afterAll(async () => {
  // Закрываем соединение с базой данных после всех тестов
  await mongoose.connection.close();
});

describe('Posts API', () => {
  describe('GET /api/posts', () => {
    it('should return empty array when no posts exist', async () => {
      const res = await request(app)
        .get('/api/posts')
        .expect(200);
      
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(0);
    });

    it('should return all posts', async () => {
      const testPost = new Post({
        title: 'Test Post',
        content: 'Test Content',
        author: 'Test Author'
      });
      await testPost.save();

      const res = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Test Post');
    });
  });

  describe('POST /api/posts', () => {
    it('should create a new post', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({
          title: 'New Post',
          content: 'New Content',
          author: 'New Author'
        })
        .expect(201);

      expect(res.body.title).toBe('New Post');
      expect(res.body.content).toBe('New Content');
      
      const post = await Post.findById(res.body._id);
      expect(post).toBeTruthy();
    });

    it('should return 400 if title is missing', async () => {
      await request(app)
        .post('/api/posts')
        .send({
          content: 'New Content',
          author: 'New Author'
        })
        .expect(400);
    });
  });
}); 