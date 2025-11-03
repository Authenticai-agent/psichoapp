# Railway Deployment Setup Guide

## Quick Fix for Railway Deployment

### Option 1: Set Root Directory in Railway Dashboard (Recommended)

1. Go to your Railway project dashboard
2. Click on your service
3. Go to **Settings** tab
4. Under **Root Directory**, set it to: `backend`
5. Save the changes
6. Redeploy

### Option 2: Use Railway CLI

If you're using Railway CLI, you can set the root directory:

```bash
railway service --set-root-directory backend
```

## Configuration Files

### Root `railway.json` (for monorepo)
- Located at project root
- Handles building from `backend/` directory
- Uses `cd backend &&` commands

### Backend `railway.json` (for direct deployment)
- Located in `backend/` directory
- Use if you deploy backend folder directly
- Railway will auto-detect this if root directory is set to `backend`

### Procfile
- Located in `backend/` directory
- Fallback if railway.json doesn't work
- Command: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`

## Common Deployment Issues

### Issue 1: "Module not found" or "No module named 'app'"
**Cause**: Railway is running from wrong directory
**Solution**: Set root directory to `backend` in Railway settings

### Issue 2: "Port already in use"
**Cause**: Wrong PORT variable
**Solution**: Railway auto-sets `$PORT`, make sure start command uses it

### Issue 3: "pip install failed"
**Cause**: Missing Python version or build dependencies
**Solution**: 
- Check `runtime.txt` specifies Python version
- Verify `requirements.txt` is valid
- Check build logs for specific errors

### Issue 4: "Environment variables not found"
**Cause**: Variables not set in Railway dashboard
**Solution**: 
1. Go to Railway project → Variables tab
2. Add all required environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `GEMINI_API_KEY`
   - `JWT_SECRET`
   - `CORS_ORIGINS` (include your Netlify domain)

## Required Environment Variables in Railway

Add these in Railway Dashboard → Variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_key
JWT_SECRET=your_random_secret_min_32_chars
ENVIRONMENT=production
CORS_ORIGINS=https://psichoapp.netlify.app,http://localhost:5173
```

## Verification Steps

1. **Check Build Logs**:
   - Railway Dashboard → Your Service → Deployments
   - Click on latest deployment
   - Check "Build Logs" for errors

2. **Check Runtime Logs**:
   - Railway Dashboard → Your Service → Metrics
   - Check "Logs" tab for runtime errors

3. **Test Health Endpoint**:
   - Railway provides a public URL
   - Test: `https://your-service.railway.app/health`
   - Should return: `{"status": "healthy", "service": "backend"}`

4. **Test API Documentation**:
   - Visit: `https://your-service.railway.app/docs`
   - Should show FastAPI Swagger UI

## Troubleshooting

### Build Fails Immediately
- Check Railway detected Python project
- Verify `requirements.txt` exists in backend directory
- Check Python version in `runtime.txt`

### Service Crashes on Start
- Check environment variables are all set
- Verify database connection (Supabase)
- Check logs for specific error messages
- Ensure `main.py` is in the correct location

### CORS Still Not Working
- Verify `CORS_ORIGINS` includes your frontend URL
- Check backend logs for CORS errors
- Ensure frontend is using correct API URL

## Next Steps After Deployment

1. **Get Railway URL**:
   - Railway Dashboard → Your Service → Settings
   - Copy the "Public Domain" URL

2. **Update Frontend**:
   - Go to Netlify Dashboard
   - Add environment variable: `VITE_API_URL=https://your-service.railway.app`
   - Redeploy frontend

3. **Test End-to-End**:
   - Open your Netlify site
   - Try logging in
   - Verify API calls are working

## Alternative: Deploy Backend Folder Directly

If Railway configuration is still problematic:

1. Create a separate Railway project
2. Deploy only the `backend/` folder
3. Set root directory to `/` (since you're deploying from backend folder)
4. Railway will auto-detect Python and use `requirements.txt`

