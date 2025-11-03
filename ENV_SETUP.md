# Environment Variables Setup Guide

This guide explains how to set up environment variables for the AuthenticAI Wellness Journal application.

## Quick Start

1. **Backend**: Copy `backend/.env.sample` to `backend/.env` and fill in values
2. **Frontend**: Copy `frontend/.env.sample` to `frontend/.env` and fill in values

## Detailed Instructions

### Backend Environment Variables (`backend/.env`)

#### 1. Supabase Configuration

**Where to get these values:**
1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project (or create a new one)
3. Go to **Settings** > **API** (Settings icon ⚙️ in left sidebar, then "API" under Project Settings)
4. In the "API Keys" section, you'll see:
   - **Project URL**: Copy this for `SUPABASE_URL`
   - **anon public**: Copy this for `SUPABASE_KEY` (safe for frontend)
   - **service_role**: Click "Reveal" to see it, then copy for `SUPABASE_SERVICE_KEY`
5. Copy the values:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (anon/public key - visible by default)
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (service_role key - click "Reveal" to see)
```

⚠️ **Important**: 
- `SUPABASE_KEY` is the **anon/public** key (safe to use in frontend)
- `SUPABASE_SERVICE_KEY` is the **service_role** key (backend only, never expose!)
- The service_role key is hidden by default - you need to click "Reveal" to see it
- This key bypasses Row Level Security, so keep it secret!

#### 2. Gemini API Key

**Where to get:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Or [Google Cloud Console](https://console.cloud.google.com/)
3. Create a new API key
4. Copy it:

```
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

#### 3. JWT Secret

**Generate a secure random string:**

**Option 1: Using OpenSSL** (Mac/Linux)
```bash
openssl rand -hex 32
```

**Option 2: Using Python**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**Option 3: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Then set:**
```
JWT_SECRET=your_generated_secret_key_here
```

Minimum 32 characters recommended for security.

#### 4. CORS Origins

For local development:
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

For production, add your frontend URLs:
```
CORS_ORIGINS=https://your-app.netlify.app,https://www.your-domain.com
```

### Frontend Environment Variables (`frontend/.env`)

#### 1. Supabase Configuration

Same values as backend (get from Supabase dashboard):
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. Backend API URL

**For local development:**
```
VITE_API_URL=http://localhost:8000
```

**For production:**
```
VITE_API_URL=https://your-backend.railway.app
```

## Example Files

### Backend `.env` Example (Local Development)

```env
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.example
GEMINI_API_KEY=AIzaSyDxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4xxx.example
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=12
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend `.env` Example (Local Development)

```env
VITE_SUPABASE_URL=xxxxx
VITE_SUPABASE_ANON_KEY=xxxxxx
VITE_API_URL=http://localhost:8000
```

## Production Environment Variables

### Railway (Backend)

When deploying to Railway, set these in the Railway dashboard:

1. Go to your project > **Variables** tab
2. Add each variable:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=your_jwt_secret
ENVIRONMENT=production
CORS_ORIGINS=https://your-frontend.netlify.app
```

### Netlify (Frontend)

When deploying to Netlify, set these in Netlify dashboard:

1. Go to your site > **Site settings** > **Environment variables**
2. Add each variable:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=https://your-backend.railway.app
```

## Security Best Practices

1. ✅ **Never commit `.env` files to git** (they're in `.gitignore`)
2. ✅ **Use different keys for development and production**
3. ✅ **Rotate secrets regularly** (especially JWT_SECRET)
4. ✅ **Use strong, random JWT secrets** (minimum 32 characters)
5. ✅ **Never expose SUPABASE_SERVICE_KEY** in frontend code
6. ✅ **Limit CORS origins** to only your domains
7. ✅ **Use environment-specific values** (dev/staging/prod)

## Troubleshooting

### Backend won't start
- Check all required variables are set
- Verify Supabase URL format is correct
- Ensure JWT_SECRET is at least 32 characters

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

### Authentication errors
- Verify Supabase keys are correct
- Check JWT_SECRET matches between environments
- Ensure Supabase project is active

### AI features not working
- Verify GEMINI_API_KEY is set and valid
- Check API quota/limits in Google Cloud Console
- Review backend logs for errors

## Verification

After setting up, verify your configuration:

1. **Backend health check:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status": "healthy", "service": "backend"}`

2. **Frontend connection:**
   - Open browser console
   - Check for connection errors
   - Verify API calls are working

3. **Supabase connection:**
   - Check Supabase dashboard > Logs
   - Verify connections are being made

## Need Help?

- Check the main `SETUP.md` for detailed setup instructions
- Review `DEPLOYMENT.md` for production deployment
- Check Supabase documentation: https://supabase.com/docs
- Check Google Gemini docs: https://ai.google.dev/docs

