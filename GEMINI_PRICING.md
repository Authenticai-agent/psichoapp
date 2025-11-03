# Gemini Model Pricing & Configuration

## Current Configuration

Your app is configured to use **`gemini-1.5-flash`**, which is the cheapest practical option.

## Pricing Comparison

### Cheapest Options (from cheapest to more expensive):

1. **Gemini 1.5 Flash** (Currently Used) ✅
   - **Free tier available** (with usage limits)
   - Paid: $0.075 per 1M input tokens, $0.30 per 1M output tokens
   - **Best choice for cost savings with free tier**

2. **Gemini 2.0 Flash-Lite** (Cheapest paid option)
   - $0.019 per 1M input tokens
   - $0.076 per 1M output tokens
   - Note: May not be available in all regions/API versions

3. **Gemini 2.0 Flash**
   - $0.10 per 1M input tokens
   - $0.40 per 1M output tokens

4. **Gemini 1.5 Pro**
   - $1.25 per 1M input tokens
   - $5.00 per 1M output tokens
   - More expensive, better quality

## Current Setup

Your app uses `gemini-1.5-flash` which:
- ✅ Has a **free tier** (up to certain limits)
- ✅ Is the cheapest practical option
- ✅ Works with the current API version
- ✅ Good quality for mood analysis and affirmations

## Configuration

The model is configured in `backend/app/config.py`:

```python
gemini_model: str = "gemini-1.5-flash"  # Cheapest model with free tier
```

You can change this by setting the `GEMINI_MODEL` environment variable in Railway:

```
GEMINI_MODEL=gemini-2.0-flash-lite  # If you want to try the absolute cheapest paid option
```

## Free Tier Limits

Google's free tier for Gemini 1.5 Flash typically includes:
- 15 requests per minute (RPM)
- 1,500 requests per day (RPD)
- Check Google AI Studio for current limits

## Cost Optimization Tips

1. **Use the free tier**: `gemini-1.5-flash` has a free tier - use it first!
2. **Cache responses**: Affirmations and activities can be cached per mood level
3. **Batch requests**: If possible, batch multiple analyses
4. **Monitor usage**: Check Google Cloud Console for usage stats

## Switching Models

To switch to a different model, add to Railway environment variables:

```
GEMINI_MODEL=gemini-2.0-flash-lite
```

Then redeploy. **Note**: Not all models may be available in your API version.

## Recommendation

**Stick with `gemini-1.5-flash`** because:
- Free tier available
- Already working
- Good quality for your use case
- No need to change unless you hit free tier limits

