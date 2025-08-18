import { useState, useEffect } from 'react'
import './ClothingSelectionModal.css'

const ClothingSelectionModal = ({ clothingData, originalImage, onSelect, onClose }) => {
  const [selectedType, setSelectedType] = useState(null)
  const clothingTypes = clothingData?.clothing_types || {}
  const coordinates = clothingData?.coordinates || {}

  const handleSelect = (type) => {
    setSelectedType(type)
  }

  const handleAnalyze = () => {
    if (selectedType) {
      onSelect(selectedType)
    }
  }

  const createClothingPreview = (clothingType) => {
    if (!originalImage || !coordinates[clothingType]) return originalImage

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    return new Promise((resolve) => {
      img.onload = () => {
        const coords = coordinates[clothingType]
        canvas.width = coords.width
        canvas.height = coords.height
        
        ctx.drawImage(
          img,
          coords.x_min, coords.y_min, coords.width, coords.height,
          0, 0, coords.width, coords.height
        )
        
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = originalImage
    })
  }

  return (
    <div className="modal show" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>👕 Select Clothing Item</h3>
        <p>Multiple clothing items detected. Please select one to analyze:</p>
        
        <div className="clothing-options">
          {Object.entries(clothingTypes).map(([type, details]) => (
            <ClothingOption
              key={type}
              type={type}
              details={details}
              coordinates={coordinates[type]}
              originalImage={originalImage}
              isSelected={selectedType === type}
              onSelect={handleSelect}
            />
          ))}
        </div>
        
        <div className="detection-summary">
          <p>Total items detected: {clothingData?.total_detected || 0}</p>
        </div>
        
        <div>
          <button className="modal-btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="modal-btn" 
            onClick={handleAnalyze}
            disabled={!selectedType}
          >
            Analyze Selected
          </button>
        </div>
      </div>
    </div>
  )
}

const ClothingOption = ({ type, details, coordinates, originalImage, isSelected, onSelect }) => {
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    if (originalImage && coordinates) {
      createClothingPreview(type, coordinates, originalImage).then(setPreviewImage)
    }
  }, [type, coordinates, originalImage])

  const createClothingPreview = async (clothingType, coords, imgSrc) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = coords.width
        canvas.height = coords.height
        
        ctx.drawImage(
          img,
          coords.x_min, coords.y_min, coords.width, coords.height,
          0, 0, coords.width, coords.height
        )
        
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = imgSrc
    })
  }

  return (
    <div 
      className={`clothing-option ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(type)}
    >
      <img 
        src={previewImage || originalImage} 
        alt={type} 
        className="clothing-option-image"
      />
      <div className="clothing-option-content">
        <h4>{type}</h4>
        <p>{details.percentage}% of image ({details.pixels.toLocaleString()} pixels)</p>
      </div>
    </div>
  )
}

export default ClothingSelectionModal
