# 🚨 URGENT: Fix Netlify Environment Variable

## Current Problem

Your frontend is trying to connect to `http://localhost:8000` instead of your Railway backend. 

**The issue**: `VITE_API_URL` is set in Netlify, but it's set to the wrong value (localhost).

## Quick Fix (2 minutes)

### Step 1: Get Your Railway Backend URL

1. Go to [Railway Dashboard](https://railway.app)
2. Click on your backend service (`psichoapp`)
3. Look for the **Public Domain** or **Generated Domain**
4. Copy the URL (should look like: `https://psichoapp-production.up.railway.app`)

### Step 2: Update Netlify Environment Variable

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site: `psichoapp`
3. Go to **Site settings** → **Environment variables**
4. Find `VITE_API_URL` in the list
5. Click **Edit** or **Update**
6. **Change the value from** `http://localhost:8000` 
7. **To** your Railway URL (e.g., `https://psichoapp-production.up.railway.app`)
8. Click **Save**

### Step 3: Redeploy

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Wait for deployment to complete (2-3 minutes)

### Step 4: Verify

1. Open your site: `https://psichoapp.netlify.app`
2. Open browser console (F12)
3. Look for:
   ```
   🔗 API URL: https://psichoapp-production.up.railway.app
   ```
   **NOT** `http://localhost:8000`

4. Try signing up - it should work now!

## Visual Guide

### Finding Railway URL:
```
Railway Dashboard
  └── Your Service (psichoapp)
      └── Settings tab
          └── Public Domain
              └── https://psichoapp-production.up.railway.app  ← Copy this!
```

### Updating Netlify:
```
Netlify Dashboard
  └── Your Site (psichoapp)
      └── Site settings
          └── Environment variables
              └── VITE_API_URL
                  └── Edit
                      └── Change to: https://your-railway-url.railway.app
```

## Still Not Working?

1. **Check Railway backend is running**:
   - Visit: `https://your-railway-url.railway.app/health`
   - Should return: `{"status": "healthy", "service": "backend"}`

2. **Check CORS settings**:
   - Railway should have `CORS_ORIGINS` set to include `https://psichoapp.netlify.app`
   - Or backend will auto-add it in production

3. **Clear browser cache**:
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

## Common Mistakes

❌ **Wrong**: `VITE_API_URL=http://localhost:8000`  
✅ **Correct**: `VITE_API_URL=https://psichoapp-production.up.railway.app`

❌ **Wrong**: `VITE_API_URL=https://railway.app` (Railway dashboard URL)  
✅ **Correct**: `VITE_API_URL=https://your-service.railway.app` (Your service URL)

## Need Help?

If you can't find your Railway URL:
1. Check Railway service logs
2. Look for "Public Domain" in Railway settings
3. Railway generates a URL automatically - it should be visible in the dashboard

