# Deployment Fixes Applied

## Issues Fixed

### 1. CORS Error
**Problem**: Frontend at `https://psichoapp.netlify.app` couldn't connect to backend due to CORS policy.

**Solution**: 
- Updated backend `main.py` to automatically include Netlify domain in CORS origins
- Added `expose_headers` to CORS middleware
- Backend now accepts requests from `https://psichoapp.netlify.app`

### 2. API URL Configuration
**Problem**: Frontend was using `localhost:8000` in production instead of the Railway backend URL.

**Solution**:
- Created centralized API configuration file (`frontend/src/config/api.js`)
- Updated all components to use the centralized config
- Added proper production/development fallbacks
- Added warning messages when API URL is not configured

## Configuration Required

### Netlify Environment Variables

Go to Netlify Dashboard → Site Settings → Environment Variables and add:

```
VITE_API_URL=https://your-backend.railway.app
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Replace `https://your-backend.railway.app` with your actual Railway backend URL!

### Railway Environment Variables

Go to Railway Dashboard → Your Project → Variables and ensure:

```
CORS_ORIGINS=https://psichoapp.netlify.app,http://localhost:5173
```

Or the backend will automatically add the Netlify domain if it's not in the list.

## Testing

After deployment:

1. **Check Frontend**: Open `https://psichoapp.netlify.app`
2. **Check Console**: Look for API URL in console (development mode)
3. **Test Login**: Try logging in - should connect to Railway backend
4. **Check Network Tab**: Verify API calls are going to Railway, not localhost

## Troubleshooting

### Still seeing CORS errors?
- Verify `VITE_API_URL` is set in Netlify environment variables
- Check Railway backend is running and accessible
- Verify CORS_ORIGINS includes your Netlify domain in Railway

### API calls going to localhost?
- Check Netlify environment variables are set correctly
- Clear Netlify build cache and redeploy
- Verify `VITE_API_URL` is set (not empty)

### Backend not responding?
- Check Railway backend is deployed and running
- Verify Railway environment variables are set
- Check Railway logs for errors

