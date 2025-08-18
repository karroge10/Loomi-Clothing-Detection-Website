import { useState, useRef, useEffect } from 'react'
import './CustomZoneSelector.css'

const CustomZoneSelector = ({ image, onBack, onAnalyze }) => {
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [endPoint, setEndPoint] = useState({ x: 0, y: 0 })
  const [selection, setSelection] = useState(null)
  const canvasRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
      }
      img.src = image
    }
  }, [image])

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setIsDrawing(true)
    setStartPoint({ x, y })
    setEndPoint({ x, y })
  }

  const handleMouseMove = (e) => {
    if (!isDrawing) return
    
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setEndPoint({ x, y })
    drawSelection()
  }

  const handleMouseUp = () => {
    if (!isDrawing) return
    
    setIsDrawing(false)
    const rect = canvasRef.current.getBoundingClientRect()
    const x = Math.min(startPoint.x, endPoint.x)
    const y = Math.min(startPoint.y, endPoint.y)
    const width = Math.abs(endPoint.x - startPoint.x)
    const height = Math.abs(endPoint.y - startPoint.y)
    
    if (width > 10 && height > 10) {
      setSelection({ x, y, width, height })
    }
  }

  const drawSelection = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    // Redraw the original image
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      
      // Draw selection rectangle
      if (isDrawing || selection) {
        const x = Math.min(startPoint.x, endPoint.x)
        const y = Math.min(startPoint.y, endPoint.y)
        const width = Math.abs(endPoint.x - startPoint.x)
        const height = Math.abs(endPoint.y - startPoint.y)
        
        ctx.strokeStyle = '#22c55e'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.strokeRect(x, y, width, height)
        
        // Fill with semi-transparent green
        ctx.fillStyle = 'rgba(34, 197, 94, 0.1)'
        ctx.fillRect(x, y, width, height)
      }
    }
    img.src = image
  }

  const handleAnalyze = () => {
    if (selection) {
      onAnalyze({
        x: selection.x,
        y: selection.y,
        width: selection.width,
        height: selection.height
      })
    }
  }

  const clearSelection = () => {
    setSelection(null)
    setStartPoint({ x: 0, y: 0 })
    setEndPoint({ x: 0, y: 0 })
    
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
      }
      img.src = image
    }
  }

  return (
    <div className="custom-zone-selector">
      <div className="selector-header">
        <h2>🎯 Custom Zone Selection</h2>
        <p>Draw a rectangle around the area you want to analyze</p>
      </div>
      
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="selection-canvas"
        />
      </div>
      
      <div className="instructions">
        <p>• Click and drag to select an area</p>
        <p>• The selected area will be highlighted in green</p>
        <p>• Make sure the selection covers the clothing item completely</p>
      </div>
      
      <div className="actions">
        <button className="action-btn secondary" onClick={onBack}>
          Back
        </button>
        <button className="action-btn secondary" onClick={clearSelection}>
          Clear Selection
        </button>
        <button 
          className="action-btn" 
          onClick={handleAnalyze}
          disabled={!selection}
        >
          Analyze Selected Zone
        </button>
      </div>
    </div>
  )
}

export default CustomZoneSelector
