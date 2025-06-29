# Deployment Guide

## Current Deployment Status

### Backend (Server)

- **Status**: ✅ Deployed
- **Platform**: Render
- **URL**: https://blog-backend-4h1f.onrender.com
- **API Endpoint**: https://blog-backend-4h1f.onrender.com/api
- **Database**: MongoDB Atlas (connected)

### Frontend (Client)

- **Status**: 🟡 Ready for deployment
- **Build**: ✅ Production build generated
- **API Configuration**: ✅ Updated to use deployed backend

## Deployment Options for Frontend

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Deploy from client directory**:

   ```bash
   cd client
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard**:
   - `REACT_APP_API_URL=https://blog-backend-4h1f.onrender.com/api`
   - `REACT_APP_FRONTEND_URL=https://your-vercel-url.vercel.app`

### Option 2: Deploy to Netlify

1. **Build the project**:

   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Netlify**:
   - Drag and drop the `build` folder to Netlify
   - Or connect your GitHub repository
   - Set environment variables in Netlify dashboard

### Option 3: Serve with Backend (Static Files)

The backend is already configured to serve the React build files in production:

1. **Copy build files to server**:

   ```bash
   # From client directory
   npm run build
   # Copy build folder contents to server/public
   ```

2. **Access via backend URL**:
   - Frontend will be available at: https://blog-backend-4h1f.onrender.com

## Environment Variables

### Client (.env)

```env
REACT_APP_API_URL=https://blog-backend-4h1f.onrender.com/api
REACT_APP_FRONTEND_URL=https://your-frontend-url.com
```

### Server (.env)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://your-frontend-url.com,https://blog-backend-4h1f.onrender.com
ALLOWED_ORIGINS=https://your-frontend-url.com,https://blog-backend-4h1f.onrender.com
```

## Changes Made for Production

### ✅ Backend Updates

- Added production environment configuration
- Configured CORS for cross-origin requests
- Added middleware to serve static React files
- Set up MongoDB Atlas connection
- Added proper error handling and logging

### ✅ Frontend Updates

- Removed all localhost references from source code
- Updated API configuration to use deployed backend URL
- Modified axios instance to use production endpoints
- Updated SEO component with environment-based URLs
- Removed development proxy configuration
- Updated documentation with correct URLs

### ✅ Security & Configuration

- Added proper .gitignore files
- Created .env.example files for both client and server
- Configured environment variables for production
- Added rate limiting and security headers
- Set up proper CORS policies

## Testing Production Build

### Test Backend API

```bash
# Test API endpoints
curl https://blog-backend-4h1f.onrender.com/api/health
curl https://blog-backend-4h1f.onrender.com/api/posts
```

### Test Frontend Build

```bash
cd client
npm run build
npx serve -s build -p 3000
```

## Next Steps

1. **Deploy Frontend**: Choose one of the deployment options above
2. **Update Environment Variables**: Set the correct frontend URL in both client and server environments
3. **Test Full Application**: Verify that frontend can communicate with backend
4. **Set Up Custom Domain** (Optional): Configure custom domains for both frontend and backend
5. **Set Up CI/CD** (Optional): Configure automatic deployments from GitHub

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure CORS_ORIGIN includes your frontend URL
2. **API Not Found**: Verify REACT_APP_API_URL is set correctly
3. **Build Errors**: Check that all dependencies are installed
4. **Environment Variables**: Ensure all required env vars are set in production

### Debug Commands

```bash
# Check environment variables
echo $REACT_APP_API_URL

# Test API connectivity
curl -I https://blog-backend-4h1f.onrender.com/api/health

# Check build output
ls -la client/build/
```

## Deployment Checklist

- [x] Backend deployed to Render
- [x] MongoDB Atlas connected
- [x] Environment variables configured
- [x] CORS policies set up
- [x] Frontend build ready
- [x] API URLs updated
- [x] Localhost references removed
- [x] Code committed to GitHub
- [ ] Frontend deployed
- [ ] Full application tested
- [ ] Custom domains configured (optional)
- [ ] CI/CD set up (optional)
