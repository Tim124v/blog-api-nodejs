# Blog API

A RESTful API for a blog platform built with Node.js, Express and MongoDB.

## Features

- User registration and authentication
- JWT-based protected routes
- CRUD operations for blog posts
- Comments system
- Post search functionality
- Post tags support

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt
- CORS

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/Tim124v/blog-api-nodejs.git
cd blog-api-nodejs
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the root directory:
```env
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:8080](http://localhost:8080) in your browser.

## API Endpoints

### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user

### Posts
- GET `/api/posts` - Get all posts
- POST `/api/posts` - Create new post
- GET `/api/posts/:id` - Get post by ID
- PUT `/api/posts/:id` - Update post
- DELETE `/api/posts/:id` - Delete post

### Comments
- POST `/api/posts/:id/comments` - Add comment to post
- DELETE `/api/posts/:id/comments/:commentId` - Delete comment

## License

MIT 