import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createHighlightedImage } from '../config/api'
import './ClothingSelectionModal.css'

const ClothingSelectionModal = ({ clothingData, originalImage, highlightedImage, onSelect, onClose }) => {

  const [selectedType, setSelectedType] = useState(null)
  const [previewImage, setPreviewImage] = useState(highlightedImage || originalImage)
  
  // Memoize clothing instances to prevent unnecessary re-renders
  const clothingInstances = useMemo(() => 
    clothingData?.clothing_instances || [], 
    [clothingData?.clothing_instances]
  )
  
  // Cache for highlighted images to avoid regeneration
  const imageCache = useRef(new Map())
  const debounceTimer = useRef(null)

  // Update preview image when highlightedImage changes
  useEffect(() => {
    setPreviewImage(highlightedImage || originalImage)
  }, [highlightedImage, originalImage])

  // Debounced category selection to prevent rapid-fire clicks
  const handleSelect = useCallback((clothingType) => {
    // Clear any existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    // Set selected type immediately for UI responsiveness
    setSelectedType(clothingType)
    
    // Debounce the image processing
    debounceTimer.current = setTimeout(async () => {
      if (clothingData?.segmentation_data?.masks && originalImage) {
        try {
          // Check cache first
          const cacheKey = `${clothingType}_${originalImage}`
          if (imageCache.current.has(cacheKey)) {
            setPreviewImage(imageCache.current.get(cacheKey))
            return
          }
          
          // Create highlighted image with selected item
          const highlighted = await createHighlightedImage(
            originalImage, 
            clothingData.segmentation_data.masks, 
            clothingType
          )
          
          // Cache the result
          imageCache.current.set(cacheKey, highlighted)
          setPreviewImage(highlighted)
        } catch (error) {
          console.warn('Failed to create highlighted image:', error)
          setPreviewImage(originalImage)
        }
      }
    }, 150) // 150ms debounce delay
  }, [clothingData, originalImage])

  const handleContinue = () => {
    if (selectedType) {
      onSelect(selectedType)
    }
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Select Clothing Item</h3>
          <p className="modal-subtitle">Click on an item to see it highlighted, then click Continue to analyze</p>
        </div>

        <div className="modal-body">
          <div className="image-section">
            <div className="image-container">
              <img src={previewImage} alt="Image with highlighting" />

            </div>
          </div>

          <div className="clothing-list">
            <h3>Detected Items</h3>
            <div className="clothing-list-scroll">
              {clothingInstances.map((instance, index) => {
                const isSelected = selectedType === instance.type
                
                return (
                  <div
                    key={index}
                    className={`clothing-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(instance.type)}
                  >
                    <div className="clothing-header">
                      <span className="clothing-type">{instance.type}</span>
                      <span className="confidence-badge">
                        {instance.area_percentage}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleContinue}
            disabled={!selectedType}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClothingSelectionModal
