import { useState, useCallback } from 'react'
import pako from 'pako'

// API Configuration for Loomi Clothing Detection API
export const API_CONFIG = {
  // Base URL from environment variable
  get BASE_URL() {
    return import.meta.env.VITE_API_BASE_URL || 'https://huggingface.co/spaces/karoge/Loomi-Clothing-Detection-API'
  },
  
  // API endpoints
  ENDPOINTS: {
    HEALTH: '/health',
    PERFORMANCE: '/performance',
    DETECT: '/detect',
    ANALYZE: '/analyze'
  },
  
  // Workflow configuration
  WORKFLOW: {
    LOOMI: 'loomi',
    TRADITIONAL: 'traditional'
  },
  
  // Request configuration
  HEADERS: {
    'Accept': 'application/json'
  },
  
  // Timeout configuration
  TIMEOUT: 30000, // 30 seconds
  
  // File upload limits
  UPLOAD_LIMITS: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FORMATS: ['image/png', 'image/jpeg', 'image/webp']
  },
  
  // Visual highlighting configuration
  HIGHLIGHTING: {
    PRIMARY_COLOR: '#22c55e',      // Main highlight color (bright green)
    PRIMARY_OPACITY: 0.5,          // 50% opacity for fill
    SELECTED_COLOR: '#16a34a',     // Darker green for border
    SELECTED_OPACITY: 0.7,         // 70% opacity for border
    BORDER_WIDTH: 4                // Border width in pixels
  },
  
  // Rate limiting configuration
  RATE_LIMITS: {
    REQUESTS_PER_WINDOW: 15,
    WINDOW_SECONDS: 60,
    CONCURRENT_LIMIT: 5
  }
}

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function to handle API errors with rate limiting support
export const handleApiError = (error, response = null) => {
  if (response) {
    const status = response.status
    
    // Handle rate limiting
    if (status === 429) {
      const retryAfter = response.headers.get('Retry-After')
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining')
      const rateLimitReset = response.headers.get('X-RateLimit-Reset')
      
      if (rateLimitRemaining === '0') {
        return {
          type: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded. Maximum 15 requests per 60 seconds.',
          retryAfter: retryAfter ? parseInt(retryAfter) : 60,
          resetTime: rateLimitReset
        }
      } else {
        return {
          type: 'CONCURRENT_LIMIT_EXCEEDED',
          message: 'Concurrent request limit exceeded. Maximum 5 concurrent requests.',
          retryAfter: 5
        }
      }
    }
    
    // Handle validation errors
    if (status === 400) {
      return {
        type: 'VALIDATION_ERROR',
        message: 'Invalid request. Please check your image file.',
        details: error.message
      }
    }
    
    // Handle server errors
    if (status >= 500) {
      return {
        type: 'SERVER_ERROR',
        message: 'Server error. Please try again later.',
        details: error.message
      }
    }
    
    return {
      type: 'HTTP_ERROR',
      message: `HTTP error! status: ${status}`,
      details: error.message
    }
  }
  
  // Network or other errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Network error. Please check your connection.',
      details: error.message
    }
  }
  
  return {
    type: 'UNKNOWN_ERROR',
    message: error.message || 'An unknown error occurred',
    details: error.toString()
  }
}

// Helper function to make API requests with enhanced error handling
export const apiRequest = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint)
  
  const defaultOptions = {
    headers: API_CONFIG.HEADERS,
    timeout: API_CONFIG.TIMEOUT,
    ...options
  }
  
  try {
    const response = await fetch(url, defaultOptions)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      error.response = response
      error.data = errorData
      throw error
    }
    
    return await response.json()
  } catch (error) {
    const enhancedError = handleApiError(error, error.response)
    throw new Error(JSON.stringify(enhancedError))
  }
}

// Loomi API client for new simplified workflow
export const loomiAPI = {
  // Step 1: Detect clothing and get segmentation masks
  async detectClothing(imageFile) {
    const formData = new FormData()
    formData.append('file', imageFile)
    
    const response = await apiRequest(API_CONFIG.ENDPOINTS.DETECT, {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    })
    
    return response
  },
  
  // Step 2: Analyze selected clothing using cached segmentation data
  async analyzeClothing(segmentationData, selectedClothing) {
    const payload = {
      segmentation_data: {
        image_hash: segmentationData.image_hash
      },
      selected_clothing: selectedClothing
    }
    
    const response = await apiRequest(API_CONFIG.ENDPOINTS.ANALYZE, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    return response
  },
  
  // Health check endpoint
  async checkHealth() {
    return await apiRequest(API_CONFIG.ENDPOINTS.HEALTH, {
      method: 'GET'
    })
  },
  
  // Performance monitoring endpoint
  async getPerformance() {
    return await apiRequest(API_CONFIG.ENDPOINTS.PERFORMANCE, {
      method: 'GET'
    })
  }
}

// Legacy API functions (for fallback)
export const clothingAPI = {
  // Traditional clothing detection
  async traditionalDetection(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    return await apiRequest('/clothing', {
      method: 'POST',
      body: formData
    })
  },
  
  // Traditional analysis
  async traditionalAnalysis(file, selectedClothing = null) {
    const formData = new FormData()
    formData.append('file', file)
    
    if (selectedClothing) {
      formData.append('selected_clothing', selectedClothing)
    }
    
    return await apiRequest('/analyze', {
      method: 'POST',
      body: formData
    })
  },
  
  // Performance monitoring
  async getPerformanceMetrics() {
    return await apiRequest('/performance', {
      method: 'GET'
    })
  }
}

// Utility functions
export const validateFile = (file) => {
  const { MAX_FILE_SIZE, SUPPORTED_FORMATS } = API_CONFIG.UPLOAD_LIMITS
  
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`)
  }
  
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    throw new Error('Unsupported file format. Please use PNG, JPEG, or WebP')
  }
  
  return true
}

// Helper function to decode base64 segmentation masks
export const decodeBase64Mask = (base64String) => {
  try {
    const binaryString = atob(base64String)
    
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    return bytes
  } catch (error) {
    console.error('Error decoding base64 mask:', error)
    return new Uint8Array(0)
  }
}

// Helper function to decompress gzip-compressed base64 masks
export const decompressMasks = (maskBase64) => {
  try {
    // Decode base64 to get compressed bytes
    const compressedBytes = atob(maskBase64)
    
    // Convert to Uint8Array
    const compressedArray = new Uint8Array(compressedBytes.length)
    for (let i = 0; i < compressedBytes.length; i++) {
      compressedArray[i] = compressedBytes.charCodeAt(i)
    }
    
    // Decompress gzip using pako
    const decompressed = pako.inflate(compressedArray)
    
    // Convert to Uint8Array for mask processing
    const maskArray = new Uint8Array(decompressed.length)
    for (let i = 0; i < decompressed.length; i++) {
      maskArray[i] = decompressed[i]
    }
    
    // Try alternative decompression if first attempt yields all zeros
    if (maskArray.every(val => val === 0)) {
      try {
        // Try with different pako options
        const altDecompressed = pako.inflate(compressedArray, { to: 'string' })
        
        // Convert string to Uint8Array
        const altMaskArray = new Uint8Array(altDecompressed.length)
        for (let i = 0; i < altDecompressed.length; i++) {
          altMaskArray[i] = altDecompressed.charCodeAt(i)
        }
        
        const altNonZeroCount = altMaskArray.filter(val => val > 0).length
        
        if (altNonZeroCount > 0) {
          return altMaskArray
        }
              } catch {
          // Alternative decompression failed, continue with original
        }
    }
    
    return maskArray
  } catch (error) {
    console.error('Error decompressing gzip mask:', error)
    // Fallback to base64 decoding for uncompressed masks
    try {
      return decodeBase64Mask(maskBase64)
    } catch (fallbackError) {
      console.error('Fallback decoding also failed:', fallbackError)
      return new Uint8Array(0)
    }
  }
}

// Helper function to create highlighted image with clothing detection
export const createHighlightedImage = async (originalImage, segmentationMasks, selectedClothingType = null) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      // Use requestAnimationFrame to prevent blocking the main thread
      requestAnimationFrame(() => {
        try {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Set canvas size to match image
          canvas.width = img.width
          canvas.height = img.height
          
          // Draw original image first
          ctx.drawImage(img, 0, 0)
          
          // If we have a selected clothing type, highlight only that one
          if (selectedClothingType && segmentationMasks && segmentationMasks[selectedClothingType]) {
            try {
              const maskData = segmentationMasks[selectedClothingType]
              const mask = decompressMasks(maskData)
              
              if (mask.length > 0) {
                // Apply the selected clothing mask with neon effect
                applySelectedClothingMask(ctx, mask, img.width, img.height)
              }
            } catch (error) {
              console.warn(`Failed to process mask for ${selectedClothingType}:`, error)
            }
          }
          
          // Convert to data URL with high quality - force PNG format
          requestAnimationFrame(() => {
            try {
              // Force PNG format for better compatibility and neon effect
              const highlightedImageDataUrl = canvas.toDataURL('image/png', 1.0)
              resolve(highlightedImageDataUrl)
            } catch (error) {
              reject(new Error(`Failed to convert canvas to data URL: ${error.message}`))
            }
          })
          
        } catch (error) {
          reject(new Error(`Failed to create highlighted image: ${error.message}`))
        }
      })
    }
    
    img.onerror = () => reject(new Error('Failed to load original image'))
    img.src = originalImage
  })
}

// Helper function to apply selected clothing mask with neon effect
export const applySelectedClothingMask = (ctx, mask, width, height) => {
  // Colors for neon effect
  const fillColor = { r: 16, g: 122, b: 55 }   // #107a37 - dark green fill
  const borderColor = { r: 34, g: 197, b: 94 } // #22c55e - bright green border
  
  // If mask is all zeros, create a test pattern to verify rendering works
  if (mask.every(val => val === 0)) {
    // Create a simple test pattern (rectangle in the center)
    const centerX = Math.floor(width / 2)
    const centerY = Math.floor(height / 2)
    const rectWidth = Math.floor(width / 4)
    const rectHeight = Math.floor(height / 4)
    
    // Fill test rectangle
    ctx.save()
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = `rgba(${fillColor.r}, ${fillColor.g}, ${fillColor.b}, 0.8)`
    ctx.fillRect(centerX - rectWidth/2, centerY - rectHeight/2, rectWidth, rectHeight)
    ctx.restore()
    
    // Draw test border
    ctx.save()
    ctx.strokeStyle = `rgb(${borderColor.r}, ${borderColor.g}, ${borderColor.b})`
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = `rgb(${fillColor.r}, ${fillColor.g}, ${fillColor.b})`
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.strokeRect(centerX - rectWidth/2, centerY - rectHeight/2, rectWidth, rectHeight)
    ctx.restore()
    
    return
  }
  
  // Note: Test pattern creation moved to fallback section below
  
  // Create temporary canvas for mask processing
  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')
  tempCanvas.width = width
  tempCanvas.height = height
  
  // Create ImageData from mask
  const imageData = tempCtx.createImageData(width, height)
  const data = imageData.data
  
  // Convert mask to RGBA - optimized loop
  const maskLength = mask.length
  let minValue = 255
  let maxValue = 0
  
  // If we have non-zero values but they're all very small, adjust threshold
  // Use efficient loop instead of Math.max(...mask) to avoid stack overflow
  let maxMaskValue = 0
  for (let i = 0; i < maskLength; i++) {
    if (mask[i] > maxMaskValue) {
      maxMaskValue = mask[i]
    }
  }
  
  if (maxMaskValue > 0 && maxMaskValue < 0.5) {
    const adjustedThreshold = maxMaskValue / 2
    
    // Re-process with adjusted threshold
    for (let i = 0; i < maskLength; i++) {
      const maskValue = mask[i]
      const pixelIndex = i * 4
      
      if (maskValue > adjustedThreshold) {
        data[pixelIndex] = 255     // R
        data[pixelIndex + 1] = 255 // G
        data[pixelIndex + 2] = 255 // B
        data[pixelIndex + 3] = 255 // A
      } else {
        data[pixelIndex + 3] = 0   // Transparent
      }
    }
  } else if (maxMaskValue === 0) {
    // Try to create a simple test pattern to verify rendering works
    
    // Create a simple test pattern (rectangle in the center)
    const centerX = Math.floor(width / 2)
    const centerY = Math.floor(height / 2)
    const rectWidth = Math.floor(width / 4)
    const rectHeight = Math.floor(height / 4)
    
    // Fill test rectangle
    ctx.save()
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = `rgba(${fillColor.r}, ${fillColor.g}, ${fillColor.b}, 0.8)`
    ctx.fillRect(centerX - rectWidth/2, centerY - rectHeight/2, rectWidth, rectHeight)
    ctx.restore()
    
    // Draw test border
    ctx.save()
    ctx.strokeStyle = `rgb(${borderColor.r}, ${borderColor.g}, ${borderColor.b})`
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = `rgb(${fillColor.r}, ${fillColor.g}, ${fillColor.b})`
    ctx.shadowBlur = 8
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.strokeRect(centerX - rectWidth/2, centerY - rectHeight/2, rectWidth, rectHeight)
    ctx.restore()
    
    return
  }
  
  // First pass: analyze mask values - check more pixels and find non-zero areas
  for (let i = 0; i < maskLength; i++) {
    const maskValue = mask[i]
    if (maskValue < minValue) minValue = maskValue
    if (maskValue > maxValue) maxValue = maskValue
  }
  

  
  // Convert to RGBA in a single pass with proper indexing
  // Use the same threshold variable defined above
  for (let i = 0; i < maskLength; i++) {
    const maskValue = mask[i]
    const pixelIndex = i * 4
    
    if (maskValue > 0.5) { // Threshold for mask (0.5 for 0/1 values)
      data[pixelIndex] = 255     // R
      data[pixelIndex + 1] = 255 // G
      data[pixelIndex + 2] = 255 // B
      data[pixelIndex + 3] = 255 // A
    } else {
      data[pixelIndex + 3] = 0   // Transparent
    }
  }
  

  
  // Put mask data to temp canvas
  tempCtx.putImageData(imageData, 0, 0)
  
  // Step 1: Draw filled highlight with transparency
  ctx.save()
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = `rgba(${fillColor.r}, ${fillColor.g}, ${fillColor.b}, 0.8)`
  
  // Create fill path from mask
  ctx.beginPath()
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const maskIndex = y * width + x
      if (mask[maskIndex] > 128) {
        ctx.rect(x, y, 1, 1)
      }
    }
  }
  ctx.fill()
  ctx.restore()
  
  // Step 2: Draw neon border outline with multiple passes for better effect
  ctx.save()
  
  // First pass: outer glow (larger shadow)
  ctx.strokeStyle = `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, 0.6)`
  ctx.lineWidth = 8
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowColor = `rgb(${borderColor.r}, ${borderColor.g}, ${borderColor.b})`
  ctx.shadowBlur = 8
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
  
  // Create border outline by tracing the mask edges
  ctx.beginPath()
  let pathStarted = false
  
  // Since mask values are 0 or 1, use threshold 0.5 instead of 128
  const edgeThreshold = 0.5
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const maskIndex = y * width + x
      
      if (mask[maskIndex] > edgeThreshold) {
        // Check if this pixel is on the edge of the mask
        const isEdge = (
          x === 0 || y === 0 || 
          x === width - 1 || y === height - 1 ||
          (x > 0 && mask[maskIndex - 1] <= edgeThreshold) || 
          (x < width - 1 && mask[maskIndex + 1] <= edgeThreshold) ||
          (y > 0 && mask[maskIndex - width] <= edgeThreshold) || 
          (y < height - 1 && mask[maskIndex + width] <= edgeThreshold)
        )
        
        if (isEdge) {
          if (!pathStarted) {
            ctx.moveTo(x, y)
            pathStarted = true
          } else {
            ctx.lineTo(x, y)
          }
        }
      }
    }
  }
  
  // Stroke the outer glow
  if (pathStarted) {
    ctx.stroke()
  }
  
  // Second pass: main border (darker, smaller shadow)
  ctx.strokeStyle = `rgb(${borderColor.r}, ${borderColor.g}, ${borderColor.b})`
  ctx.lineWidth = 6
  ctx.shadowBlur = 8
  ctx.shadowColor = `rgba(${fillColor.r}, ${fillColor.g}, ${fillColor.b}, 0.8)`
  
  // Stroke the main border
  if (pathStarted) {
    ctx.stroke()
  }
  
  // Restore context
  ctx.restore()
}

// Helper function to convert hex color to RGB (kept for future use)
// const hexToRgb = (hex) => {
//   const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
//   return result ? {
//     r: parseInt(result[1], 16),
//     g: parseInt(result[2], 16),
//     b: parseInt(result[3], 16)
//   } : { r: 34, g: 197, b: 94 } // Default to primary green
// }

// Custom React hook for Loomi API integration
export const useLoomiAPI = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [detectionResult, setDetectionResult] = useState(null)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [segmentationData, setSegmentationData] = useState(null)
  const [highlightedImage, setHighlightedImage] = useState(null)

  const detectClothing = useCallback(async (imageFile, originalImageData) => {
    setIsLoading(true)
    setError(null)
    setDetectionResult(null)
    setSegmentationData(null)
    setHighlightedImage(null)
    
    try {
      const result = await loomiAPI.detectClothing(imageFile)
      setDetectionResult(result)
      
      if (result.segmentation_data) {
        setSegmentationData(result.segmentation_data)
        
        // Create highlighted image with all detected items
        // Note: originalImageData should be the uploaded file URL
        if (result.segmentation_data.masks && originalImageData) {
          const highlighted = await createHighlightedImage(
            originalImageData, 
            result.segmentation_data.masks
          )
          setHighlightedImage(highlighted)
        }
      }
      
      return result
    } catch (err) {
      const errorMessage = err.message
      try {
        const errorData = JSON.parse(errorMessage)
        setError(errorData.message || 'Detection failed')
      } catch {
        setError(errorMessage || 'Detection failed')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const analyzeClothing = useCallback(async (selectedClothing, originalImageData) => {
    if (!segmentationData) {
      throw new Error('No segmentation data available. Please detect clothing first.')
    }
    
    setIsLoading(true)
    setError(null)
    setAnalysisResult(null)
    
    try {
      const result = await loomiAPI.analyzeClothing(segmentationData, selectedClothing)
      setAnalysisResult(result)
      
      // Create highlighted image with selected item
      if (segmentationData.masks && originalImageData) {
        const highlighted = await createHighlightedImage(
          originalImageData, 
          segmentationData.masks, 
          selectedClothing
        )
        setHighlightedImage(highlighted)
      }
      
      return result
    } catch (err) {
      const errorMessage = err.message
      try {
        const errorData = JSON.parse(errorMessage)
        setError(errorData.message || 'Analysis failed')
      } catch {
        setError(errorMessage || 'Analysis failed')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [segmentationData])

  const reset = useCallback(() => {
    setDetectionResult(null)
    setAnalysisResult(null)
    setSegmentationData(null)
    setHighlightedImage(null)
    setError(null)
  }, [])

  const checkHealth = useCallback(async () => {
    try {
      return await loomiAPI.checkHealth()
    } catch (err) {
      console.error('Health check failed:', err)
      throw err
    }
  }, [])

  const getPerformance = useCallback(async () => {
    try {
      return await loomiAPI.getPerformance()
    } catch (err) {
      console.error('Performance check failed:', err)
      throw err
    }
  }, [])

  return {
    // State
    isLoading,
    error,
    detectionResult,
    analysisResult,
    segmentationData,
    highlightedImage,
    
    // Actions
    detectClothing,
    analyzeClothing,
    reset,
    checkHealth,
    getPerformance,
    
    // Computed values
    hasDetectionData: !!detectionResult,
    hasAnalysisData: !!analysisResult,
    detectedClothingTypes: detectionResult?.clothing_instances || [],
    clothingCount: detectionResult?.clothing_instances?.length || 0
  }
}
