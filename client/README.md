# Blog Frontend

A modern, minimal React frontend for the blog application.

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router 6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **React Quill** - Rich text editor
- **Axios** - HTTP client
- **React Helmet Async** - SEO meta tags
- **React Hot Toast** - Beautiful notifications

## Features

### Public Pages

- **Home** - Blog posts grid with search and filtering
- **Blog Post** - Individual post view with rich content
- **404** - Not found page

### Admin Panel

- **Dashboard** - Admin overview and statistics
- **Posts Management** - Create, edit, delete, publish/unpublish posts
- **Rich Text Editor** - WYSIWYG editor for post content
- **Profile Management** - Update profile and change password
- **Authentication** - Secure login system

## Project Structure

```
src/
├── components/
│   ├── admin/           # Admin-specific components
│   │   ├── AdminLayout.js
│   │   └── PostEditor.js
│   └── common/          # Shared components
│       ├── ErrorBoundary.js
│       ├── Header.js
│       ├── Footer.js
│       ├── LoadingSpinner.js
│       ├── PostCard.js
│       ├── ProtectedRoute.js
│       └── SEOHead.js
├── context/
│   └── AuthContext.js   # Authentication context
├── hooks/
│   ├── useLocalStorage.js
│   └── usePosts.js      # Posts data management
├── pages/
│   ├── admin/           # Admin pages
│   │   ├── CreatePost.js
│   │   ├── Dashboard.js
│   │   ├── EditPost.js
│   │   ├── Login.js
│   │   ├── PostList.js
│   │   └── Profile.js
│   └── public/          # Public pages
│       ├── BlogPost.js
│       ├── Home.js
│       └── NotFound.js
├── services/
│   ├── api.js           # Axios configuration
│   ├── authService.js   # Authentication API calls
│   └── postService.js   # Posts API calls
├── utils/
│   ├── constants.js     # App constants
│   └── helpers.js       # Utility functions
├── App.js               # Main app component
├── index.js             # App entry point
└── index.css            # Global styles
```

## Development

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the client directory:

   ```
   REACT_APP_API_URL=https://blog-backend-4h1f.onrender.com/api
   REACT_APP_FRONTEND_URL=http://localhost:3000
   ```

3. **Start development server:**

   ```bash
   npm start
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Key Features

### Authentication

- Secure login/logout with JWT tokens
- Role-based access control (admin/editor)
- Protected routes for admin panel
- Automatic token refresh

### Content Management

- Rich text editor with formatting options
- Draft and published post states
- Tag system for categorization
- SEO-friendly URLs and meta tags

### User Experience

- Responsive design for all devices
- Smooth animations and transitions
- Loading states and error handling
- Toast notifications for user feedback
- Search and filter functionality

### Performance

- Code splitting and lazy loading
- Optimized images and assets
- Efficient state management
- Minimal bundle size

## Deployment

The frontend is ready for deployment to platforms like:

- Netlify
- Vercel
- Firebase Hosting
- AWS S3 + CloudFront

Make sure to update the environment variables for production.

## Contributing

1. Follow the existing code structure
2. Use TypeScript for new components (optional)
3. Write tests for critical functionality
4. Follow the established styling patterns
5. Ensure responsive design

## API Integration

The frontend communicates with the backend through RESTful APIs:

- `GET /api/posts` - Fetch published posts
- `POST /api/auth/login` - User authentication
- `POST /api/posts` - Create new post (admin)
- `PUT /api/posts/:id` - Update post (admin)
- `DELETE /api/posts/:id` - Delete post (admin)

All admin operations require authentication tokens.
