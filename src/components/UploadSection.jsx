import { useState, useRef } from 'react'
import { Camera, AlertTriangle, X } from 'lucide-react'
import './UploadSection.css'

const UploadSection = ({ onFileUpload, error, apiStatus }) => {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (file) => {
    // Block uploads when model is busy to prevent flooding
    if (apiStatus !== 'live') {
      return
    }
    
    setSelectedFile(file)
    onFileUpload(file)
  }

  const onButtonClick = () => {
    // Block clicks when model is busy to prevent flooding
    if (apiStatus !== 'live') {
      return
    }
    fileInputRef.current?.click()
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const getUploadMessage = () => {
    if (apiStatus === 'offline') {
      return 'API is currently offline. Please try again later.'
    }
    if (apiStatus === 'in_use') {
      return 'Model is currently processing another request. Please wait until it\'s available.'
    }
    if (apiStatus === 'live') {
      return 'Drag and drop your image here, or click to browse'
    }
    return 'Ready to process your image'
  }

  const getStatusIcon = () => {
    if (apiStatus === 'offline') {
      return <AlertTriangle size={24} className="status-icon offline" />
    }
    if (apiStatus === 'in_use') {
      return <AlertTriangle size={24} className="status-icon in-use" />
    }
    if (apiStatus === 'live') {
      return <Camera size={32} />
    }
    return <Camera size={32} />
  }

  const getStatusColor = () => {
    if (apiStatus === 'offline') return 'offline'
    if (apiStatus === 'in_use') return 'in-use'
    if (apiStatus === 'live') return 'live'
    return 'live'
  }

  // Block uploads when model is busy to prevent flooding
  const isUploadDisabled = apiStatus !== 'live'

  return (
    <div className="upload-section">
      <div className="upload-container">
        <div className="upload-header">
          <h2>AI Clothing Analyzer</h2>
          <p>Upload an image to analyze clothing items and remove backgrounds with AI</p>
        </div>
        
        <div 
          className={`upload-area ${dragActive ? 'drag-active' : ''} ${isUploadDisabled ? 'disabled' : ''} status-${getStatusColor()}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={onButtonClick}
        >
          <div className="upload-content">
            <div className="upload-icon">
              {getStatusIcon()}
            </div>
            <h3>Select Clothing Item</h3>
            <p className="upload-message">{getUploadMessage()}</p>
            
            {apiStatus === 'offline' && (
              <div className="offline-message">
                <span className="offline-icon">
                  <AlertTriangle size={20} />
                </span>
                <span>Service temporarily unavailable</span>
              </div>
            )}
            
            {apiStatus === 'in_use' && (
              <div className="in-use-message">
                <span className="in-use-icon">
                  <AlertTriangle size={20} />
                </span>
                <span>Model is processing another request. Your upload will be queued.</span>
              </div>
            )}
            
            {selectedFile && (
              <div className="selected-file">
                <span className="file-name">{selectedFile.name}</span>
                <span className="file-size">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            disabled={isUploadDisabled}
            style={{ display: 'none' }}
          />
        </div>
        
        {error && (
          <div className="error-message">
            <span className="error-icon">
              <X size={20} />
            </span>
            <span>{error}</span>
          </div>
        )}
        
        <div className="upload-info">
          <p>Supported formats: PNG, JPEG, WebP</p>
          <p>Maximum file size: 10MB</p>
        </div>
      </div>
    </div>
  )
}

export default UploadSection
