import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import UploadSection from './components/UploadSection'
import LoadingSpinner from './components/LoadingSpinner'
import Results from './components/Results'
import ClothingSelectionModal from './components/ClothingSelectionModal'
import CustomZoneSelector from './components/CustomZoneSelector'
import { apiPostFormData } from './config/api'

function App() {
  // Log environment variables for debugging
  console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)
  console.log('API Key available:', !!import.meta.env.VITE_API_KEY)
  
  const [currentFile, setCurrentFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [clothingData, setClothingData] = useState(null)
  const [selectedClothingType, setSelectedClothingType] = useState(null)
  const [originalImageData, setOriginalImageData] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showCustomZone, setShowCustomZone] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)
  const [error, setError] = useState(null)

  const handleFileUpload = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    setCurrentFile(file)
    setError(null)
    setIsLoading(true)

    // Display original image
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImageData(e.target.result)
    }
    reader.readAsDataURL(file)

    // Process image with API
    processImage(file)
  }

  const processImage = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      console.log('Sending clothing detection request...')
      
      const data = await apiPostFormData('/clothing', formData)
      setClothingData(data)

      // Transform API response to match our expected format
      const clothingInstances = data.clothing_instances || []
      const clothingTypes = {}
      const coordinates = {}
      
      clothingInstances.forEach(instance => {
        const type = instance.type
        clothingTypes[type] = {
          percentage: instance.area_percentage,
          pixels: instance.area_pixels
        }
        coordinates[type] = {
          x_min: instance.bbox.x,
          y_min: instance.bbox.y,
          width: instance.bbox.width,
          height: instance.bbox.height
        }
      })
      
      const clothingCount = clothingInstances.length

      if (clothingCount > 1) {
        // Store transformed data for modal
        setClothingData({
          clothing_types: clothingTypes,
          coordinates: coordinates,
          total_detected: clothingCount
        })
        setShowModal(true)
        setIsLoading(false)
      } else if (clothingCount === 1) {
        setSelectedClothingType(Object.keys(clothingTypes)[0])
        await performFullAnalysis(file, Object.keys(clothingTypes)[0])
      } else {
        setError('No clothing detected in the image')
        setIsLoading(false)
      }
    } catch (error) {
      setError('Error processing image: ' + error.message)
      setIsLoading(false)
    }
  }

  const performFullAnalysis = async (file, clothingType) => {
    try {
      setIsLoading(true)
      const formData = new FormData()
      formData.append('file', file)
      if (clothingType) {
        formData.append('selected_clothing', clothingType)
      }

      console.log('Sending analysis request...')
      
      const data = await apiPostFormData('/analyze', formData)
      
      // Transform analysis results to match our expected format
      const analysisResults = {
        clothing_only_image: data.clothing_only_image,
        dominant_color: data.dominant_color,
        clothing_analysis: {
          total_detected: clothingData?.total_detected || 0,
          main_clothing: [selectedClothingType],
          clothing_types: clothingData?.clothing_types || {}
        }
      }
      
      setAnalysisResults(analysisResults)
      setIsLoading(false)
    } catch (error) {
      setError('Error analyzing image: ' + error.message)
      setIsLoading(false)
    }
  }

  const handleClothingSelection = (clothingType) => {
    setSelectedClothingType(clothingType)
    setShowModal(false)
    performFullAnalysis(currentFile, clothingType)
  }

  const handleCustomZoneSelection = () => {
    setShowCustomZone(true)
  }

  const handleBackToUpload = () => {
    setCurrentFile(null)
    setClothingData(null)
    setSelectedClothingType(null)
    setOriginalImageData(null)
    setAnalysisResults(null)
    setError(null)
    setShowCustomZone(false)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    handleBackToUpload()
  }

  return (
    <div className="app">
      <Header />
      
      <div className="container">
        {!analysisResults && !isLoading && (
          <>
            <Hero />
            <UploadSection onFileUpload={handleFileUpload} error={error} />
          </>
        )}

        {isLoading && <LoadingSpinner />}

        {analysisResults && (
          <Results
            results={analysisResults}
            originalImage={originalImageData}
            selectedClothingType={selectedClothingType}
            onBack={handleBackToUpload}
            onCustomZone={handleCustomZoneSelection}
          />
        )}

        {showCustomZone && (
          <CustomZoneSelector
            image={originalImageData}
            onBack={() => setShowCustomZone(false)}
            onAnalyze={(zoneData) => {
              // Handle custom zone analysis
              console.log('Custom zone data:', zoneData)
            }}
          />
        )}
      </div>

      {showModal && (
        <ClothingSelectionModal
          clothingData={clothingData}
          originalImage={originalImageData}
          onSelect={handleClothingSelection}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

export default App
