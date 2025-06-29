# Modern Blog Platform

A full-stack blog platform built with Node.js, Express, MongoDB, and React.

## Project Overview

This is a production-ready blog platform featuring a robust backend API and a modern React frontend. The application supports user authentication, content management, and a clean, responsive user interface.

## Architecture

```
blog/
├── server/                 # Backend (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── config/        # Database and app configuration
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Utility functions
│   │   └── validations/   # Input validation schemas
│   ├── app.js            # Express app configuration
│   ├── server.js         # Server entry point
│   └── test-api.js       # API testing script
├── client/                # Frontend (React + Tailwind CSS)
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layers
│   │   └── utils/        # Utility functions
│   └── public/           # Static assets
└── docs/                 # Documentation
```

## Technology Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-rate-limit** - Rate limiting
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing

### Frontend

- **React 18** - UI framework
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animations
- **React Quill** - Rich text editor
- **Axios** - HTTP client
- **React Helmet Async** - SEO management

## Features

### Core Features

- ✅ User authentication and authorization
- ✅ Role-based access control (Admin/Editor)
- ✅ CRUD operations for blog posts
- ✅ Rich text content editing
- ✅ Post status management (draft/published)
- ✅ Tag system for categorization
- ✅ Search and filtering
- ✅ Responsive design
- ✅ SEO optimization

### Security Features

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Input validation and sanitization
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Security headers with Helmet
- ✅ XSS protection

### Performance Features

- ✅ Database indexing
- ✅ Pagination support
- ✅ Efficient queries
- ✅ Code splitting (frontend)
- ✅ Optimized assets
- ✅ Caching headers

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd blog
   ```

2. **Set up the backend:**

   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Set up the frontend:**

   ```bash
   cd ../client
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm start
   ```

4. **Test the API (optional):**
   ```bash
   cd ../server
   node test-api.js
   ```

### Environment Variables

#### Backend (.env)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blog
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FRONTEND_URL=http://localhost:3000
```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - User logout

### Posts Endpoints

- `GET /api/posts` - Get published posts (public)
- `GET /api/posts/:slug` - Get post by slug (public)
- `POST /api/posts` - Create post (auth required)
- `PUT /api/posts/:id` - Update post (auth required)
- `DELETE /api/posts/:id` - Delete post (auth required)
- `PUT /api/posts/:id/publish` - Publish post (auth required)
- `PUT /api/posts/:id/unpublish` - Unpublish post (auth required)

## Testing

### Backend Testing

```bash
cd server
node test-api.js
```

This runs comprehensive API tests covering all major endpoints.

### Frontend Testing

```bash
cd client
npm test
```

## Deployment

### Backend Deployment

1. Set production environment variables
2. Deploy to platforms like:
   - Heroku
   - AWS EC2/ECS
   - DigitalOcean
   - Railway

### Frontend Deployment

1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy to platforms like:
   - Netlify
   - Vercel
   - Firebase Hosting
   - AWS S3 + CloudFront

### Database Setup

- MongoDB Atlas (recommended)
- Self-hosted MongoDB
- Docker containers

---

## 🚀 Deployment Instructions

### 1. Environment Variables

- Copy `.env.example` to `.env` in both `client` and `server` folders and fill in your production values.

### 2. Build the Frontend

```bash
cd client
npm install
npm run build
```

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

### 4. Start the Server (serves API and frontend build)

```bash
NODE_ENV=production node server.js
```

- The backend will serve the React build from `client/build` in production mode.
- Make sure your MongoDB and secrets are set in the server `.env` file.

### 5. (Optional) Deploy to Cloud

- Use services like **Render**, **Heroku**, **Vercel (frontend only)**, or **Docker** for deployment.
- For Docker, create a `Dockerfile` in the root or server directory.

### 6. (Optional) Serve with Nginx/Apache

- You can serve the `client/build` folder as static files and proxy API requests to the backend.

---

**Your app is now production ready!**

## Project Status

✅ **Backend**: Production-ready with comprehensive testing
✅ **Frontend**: Modern React application with admin panel
✅ **Authentication**: Secure JWT-based auth system
✅ **Content Management**: Full CRUD with rich text editing
✅ **Documentation**: Complete setup and deployment guides

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions and support:

- Check the documentation in each directory
- Review the API test file for usage examples
- Check the production summary for deployment details

## Roadmap

Future enhancements:

- [ ] Image upload functionality
- [ ] Comment system
- [ ] Social media integration
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Theme customization
- [ ] Multi-language support
