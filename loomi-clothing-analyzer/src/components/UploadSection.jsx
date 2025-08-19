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
    if (apiStatus !== 'live') {
      return
    }
    
    setSelectedFile(file)
    onFileUpload(file)
  }

  const onButtonClick = () => {
    if (apiStatus === 'live') {
      fileInputRef.current?.click()
    }
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
    if (apiStatus === 'checking') {
      return 'Checking API status...'
    }
    if (apiStatus === 'live') {
      return 'Drag and drop your image here, or click to browse'
    }
    return 'Checking API status...'
  }

  const getStatusIcon = () => {
    if (apiStatus === 'offline') {
      return <AlertTriangle size={24} className="status-icon offline" />
    }
    if (apiStatus === 'checking') {
      return <div className="status-icon checking" />
    }
    if (apiStatus === 'live') {
      return <Camera size={32} />
    }
    return <div className="status-icon checking" />
  }

  const getStatusColor = () => {
    if (apiStatus === 'offline') return 'offline'
    if (apiStatus === 'checking') return 'checking'
    if (apiStatus === 'live') return 'live'
    return 'checking'
  }

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
            
            {apiStatus === 'checking' && (
              <div className="checking-message">
                <div className="checking-spinner"></div>
                <span>Verifying service availability...</span>
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
