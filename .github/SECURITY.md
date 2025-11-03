# Security Policy

## 🔒 Environment Variables Security

**IMPORTANT**: Never commit `.env` files to this repository!

### Protected Files
- `.env` files are automatically excluded via `.gitignore`
- `.env.local` files are excluded
- Any file matching `*.env` pattern is excluded

### Safe Files (Included in Repository)
- `.env.sample` files are included (template files with no secrets)
- These serve as examples for setup

### What to Do
1. **Always** copy `.env.sample` to `.env` locally
2. **Never** commit your actual `.env` files
3. **Use** environment variables in your deployment platform (Railway, Netlify)
4. **Rotate** keys immediately if accidentally exposed

### If You Accidentally Committed Secrets

1. **Immediately** rotate all exposed keys:
   - Supabase: Regenerate service_role key
   - Gemini API: Regenerate API key
   - JWT Secret: Generate new secret

2. **Remove from Git history**:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push** (coordinate with team first):
   ```bash
   git push origin --force --all
   ```

## Reporting Security Issues

If you discover a security vulnerability, please report it privately to the project maintainers.

## Security Best Practices

- ✅ Use different keys for development and production
- ✅ Rotate secrets regularly
- ✅ Use strong, random JWT secrets (minimum 32 characters)
- ✅ Never expose service_role keys in frontend code
- ✅ Limit CORS origins to trusted domains
- ✅ Enable Row Level Security (RLS) in Supabase
- ✅ Use HTTPS in production
- ✅ Keep dependencies updated

