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
  
  // API status state - simplified approach
  const [apiStatus, setApiStatus] = useState('live')
  
  // Refs for smooth scrolling
  const analyzerRef = useRef(null)
  const featuresRef = useRef(null)
  const aboutRef = useRef(null)

  // Simple status management based on loading state
  useEffect(() => {
    console.log('🔄 Loading state changed:', isLoading)
    
    if (isLoading) {
      console.log('📊 Setting API status to: in_use')
      setApiStatus('in_use')
    } else {
      console.log('📊 Setting API status to: live')
      setApiStatus('live')
    }
  }, [isLoading])

  // Log current status for debugging
  useEffect(() => {
    console.log('📊 Current API status:', apiStatus)
  }, [apiStatus])

  // Block scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = '0px'
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = '0px'
    }

    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = '0px'
    }
  }, [showModal])

  // Scroll to top when page loads/reloads
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
    console.log(`📤 File upload attempt - Current API status: ${apiStatus}`)
    
    // Block uploads when model is busy to prevent flooding
    if (apiStatus !== 'live') {
      if (apiStatus === 'in_use') {
        console.log('🚫 Upload blocked - Model is busy')
        setError('Model is currently processing another request. Please wait until it\'s available.')
      } else {
        console.log('🚫 Upload blocked - Service unavailable')
        setError('Service is currently unavailable. Please try again later.')
      }
      return
    }

    try {
      console.log('✅ Upload allowed - starting file validation')
      // Validate file before processing
      validateFile(file)
      
      // Track active request
      // setActiveRequests(prev => { // This state was removed
      //   const newCount = prev + 1
      //   console.log(`📊 Active requests updated: ${prev} → ${newCount}`)
      //   return newCount
      // })
      // setLastRequestTime(Date.now()) // This state was removed
      console.log(`⏰ Last request time updated: ${new Date().toISOString()}`)
      
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

      console.log('🚀 Starting image processing workflow')
      // Process image with Loomi API workflow
      await processImageWithLoomi(file)
    } catch (error) {
      console.error('❌ File upload error:', error)
      setError(error.message)
      setIsLoading(false)
      setLoadingStatus('')
    } finally {
      // Always decrement active requests count
      // setActiveRequests(prev => { // This state was removed
      //   const newCount = Math.max(0, prev - 1)
      //   console.log(`📊 Active requests updated: ${prev} → ${newCount}`)
      //   return newCount
      // })
    }
  }, [apiStatus])

  // Loomi API workflow: Step 1 - Clothing detection and segmentation
  const processImageWithLoomi = async (file) => {
    let messageInterval
    
    try {
      console.log('🔄 Starting image processing workflow')
      setIsLoading(true)
      setError(null)
      
      // Update status to show model is in use
      console.log('🔄 Updating API status to "in_use"')
      // setApiStatus('in_use') // Removed - let the useEffect handle this based on isLoading
      // setIsModelInUse(true) // This state was removed
      
      // const startTime = Date.now()
      
      // Create object URL for the uploaded file
      const originalImageUrl = URL.createObjectURL(file)
      setOriginalImageData(originalImageUrl)
      
      // Enhanced loading messages for better user engagement
      const loadingMessages = [
        'Analyzing your image...',
        'Detecting clothing items...',
        'Processing segmentation masks...',
        'Almost done...',
        'Finalizing results...'
      ]
      
      let messageIndex = 0
      messageInterval = setInterval(() => {
        if (messageIndex < loadingMessages.length - 1) {
          messageIndex++
          console.log(`💬 Loading message updated: "${loadingMessages[messageIndex]}"`)
          setLoadingStatus(loadingMessages[messageIndex])
        }
      }, 3000) // Change message every 3 seconds
      
      // Step 1: Detect clothing using Loomi API
      console.log('🤖 Calling Loomi API for clothing detection...')
      setLoadingStatus('Connecting to AI model...')
      const detectionData = await loomiAPI.detectClothing(file)
      
      // Clear the message interval
      clearInterval(messageInterval)
      console.log('✅ Clothing detection completed successfully')
      
      if (!detectionData.clothing_instances || detectionData.clothing_instances.length === 0) {
        throw new Error('No clothing detected in the image')
      }
      
      setLoadingStatus('Preparing results...')
      
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
      
      // Update status when processing is complete
      console.log('🔄 Processing complete - updating API status to "live"')
      // setApiStatus('live') // Removed - let the useEffect handle this based on isLoading
      // setIsModelInUse(false) // This state was removed
      
    } catch (error) {
      console.error('❌ Loomi API detection failed:', error)
      
      // Provide more helpful error messages based on the error type
      let errorMessage = error.message || 'Detection failed'
      
      if (error.message?.includes('timeout') || error.message?.includes('network')) {
        errorMessage = 'Connection timeout. The model might be busy. Please try again.'
        console.log('⏰ Timeout/network error detected')
      } else if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.'
        console.log('🚫 Rate limit error detected')
      } else if (error.message?.includes('503') || error.message?.includes('service unavailable')) {
        errorMessage = 'Service temporarily unavailable. The model is likely busy processing other requests.'
        console.log('🚫 Service unavailable error - updating status to "in_use"')
        // Update API status to reflect the busy state
        // setApiStatus('in_use') // Removed - let the useEffect handle this based on isLoading
        // setIsModelInUse(true) // This state was removed
      }
      
      setError(errorMessage)
    } finally {
      console.log('🏁 Image processing workflow completed')
      setIsLoading(false)
      setLoadingStatus('')
      
      // Clear any remaining intervals
      if (typeof messageInterval !== 'undefined') {
        clearInterval(messageInterval)
      }
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
    console.log('👕 Clothing selection started:', clothingType)
    setShowModal(false)
    
    if (!segmentationData) {
      setError('No segmentation data available')
      return
    }
    
    try {
      setIsLoading(true)
      console.log('🔄 Set loading to true for clothing analysis')
      
      if (clothingType === 'all_items') {
        setLoadingStatus('Processing full image for background removal...')
        // For all items, we'll use the existing highlighted image or create one with all masks
        const analysisResult = await loomiAPI.analyzeClothing(segmentationData, 'full_image')
        console.log('✅ Full image analysis completed')
        
        const transformedResults = {
          clothing_only_image: analysisResult.clothing_only_image,
          dominant_color: analysisResult.dominant_color,
          selected_clothing: 'Full Image',
          processing_time: {
            detection: detectionResult?.processing_time || 0,
            analysis: analysisResult.processing_time || 0,
            total: (detectionResult?.processing_time || 0) + (analysisResult.processing_time || 0)
          }
        }
        
        setAnalysisResults(transformedResults)
      } else {
        setLoadingStatus('Analyzing selected clothing...')
        // Call Loomi API analyze endpoint for specific clothing
        const analysisResult = await loomiAPI.analyzeClothing(segmentationData, clothingType)
        console.log('✅ Clothing analysis completed')
        
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
      }
      
      setLoadingStatus('')
      setIsLoading(false)
      console.log('🏁 Clothing analysis finished, setting loading to false')
      
    } catch (error) {
      console.error('❌ Analysis failed:', error)
      setError(error.message || 'Analysis failed')
      setLoadingStatus('')
      setIsLoading(false)
    }
  }, [segmentationData, detectionResult])

  // const handleCustomZoneSelection = () => {
  //   setShowCustomZone(true) // This state was removed
  // }

  const handleBackToUpload = () => {
    // setCurrentFile(null) // This state was removed
    // setSelectedClothingType(null) // This state was removed
    setOriginalImageData(null)
    setAnalysisResults(null)
    setClothingData(null)
    setError(null)
    // setShowCustomZone(false) // This state was removed
    setSegmentationData(null)
    setHighlightedImage(null)
    setDetectionResult(null)
    // setWorkflowType(API_CONFIG.WORKFLOW.LOOMI) // This state was removed
    
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
          {!showModal && !segmentationData && !isLoading && (
            <UploadSection onFileUpload={handleFileUpload} error={error} apiStatus={apiStatus} />
          )}

          {isLoading && <LoadingSpinner status={loadingStatus} showProgress={true} />}

          {!showModal && analysisResults && (
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