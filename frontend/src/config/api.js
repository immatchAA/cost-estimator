// Centralized API configuration
// This uses the VITE_API_URL environment variable if set, otherwise defaults to localhost for development

const getApiUrl = () => {
  // Check if VITE_API_URL is set (for production/deployment)
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl) {
    // If it already ends with /api, return as is, otherwise add /api
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
  }
  
  // Default to localhost for local development
  return "http://localhost:8000/api";
};

// API base URL (with /api suffix already included)
export const API_BASE_URL = getApiUrl();

// For endpoints that don't use /api prefix (like reading-materials, auth, verification)
export const API_BASE_URL_NO_PREFIX = (() => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // Remove /api if present
    return envUrl.replace('/api', '').replace(/\/$/, '');
  }
  return "http://localhost:8000";
})();

export default API_BASE_URL;

