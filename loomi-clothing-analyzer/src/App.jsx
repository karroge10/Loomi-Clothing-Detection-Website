import { useState, useCallback, useRef, useEffect } from 'react'
import './App.css'
import { Analytics } from '@vercel/analytics/react'
import Header from './components/Header'
// import Hero from './components/Hero'
import UploadSection from './components/UploadSection'
import LoadingSpinner from './components/LoadingSpinner'
import Results from './components/Results'
import ClothingSelectionModal from './components/ClothingSelectionModal'
// import CustomZoneSelector from './components/CustomZoneSelector'
import Features from './components/Features'
import About from './components/About'
import { loomiAPI, validateFile, API_CONFIG, createHighlightedImage } from './config/api'

function App() {
  // const [currentFile, setCurrentFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState('')
  const [clothingData, setClothingData] = useState(null)
  // const [selectedClothingType, setSelectedClothingType] = useState(null)
  const [originalImageData, setOriginalImageData] = useState(null)
  const [showModal, setShowModal] = useState(false)
  // const [showCustomZone, setShowCustomZone] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [error, setError] = useState(null)
  
  // New state for Loomi API workflow
  const [segmentationData, setSegmentationData] = useState(null)
  const [highlightedImage, setHighlightedImage] = useState(null)
  // const [workflowType, setWorkflowType] = useState(API_CONFIG.WORKFLOW.LOOMI)
  const [detectionResult, setDetectionResult] = useState(null)
  
  // API status state
  const [apiStatus, setApiStatus] = useState('checking')
  
  // Refs for smooth scrolling
  const analyzerRef = useRef(null)
  const featuresRef = useRef(null)
  const aboutRef = useRef(null)

  // Health check on component mount
  useEffect(() => {
    checkApiHealth()
    
    // Set up periodic health checks every 60 seconds
    const healthCheckInterval = setInterval(checkApiHealth, 60000)
    
    return () => clearInterval(healthCheckInterval)
  }, [])

  // Simplified API health check function
  const checkApiHealth = async () => {
    try {
      setApiStatus('checking')
      
      const healthData = await Promise.race([
        loomiAPI.checkHealth(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), 10000)
        )
      ])
      
      // Extract status from response
      let status = null
      if (typeof healthData === 'string') {
        status = healthData.toLowerCase()
      } else if (healthData && typeof healthData === 'object') {
        status = healthData.status || healthData.state || healthData.message
        if (status) status = status.toLowerCase()
      }
      
      // Set API status based on response
      const isHealthy = status === 'healthy' || status === 'live' || status === 'ok' || status === 'online'
      setApiStatus(isHealthy ? 'live' : 'offline')
      
    } catch {
      setApiStatus('offline')
    }
  }

  // Block scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showModal])

  const handleScrollToSection = useCallback((section) => {
    let targetRef = null
    
    switch (section) {
      case 'analyzer':
        targetRef = analyzerRef.current
        break
      case 'features':
        targetRef = featuresRef.current
        break
      case 'about':
        targetRef = aboutRef.current
        break
      default:
        targetRef = analyzerRef.current
    }
    
    if (targetRef) {
      targetRef.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }, [])

  const handleFileUpload = useCallback(async (file) => {
    // Prevent upload if API is not live
    if (apiStatus !== 'live') {
      setError('Service is currently unavailable. Please try again later.')
      return
    }

    try {
      // Validate file before processing
      validateFile(file)
      
      // setCurrentFile(file)
      setError(null)
      setIsLoading(true)
      setLoadingStatus('Starting analysis...')
      setSegmentationData(null)
      setHighlightedImage(null)
      setDetectionResult(null)

      // Display original image
      const reader = new FileReader()
      reader.onload = (e) => {
        setOriginalImageData(e.target.result)
      }
      reader.readAsDataURL(file)

      // Process image with Loomi API workflow
      await processImageWithLoomi(file)
    } catch (error) {
      console.error('File upload error:', error)
      setError(error.message)
      setIsLoading(false)
      setLoadingStatus('')
    }
  }, [apiStatus])

  // Loomi API workflow: Step 1 - Clothing detection and segmentation
  const processImageWithLoomi = async (file) => {
    try {
      setIsLoading(true)
      setError(null)
      // const startTime = Date.now()
      
      // Create object URL for the uploaded file
      const originalImageUrl = URL.createObjectURL(file)
      setOriginalImageData(originalImageUrl)
      
      // Step 1: Detect clothing using Loomi API
      const detectionData = await loomiAPI.detectClothing(file)
      
      if (!detectionData.clothing_instances || detectionData.clothing_instances.length === 0) {
        throw new Error('No clothing detected in the image')
      }
      
      // Transform API response to match our expected format
      const clothingTypes = {}
      const coordinates = {}
      
      // Handle new API structure with clothing_instances
      if (detectionData.clothing_instances && Array.isArray(detectionData.clothing_instances)) {
        detectionData.clothing_instances.forEach((instance, index) => {
          const type = instance.type || `clothing_${index}`
          clothingTypes[type] = {
            percentage: Math.round(instance.area_percentage || 0),
            pixels: instance.area_pixels || 0,
            confidence: instance.confidence || 0.5,
            bbox: instance.bbox || { x: 0, y: 0, width: 100, height: 100 }
          }
          
          // Convert bbox to coordinates format
          if (instance.bbox && instance.bbox.x !== undefined) {
            coordinates[type] = {
              x_min: instance.bbox.x,
              y_min: instance.bbox.y,
              width: instance.bbox.width,
              height: instance.bbox.height
            }
          }
        })
      }
      // Fallback to old structure if clothing_types exists
      else if (detectionData.clothing_types && Array.isArray(detectionData.clothing_types)) {
        detectionData.clothing_types.forEach((item, index) => {
          const type = item.type || `clothing_${index}`
          clothingTypes[type] = {
            percentage: Math.round(item.area_percentage || 0),
            pixels: Math.round((item.area_percentage || 0) * 100), // Approximate
            confidence: item.confidence || 0.5,
            bbox: item.bbox || [0, 0, 100, 100]
          }
          
          // Convert bbox to coordinates format
          if (item.bbox && Array.isArray(item.bbox) && item.bbox.length === 4) {
            coordinates[type] = {
              x_min: item.bbox[0],
              y_min: item.bbox[1],
              width: item.bbox[2] - item.bbox[0],
              height: item.bbox[3] - item.bbox[1]
            }
          }
        })
      }
      
      const clothingCount = Object.keys(clothingTypes).length
      
      // Store transformed data for modal
      setClothingData({
        clothing_types: clothingTypes,
        coordinates: coordinates,
        total_detected: clothingCount,
        segmentation_data: detectionData.segmentation_data,
        processing_time: detectionData.processing_time,
        clothing_instances: detectionData.clothing_instances
      })
      setShowModal(true)
      
      // Create highlighted image with all detected items
      if (detectionData.segmentation_data?.masks && originalImageUrl) {
        const highlighted = await createHighlightedImage(
          originalImageUrl, 
          detectionData.segmentation_data.masks
        )
        setHighlightedImage(highlighted)
      }
      
      // Store detection result for later use
      setDetectionResult(detectionData)
      setSegmentationData(detectionData.segmentation_data)
      
      // Update performance metrics
      updatePerformanceMetrics()
      
    } catch (error) {
      console.error('Loomi API detection failed:', error)
      setError(error.message || 'Detection failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Loomi API workflow: Step 2 - Analysis with segmentation data (commented out)
  // const performLoomiAnalysis = async (segmentationData, selectedClothing) => {
  //   // Implementation moved to handleClothingSelection
  // }

  // Fallback: Traditional workflow (commented out for now)
  // const processImageTraditional = async (file) => {
  //   // Implementation for fallback workflow
  //   // This can be uncommented if needed for backward compatibility
  // }

  // const performTraditionalAnalysis = async (file, clothingType) => {
  //   // Traditional analysis implementation (commented out)
  // }

  const handleClothingSelection = useCallback(async (clothingType) => {
    // setSelectedClothingType(clothingType)
    setShowModal(false)
    
    if (!segmentationData) {
      setError('No segmentation data available')
      return
    }
    
    try {
      setIsLoading(true)
      setLoadingStatus('Analyzing selected clothing...')
      
      // Call Loomi API analyze endpoint
      const analysisResult = await loomiAPI.analyzeClothing(segmentationData, clothingType)
      
      // Transform results to match expected format
      const transformedResults = {
        clothing_only_image: analysisResult.clothing_only_image,
        dominant_color: analysisResult.dominant_color,
        selected_clothing: clothingType,
        processing_time: {
          detection: detectionResult?.processing_time || 0,
          analysis: analysisResult.processing_time || 0,
          total: (detectionResult?.processing_time || 0) + (analysisResult.processing_time || 0)
        }
      }
      
      setAnalysisResults(transformedResults)
      setLoadingStatus('')
      setIsLoading(false)
      
    } catch (error) {
      console.error('Analysis failed:', error)
      setError(error.message || 'Analysis failed')
      setLoadingStatus('')
      setIsLoading(false)
    }
  }, [segmentationData, detectionResult])

  // const handleCustomZoneSelection = () => {
  //   setShowCustomZone(true)
  // }

  const handleBackToUpload = () => {
    // setCurrentFile(null)
    setClothingData(null)
    // setSelectedClothingType(null)
    setOriginalImageData(null)
    setAnalysisResults(null)
    setError(null)
    // setShowCustomZone(false)
    setSegmentationData(null)
    setHighlightedImage(null)
    setDetectionResult(null)
    // setWorkflowType(API_CONFIG.WORKFLOW.LOOMI)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    handleBackToUpload()
  }

  // Performance monitoring
  const updatePerformanceMetrics = async () => {
    try {
      await loomiAPI.getPerformance()
    } catch (error) {
      console.warn('Could not fetch performance metrics:', error)
    }
  }

  return (
    <div className="app">
      <Header 
        onScrollToSection={handleScrollToSection} 
        apiStatus={apiStatus}
      />
      
      {/* Analyzer Section */}
      <section ref={analyzerRef} className="analyzer-section">
        <div className="container">
          {!analysisResults && !isLoading && (
            <UploadSection onFileUpload={handleFileUpload} error={error} apiStatus={apiStatus} />
          )}

          {isLoading && <LoadingSpinner status={loadingStatus} showProgress={true} />}

          {analysisResults && (
            <Results
              originalImage={originalImageData}
              clothingOnlyImage={analysisResults.clothing_only_image}
              dominantColor={analysisResults.dominant_color}
              selectedClothingType={analysisResults.selected_clothing}
              onUploadNew={handleBackToUpload}
            />
          )}

          {/* Custom Zone Selector removed */}
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef}>
        <Features />
      </section>

      {/* About Section */}
      <section ref={aboutRef}>
        <About />
      </section>

      {showModal && (
        <ClothingSelectionModal
          clothingData={clothingData}
          originalImage={originalImageData}
          highlightedImage={highlightedImage}
          onSelect={handleClothingSelection}
          onClose={handleCloseModal}
        />
      )}
      <Analytics />
    </div>
  )
}

export default App
