# Netlify Environment Variables Setup - URGENT

## ⚠️ Current Issue

Your frontend is trying to connect to `localhost:8000` instead of your Railway backend. This is because the `VITE_API_URL` environment variable is not set in Netlify.

## Quick Fix (5 minutes)

### Step 1: Get Your Railway Backend URL

1. Go to [Railway Dashboard](https://railway.app)
2. Click on your backend service
3. Go to **Settings** tab
4. Find **Public Domain** or **Generated Domain**
5. Copy the URL (e.g., `https://psichoapp-production.up.railway.app`)

### Step 2: Set Environment Variables in Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site (`psichoapp`)
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add these variables:

#### Required Variables:

```
VITE_API_URL=https://your-backend.railway.app
```
**Replace `https://your-backend.railway.app` with your actual Railway URL!**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
```

```
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 3: Redeploy

After adding variables:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Wait for deployment to complete

## Verification

After redeploy:

1. **Open your site**: `https://psichoapp.netlify.app`
2. **Open browser console** (F12)
3. **Look for these logs**:
   ```
   🔗 API URL: https://your-backend.railway.app
   🌍 Environment: production
   📦 VITE_API_URL set: true
   ```
4. **If you see**:
   ```
   ❌ CRITICAL: VITE_API_URL environment variable is not set!
   ```
   Then the variable is still not set correctly.

## Common Issues

### Issue 1: "API URL: MISSING_API_URL"
**Solution**: The `VITE_API_URL` variable is not set or is empty in Netlify.

### Issue 2: "CORS policy error"
**Solution**: 
1. Make sure your Railway backend has `CORS_ORIGINS` set:
   ```
   CORS_ORIGINS=https://psichoapp.netlify.app,http://localhost:5173
   ```
2. Check Railway backend is running and accessible

### Issue 3: "Still using localhost:8000"
**Solution**:
1. Clear Netlify build cache
2. Redeploy
3. Verify environment variable is set correctly (check spelling: `VITE_API_URL`)

## Step-by-Step with Screenshots Guide

### Finding Your Railway URL:

```
Railway Dashboard
  └── Your Project
      └── Your Service (psichoapp)
          └── Settings
              └── Public Domain: https://psichoapp-production.up.railway.app
```

### Setting Netlify Variables:

```
Netlify Dashboard
  └── Your Site (psichoapp)
      └── Site settings
          └── Environment variables
              └── Add variable
                  └── Key: VITE_API_URL
                  └── Value: https://your-railway-url.railway.app
```

## Testing

After setting variables and redeploying:

1. **Check Console**:
   - Should show: `API URL: https://your-backend.railway.app`
   - Should NOT show: `API URL: http://localhost:8000`

2. **Try Login**:
   - Should connect to Railway backend
   - Should NOT show CORS errors

3. **Check Network Tab**:
   - API calls should go to Railway URL
   - Status should be 200 (not CORS errors)

## Need Help?

If still having issues:
1. Check Railway backend is running (visit `/health` endpoint)
2. Verify Railway CORS settings include Netlify domain
3. Check Netlify build logs for errors
4. Verify variable name is exactly `VITE_API_URL` (case-sensitive)

