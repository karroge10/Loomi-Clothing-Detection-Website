import React from 'react'
import { Camera, Target, Info, Upload } from 'lucide-react'
import './Results.css'

const Results = ({ 
  originalImage, 
  clothingOnlyImage, 
  dominantColor,
  selectedClothingType,
  onUploadNew
}) => {
  const handleDownload = () => {
    if (croppedImage) {
      const link = document.createElement('a')
      link.href = croppedImage
      link.download = 'clothing-analyzed-cropped.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const cropImageToClothing = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Get image data to find clothing boundaries
        const tempCanvas = document.createElement('canvas')
        const tempCtx = tempCanvas.getContext('2d')
        tempCanvas.width = img.width
        tempCanvas.height = img.height
        tempCtx.drawImage(img, 0, 0)
        
        const imageData = tempCtx.getImageData(0, 0, img.width, img.height)
        const data = imageData.data
        
        // Find boundaries of non-transparent pixels (clothing)
        let minX = img.width, minY = img.height, maxX = 0, maxY = 0
        let hasClothing = false
        
        for (let y = 0; y < img.height; y++) {
          for (let x = 0; x < img.width; x++) {
            const index = (y * img.width + x) * 4
            const alpha = data[index + 3]
            
            if (alpha > 10) { // Non-transparent pixel (clothing)
              hasClothing = true
              minX = Math.min(minX, x)
              minY = Math.min(minY, y)
              maxX = Math.max(maxX, x)
              maxY = Math.max(maxY, y)
            }
          }
        }
        
        if (!hasClothing) {
          // If no clothing found, return original image
          resolve(imageSrc)
          return
        }
        
        // Add padding around clothing (30px on each side for better visual balance)
        const padding = 30
        const clothingWidth = maxX - minX + 1
        const clothingHeight = maxY - minY + 1
        
        // Calculate new dimensions with padding
        const newWidth = clothingWidth + (padding * 2)
        const newHeight = clothingHeight + (padding * 2)
        
        // Set canvas size to new dimensions
        canvas.width = newWidth
        canvas.height = newHeight
        
        // Calculate source coordinates with padding, ensuring we don't go outside image bounds
        const srcX = Math.max(0, minX - padding)
        const srcY = Math.max(0, minY - padding)
        const srcWidth = Math.min(img.width - srcX, newWidth)
        const srcHeight = Math.min(img.height - srcY, newHeight)
        
        // Calculate destination coordinates to center the clothing
        const destX = Math.max(0, padding - (minX - srcX))
        const destY = Math.max(0, padding - (minY - srcY))
        
        // Clear canvas with transparent background
        ctx.clearRect(0, 0, newWidth, newHeight)
        
        // Draw cropped and padded image
        ctx.drawImage(
          img,
          srcX, srcY, srcWidth, srcHeight,
          destX, destY, srcWidth, srcHeight
        )
        
        // Convert to data URL
        const croppedImageDataUrl = canvas.toDataURL('image/png')
        resolve(croppedImageDataUrl)
      }
      
      img.onerror = () => resolve(imageSrc) // Fallback to original
      img.src = imageSrc
    })
  }

  const [croppedImage, setCroppedImage] = React.useState(null)
  const [isCropping, setIsCropping] = React.useState(false)

  React.useEffect(() => {
    if (clothingOnlyImage) {
      setIsCropping(true)
      cropImageToClothing(clothingOnlyImage).then((cropped) => {
        setCroppedImage(cropped)
        setIsCropping(false)
      }).catch(() => {
        setCroppedImage(clothingOnlyImage) // Fallback to original
        setIsCropping(false)
      })
    }
  }, [clothingOnlyImage])

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Analysis Complete</h2>
        <p>Your clothing has been analyzed successfully</p>
      </div>

      {/* Image Comparison */}
      <div className="results-content">
        <div className="image-section">
          <h3>
            <Camera size={20} />
            Original Image
          </h3>
          {originalImage && (
            <img 
              src={originalImage} 
              alt="Original uploaded image" 
            />
          )}
        </div>

        <div className="image-section">
          <h3>
            <Target size={20} />
            Background Removed
          </h3>
          {isCropping ? (
            <div className="cropping-indicator">
              <div className="spinner"></div>
              <p>Cropping image...</p>
            </div>
          ) : croppedImage ? (
            <img 
              src={croppedImage} 
              alt="Clothing with background removed and cropped" 
            />
          ) : null}
        </div>
      </div>

      {/* Analysis Information */}
      <div className="analysis-info">
        <h3>
          <Info size={20} />
          Analysis Results
        </h3>
        <div className="info-grid">
          <div className="info-card">
            <h4>Dominant Color</h4>
            {dominantColor ? (
              <div className="color-display">
                <div 
                  className="color-swatch" 
                  style={{ backgroundColor: dominantColor }}
                ></div>
                <span className="color-value">{dominantColor}</span>
              </div>
            ) : (
              <span className="category-info">Color not detected</span>
            )}
          </div>
          
          <div className="info-card">
            <h4>Clothing Category</h4>
            <span className="category-info">
              {selectedClothingType || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="cta-button secondary" onClick={onUploadNew}>
          <Upload size={20} />
          Upload New Image
        </button>
        <button className="cta-button primary" onClick={handleDownload} disabled={!croppedImage}>
          Download
        </button>
      </div>
    </div>
  )
}

export default Results
