import { useState, useRef } from 'react'
import './UploadSection.css'

const UploadSection = ({ onFileUpload, error }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFileUpload(files[0])
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      onFileUpload(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="main-content">
      <div 
        className={`upload-section ${isDragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="upload-icon">📸</div>
        <p className="upload-text">Drag and drop an image here or click to select</p>
        <button className="upload-btn" onClick={(e) => e.stopPropagation()}>
          Choose Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
      
      {error && (
        <div className="error">
          {error}
        </div>
      )}
    </div>
  )
}

export default UploadSection
