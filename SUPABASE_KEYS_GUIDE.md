# Supabase Keys Guide - How to Identify Which Key is Which

## ⚠️ Important: Anon Key vs Service Role Key

The **anon key** and **service_role key** are **different** and should **never** be the same. If they appear the same, you might be looking at the wrong key.

## How to Identify Each Key

### 1. Anon Public Key (for Frontend)
- **Label**: "anon public" or "anon" or "public"
- **Location**: Usually visible by default in the API Keys section
- **Starts with**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Safe to use**: ✅ In frontend code (public)
- **Permissions**: Respects Row Level Security (RLS) policies

### 2. Service Role Key (for Backend Only)
- **Label**: "service_role" or "service_role secret"
- **Location**: Usually hidden, you need to click "Reveal"
- **Starts with**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (same format, but different value)
- **Safe to use**: ❌ Only in backend, NEVER in frontend
- **Permissions**: Bypasses Row Level Security (RLS) - has admin access

## Visual Guide

In your Supabase dashboard (Settings → API), you should see:

```
API Keys Section:
├── anon public
│   └── Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.xxxxx
│   └── Use: Frontend (VITE_SUPABASE_ANON_KEY)
│
└── service_role
    └── Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZiIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE2MTYyMzkwMjIsImV4cCI6MTkzMTgxNTAyMn0.xxxxx
    └── Use: Backend only (SUPABASE_SERVICE_KEY)
```

## How to Decode and Verify

Both keys are JWT tokens. You can decode them to see the difference:

### Check the "role" field in the JWT payload:

**Anon Key payload** contains:
```json
{
  "role": "anon"
}
```

**Service Role Key payload** contains:
```json
{
  "role": "service_role"
}
```

### Quick Test - Decode Online:

1. Go to https://jwt.io
2. Paste your key
3. Look at the "role" field in the decoded payload
4. If it says `"role": "anon"` → This is the anon key
5. If it says `"role": "service_role"` → This is the service_role key

## Common Issues

### Issue 1: "They look the same"
- **Cause**: You might have copied the anon key twice
- **Solution**: Scroll down to find the service_role section, it's usually below the anon key

### Issue 2: "I can only see one key"
- **Cause**: Service role key might be hidden
- **Solution**: Look for a "Reveal" button or toggle next to the service_role key

### Issue 3: "Both keys start with the same characters"
- **Cause**: This is normal! JWT tokens often start similarly
- **Solution**: Check the middle part of the token (the payload) - they should be different

## What Each Key is Used For

### Anon Public Key (`SUPABASE_KEY` / `VITE_SUPABASE_ANON_KEY`)
```env
# Frontend .env
VITE_SUPABASE_ANON_KEY=eyJ... (anon key)

# Backend .env (for client operations)
SUPABASE_KEY=eyJ... (anon key)
```

**Used for:**
- Client-side operations
- Frontend authentication
- Public API calls
- Respects RLS policies

### Service Role Key (`SUPABASE_SERVICE_KEY`)
```env
# Backend .env ONLY
SUPABASE_SERVICE_KEY=eyJ... (service_role key)
```

**Used for:**
- Server-side admin operations
- Bypassing RLS policies
- Creating users programmatically
- Admin database operations

## Security Checklist

- ✅ Anon key can be used in frontend
- ✅ Service role key ONLY in backend
- ✅ Service role key should be different from anon key
- ✅ Never commit service role key to git
- ✅ Never expose service role key in client code

## Still Having Issues?

If you're still seeing the same key:

1. **Check the Supabase dashboard again:**
   - Go to Settings → API
   - Scroll down completely
   - Look for "service_role" section (it might be collapsed)

2. **Check if you're in the right project:**
   - Make sure you're looking at the correct Supabase project

3. **Try these steps:**
   ```bash
   # In your backend, test which key you're using:
   # The service_role key should allow you to bypass RLS
   # The anon key should respect RLS policies
   ```

4. **Contact Supabase support** if keys are truly identical (this is unusual)

## Quick Verification Script

You can use this Python script to verify which key you have:

```python
import jwt

def check_key(key):
    try:
        decoded = jwt.decode(key, options={"verify_signature": False})
        role = decoded.get('role')
        return role
    except:
        return "Invalid"

anon_key = "your_anon_key_here"
service_key = "your_service_key_here"

print(f"Anon key role: {check_key(anon_key)}")
print(f"Service key role: {check_key(service_key)}")
```

Run this and check:
- Anon key should return: `anon`
- Service key should return: `service_role`

