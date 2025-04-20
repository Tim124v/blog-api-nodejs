# Blog API

Простой REST API для блога, построенный на Node.js, Express и MongoDB.

## Функциональность

- Регистрация и аутентификация пользователей
- Создание, чтение, обновление и удаление постов
- Защищенные маршруты с JWT аутентификацией
- Поиск по постам
- Теги для постов

## Технологии

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt
- CORS

## Установка

1. Клонируйте репозиторий
2. Установите зависимости:
```bash
npm install
```
3. Создайте файл .env и добавьте необходимые переменные окружения:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/blog-api
JWT_SECRET=your-secret-key
```
4. Запустите сервер:
```bash
node index.js
```

## API Endpoints

### Аутентификация
- POST /api/auth/register - Регистрация нового пользователя
- POST /api/auth/login - Вход пользователя

### Посты
- GET /api/posts - Получить все посты
- GET /api/posts/:id - Получить пост по ID
- POST /api/posts - Создать новый пост (требуется аутентификация)
- PUT /api/posts/:id - Обновить пост (требуется аутентификация)
- DELETE /api/posts/:id - Удалить пост (требуется аутентификация)

## Лицензия

MIT 