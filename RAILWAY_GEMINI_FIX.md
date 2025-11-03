# Fix Gemini Model 404 Error in Railway

## Problem
Error: `404 models/gemini-pro is not found for API version v1beta`

This happens when the code tries to use `gemini-pro` which is deprecated.

## Solution

### Option 1: Check Railway Environment Variables (Recommended)

1. Go to [Railway Dashboard](https://railway.app)
2. Select your backend service
3. Go to **Variables** tab
4. Look for `GEMINI_MODEL` variable
5. If it exists and is set to `gemini-pro`, either:
   - **Delete it** (will use default: `gemini-1.5-flash`)
   - **Change it to**: `gemini-1.5-flash`

### Option 2: Code Already Has Fallback

The code now automatically converts `gemini-pro` to `gemini-1.5-flash`, but you should still fix the environment variable.

### Option 3: Verify Deployment

Make sure Railway has deployed the latest code:
1. Go to Railway Dashboard → Your Service
2. Check **Deployments** tab
3. Make sure the latest commit is deployed
4. If not, click **Redeploy**

## Current Model Configuration

- **Default**: `gemini-1.5-flash` (cheapest with free tier)
- **Environment Variable**: `GEMINI_MODEL` (optional)
- **Fallback**: Automatically converts `gemini-pro` → `gemini-1.5-flash`

## Verify Fix

After updating:
1. Check Railway logs for the error
2. Should see: `"gemini-pro is deprecated, using gemini-1.5-flash instead"` (if it was set)
3. Error should be gone

## Available Models

- `gemini-1.5-flash` ✅ (Recommended - free tier available)
- `gemini-1.5-pro` (more expensive)
- `gemini-2.0-flash` (if available)
- `gemini-2.0-flash-lite` (cheapest paid option)

