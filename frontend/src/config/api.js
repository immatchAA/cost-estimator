// Centralized API configuration
// This uses the VITE_API_URL environment variable if set, otherwise defaults to localhost for development

const getApiUrl = () => {
  // Check if VITE_API_URL is set (for production/deployment)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Default to localhost for local development
  return "http://localhost:8000/api";
};

// API base URL (with /api suffix already included if needed)
export const API_BASE_URL = getApiUrl().endsWith('/api') 
  ? getApiUrl() 
  : `${getApiUrl()}/api`;

// For endpoints that don't use /api prefix (like reading-materials)
export const API_BASE_URL_NO_PREFIX = getApiUrl().replace('/api', '') || "http://localhost:8000";

export default API_BASE_URL;

