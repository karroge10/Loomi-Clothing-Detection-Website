// API Configuration
export const API_CONFIG = {
  // Base URL for your Hugging Face API
  BASE_URL: import.meta.env.VITE_API_BASE_URL || import.meta.env.API_BASE_URL || 'http://localhost:3000',
  
  // API Key for Hugging Face authentication
  // Support both VITE_API_KEY (local development) and API_KEY (production)
  API_KEY: import.meta.env.VITE_API_KEY || import.meta.env.API_KEY,
  
  // Endpoints - adjust these based on your actual API endpoints
  ENDPOINTS: {
    CLOTHING_DETECTION: '/clothing',
    ANALYSIS: '/analyze',
    CUSTOM_ZONE: '/custom-zone'
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Headers for Hugging Face API
  HEADERS: {
    'Accept': 'application/json'
    // Note: Don't set Content-Type for FormData, let browser set it automatically
  }
}

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function to get headers with authorization
export const getAuthHeaders = (customHeaders = {}) => {
  const headers = { ...API_CONFIG.HEADERS, ...customHeaders }
  
  // Add authorization header if API key is available
  if (API_CONFIG.API_KEY) {
    headers['Authorization'] = `Bearer ${API_CONFIG.API_KEY}`
  }
  
  return headers
}

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return `Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`
  } else if (error.request) {
    // Request was made but no response received
    return 'No response from server. Please check your connection.'
  } else {
    // Something else happened
    return `Error: ${error.message || 'Unknown error occurred'}`
  }
}

// Helper function to make API requests
export const apiRequest = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint)
  
  const defaultOptions = {
    headers: getAuthHeaders(options.headers),
    timeout: API_CONFIG.TIMEOUT,
    ...options
  }
  
  try {
    const response = await fetch(url, defaultOptions)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}

// Helper function to make POST requests with FormData
export const apiPostFormData = async (endpoint, formData, customHeaders = {}) => {
  const url = buildApiUrl(endpoint)
  
  const options = {
    method: 'POST',
    headers: getAuthHeaders(customHeaders),
    body: formData
  }
  
  try {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    throw new Error(handleApiError(error))
  }
}
