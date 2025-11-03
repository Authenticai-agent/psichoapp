# Netlify Deployment Setup Guide

## Quick Fix for "Failed to parse configuration" Error

The main `netlify.toml` file is now in the **root directory** and properly configured to build from the `frontend/` subdirectory.

## Configuration

The root `netlify.toml` includes:
- `base = "frontend"` - Tells Netlify where the frontend code is
- `command = "npm install && npm run build"` - Build command
- `publish = "frontend/dist"` - Output directory

## Netlify Dashboard Settings

If you're setting up in Netlify dashboard, configure:

1. **Base directory**: `frontend`
2. **Build command**: `npm install && npm run build`
3. **Publish directory**: `frontend/dist`

OR

Just use the `netlify.toml` file (it will auto-detect these settings).

## Environment Variables in Netlify

Add these in Netlify Dashboard → Site Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=https://your-backend.railway.app
```

## Redeploy

After pushing the updated `netlify.toml`:

1. Go to Netlify dashboard
2. Click "Trigger deploy" → "Clear cache and deploy site"
3. Or wait for automatic redeploy after git push

## Troubleshooting

### Still getting "Failed to parse configuration"?
- Make sure `netlify.toml` is in the **root** of your repository
- Check that the file has valid TOML syntax
- Verify the base directory path is correct

### Build fails?
- Check that Node.js version is set (NODE_VERSION = "18" in netlify.toml)
- Verify all environment variables are set
- Check build logs for specific error messages

### Build succeeds but site doesn't load?
- Verify publish directory is correct (`frontend/dist`)
- Check that `index.html` exists in the dist folder
- Verify redirect rules are working

