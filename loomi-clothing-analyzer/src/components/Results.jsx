import './Results.css'

const Results = ({ results, originalImage, selectedClothingType, onBack, onCustomZone }) => {
  const clothingAnalysis = results?.clothing_analysis || {}
  const totalDetected = clothingAnalysis.total_detected || 0
  const mainClothing = clothingAnalysis.main_clothing || []

  return (
    <div className="results">
      <button className="back-btn" onClick={onBack}>
        ← Back to Upload
      </button>
      
      <div className="images-comparison">
        <div className="image-card">
          <h3>📷 Original Image</h3>
          <div className="image-container">
            <img src={originalImage} alt="Original" />
          </div>
        </div>
        
        <div className="image-card">
          <h3>✨ Background Removed</h3>
          <div className="image-container">
            {results.clothing_only_image ? (
              <img src={results.clothing_only_image} alt="Clothing only" />
            ) : (
              <p>Failed to generate clothing image</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="stats">
        <div className="stat-item">
          <div className="stat-value">{totalDetected}</div>
          <div className="stat-label">Clothing Types</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">
            {selectedClothingType || 'N/A'}
          </div>
          <div className="stat-label">Selected Item</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{results.dominant_color ? '✓' : '✗'}</div>
          <div className="stat-label">Color Detected</div>
        </div>
      </div>
      
      <div className="analysis-grid">
        <div className="analysis-card">
          <h3>📊 Clothing Analysis</h3>
          <div className="clothing-analysis">
            {clothingAnalysis.clothing_types ? (
              Object.entries(clothingAnalysis.clothing_types).map(([type, details]) => (
                <div 
                  key={type}
                  className={`clothing-item ${type === selectedClothingType ? 'selected' : ''}`}
                >
                  <strong>{type}{type === selectedClothingType ? ' (Selected)' : ''}</strong>: 
                  {details.percentage}% ({details.pixels.toLocaleString()} pixels)
                  {type === selectedClothingType && (
                    <div className="selected-item-info">
                      <span className="info-badge">✓ Selected for analysis</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p>No clothing detected</p>
            )}
          </div>
        </div>
        
        <div className="analysis-card">
          <h3>🎨 Dominant Color</h3>
          <div className="color-analysis">
            {results.dominant_color ? (
              <>
                <p className="color-name">
                  <strong>{results.dominant_color}</strong>
                </p>
                <div 
                  className="color-display" 
                  style={{ backgroundColor: results.dominant_color }}
                ></div>
              </>
            ) : (
              <p>Color not detected</p>
            )}
          </div>
        </div>
      </div>

      <div className="actions">
        <button className="action-btn secondary" onClick={onBack}>
          Upload New Image
        </button>
        <button className="action-btn" onClick={onCustomZone}>
          Custom Zone Selection
        </button>
      </div>
    </div>
  )
}

export default Results
