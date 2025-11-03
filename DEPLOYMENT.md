# Deployment Guide

## Backend Deployment (Railway)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Select the `backend` directory

3. **Set Environment Variables**
   In Railway dashboard, go to Variables tab and add:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_random_secret_key
   ENVIRONMENT=production
   CORS_ORIGINS=https://your-frontend-url.netlify.app
   ```

4. **Deploy**
   - Railway will automatically detect the Python project
   - It will install dependencies and start the server
   - Note the generated URL (e.g., `https://your-app.railway.app`)

## Frontend Deployment (Netlify)

1. **Create Netlify Account**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub

2. **Deploy Site**
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub repository
   - Configure build settings:
     - Base directory: `frontend`
     - Build command: `npm run build`
     - Publish directory: `frontend/dist`

3. **Set Environment Variables**
   In Netlify dashboard, go to Site settings > Environment variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=https://your-backend-url.railway.app
   ```

4. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your frontend

## Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys

2. **Run Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the contents of `supabase/schema.sql`
   - Execute the SQL

3. **Configure Authentication**
   - Go to Authentication > Settings
   - Configure email/password authentication
   - Enable email confirmation (optional for MVP)

4. **Set Up Storage** (if needed for audio files)
   - Go to Storage
   - Create a bucket named "audio-uploads"
   - Set policies for authenticated users

## Gemini API Setup

1. **Get API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your backend environment variables

## Post-Deployment Checklist

- [ ] Backend is accessible and health endpoint returns 200
- [ ] Frontend loads and can connect to backend
- [ ] Database schema is created successfully
- [ ] Authentication works (signup/login)
- [ ] Journal entries can be created
- [ ] AI mood analysis is working
- [ ] Therapist dashboard loads client data
- [ ] CORS is properly configured
- [ ] Environment variables are set correctly
- [ ] HTTPS is enabled on both frontend and backend

## Monitoring

- **Backend**: Check Railway logs for errors
- **Frontend**: Check Netlify build logs
- **Database**: Monitor Supabase dashboard for query performance
- **API**: Use Railway metrics to monitor API usage

## Troubleshooting

### Backend Issues
- Check Railway logs: `railway logs`
- Verify environment variables are set
- Ensure database connection is working

### Frontend Issues
- Check Netlify build logs
- Verify API URL is correct in environment variables
- Check browser console for CORS errors

### Database Issues
- Verify schema is applied correctly
- Check RLS policies are enabled
- Ensure user has proper permissions

