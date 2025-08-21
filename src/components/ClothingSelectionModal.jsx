import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { createHighlightedImage } from '../config/api'
import './ClothingSelectionModal.css'

const ClothingSelectionModal = ({ clothingData, originalImage, highlightedImage, onSelect, onClose }) => {

  const [selectedType, setSelectedType] = useState(null)
  const [previewImage, setPreviewImage] = useState(highlightedImage || originalImage)
  const [isLoading, setIsLoading] = useState(false)
  
  const clothingInstances = useMemo(() => 
    clothingData?.clothing_instances || [], 
    [clothingData?.clothing_instances]
  )
  
  const imageCache = useRef(new Map())
  const debounceTimer = useRef(null)

  useEffect(() => {
    setPreviewImage(highlightedImage || originalImage)
  }, [highlightedImage, originalImage])

  const handleSelect = useCallback(async (clothingType) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    if (selectedType === clothingType) {
      setSelectedType(null)
      setPreviewImage(originalImage)
      return
    }

    setSelectedType(clothingType)
    
    if (clothingType === 'all_items') {
      setIsLoading(true)
      
      debounceTimer.current = setTimeout(async () => {
        if (clothingData?.segmentation_data?.masks && originalImage) {
          try {
            const cacheKey = `all_items_${originalImage}`
            if (imageCache.current.has(cacheKey)) {
              setPreviewImage(imageCache.current.get(cacheKey))
              setIsLoading(false)
              return
            }
            
            const highlighted = await createHighlightedImage(
              originalImage, 
              clothingData.segmentation_data.masks, 
              'all'
            )
            
            imageCache.current.set(cacheKey, highlighted)
            setPreviewImage(highlighted)
          } catch (error) {
            setPreviewImage(originalImage)
          } finally {
            setIsLoading(false)
          }
        } else {
          setIsLoading(false)
        }
      }, 150)
      return
    }
    
    setIsLoading(true)
    
    debounceTimer.current = setTimeout(async () => {
      if (clothingData?.segmentation_data?.masks && originalImage) {
        try {
          const cacheKey = `${clothingType}_${originalImage}`
          if (imageCache.current.has(cacheKey)) {
            setPreviewImage(imageCache.current.get(cacheKey))
            setIsLoading(false)
            return
          }
          
          const highlighted = await createHighlightedImage(
            originalImage, 
            clothingData.segmentation_data.masks, 
            clothingType
          )
          
          imageCache.current.set(cacheKey, highlighted)
          setPreviewImage(highlighted)
        } catch (error) {
          setPreviewImage(originalImage)
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }, 150)
  }, [clothingData, originalImage, selectedType])

  const handleContinue = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    onSelect(selectedType)
  }

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
          <p className="modal-subtitle">Click on an item to select/deselect it. Selected items will be highlighted in the image.</p>
        </div>

        <div className="modal-body">
          <div className="image-section">
            <div 
              className="image-container"
              style={{ '--bg-image': `url(${previewImage})` }}
            >
              <img 
                src={previewImage} 
                alt="Image with highlighting" 
              />
              {isLoading && (
                <div className="image-loading-overlay">
                  <div className="loading-spinner"></div>
                  <span>Processing image...</span>
                </div>
              )}
            </div>
          </div>

          <div className="clothing-list">
            <h3>Detected Items</h3>
            <div className="clothing-list-scroll">
              <div
                className={`clothing-option all-items-option ${selectedType === 'all_items' ? 'selected' : ''}`}
                onClick={() => handleSelect('all_items')}
              >
                <div className="clothing-header">
                  <span className="clothing-type">All Items</span>
                  <span className="confidence-badge">
                    {clothingInstances.length > 0 
                      ? `${clothingInstances.reduce((sum, instance) => sum + parseFloat(instance.area_percentage), 0).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
              </div>

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
            className={`btn ${selectedType ? 'btn-primary' : 'btn-disabled'}`}
            onClick={handleContinue}
            disabled={!selectedType}
          >
            {selectedType ? 'Continue' : 'Select an item to continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClothingSelectionModal
