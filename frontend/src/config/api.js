/**
 * API Configuration
 * Centralized API URL configuration for the application
 */

// Get API URL from environment variable
// In production, this should be set in Netlify environment variables
// For local development, it defaults to localhost:8000
export const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://your-backend.railway.app'  // Update this with your actual Railway backend URL
    : 'http://localhost:8000')

// Log API URL in development (helps with debugging)
if (import.meta.env.DEV) {
  console.log('API URL:', API_URL)
}

// If in production and no API URL is set, show warning
if (import.meta.env.MODE === 'production' && !import.meta.env.VITE_API_URL) {
  console.warn('⚠️ VITE_API_URL is not set! API calls will fail. Please set it in Netlify environment variables.')
}

