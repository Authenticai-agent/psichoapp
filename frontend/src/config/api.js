/**
 * API Configuration
 * Centralized API URL configuration for the application
 */

// Get API URL from environment variable
// In production, this should be set in Netlify environment variables
// For local development, it defaults to localhost:8000
const getApiUrl = () => {
  // First check if explicitly set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // In production, show error if not set
  if (import.meta.env.MODE === 'production') {
    console.error('❌ CRITICAL: VITE_API_URL environment variable is not set!')
    console.error('Please set VITE_API_URL in Netlify Dashboard → Site Settings → Environment Variables')
    console.error('Example: https://your-backend.railway.app')
    // Return a placeholder that will show clear error
    return 'MISSING_API_URL'
  }
  
  // Development fallback
  return 'http://localhost:8000'
}

export const API_URL = getApiUrl()

// Log API URL (helps with debugging)
console.log('🔗 API URL:', API_URL)
console.log('🌍 Environment:', import.meta.env.MODE)
console.log('📦 VITE_API_URL set:', !!import.meta.env.VITE_API_URL)
console.log('📦 VITE_API_URL value:', import.meta.env.VITE_API_URL || 'NOT SET')

// Check if using localhost in production (common mistake)
if (import.meta.env.MODE === 'production' && API_URL.includes('localhost')) {
  console.error('❌ ERROR: VITE_API_URL is set to localhost in production!')
  console.error('This will not work. Please set VITE_API_URL to your Railway backend URL in Netlify.')
  console.error('Example: https://your-backend.railway.app')
}

// Show error if API URL is missing in production
if (API_URL === 'MISSING_API_URL') {
  console.error('🚨 API calls will fail! Set VITE_API_URL in Netlify environment variables.')
}

