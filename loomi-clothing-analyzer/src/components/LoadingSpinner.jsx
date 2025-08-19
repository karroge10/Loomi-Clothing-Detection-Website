import './LoadingSpinner.css'

const LoadingSpinner = ({ status = 'Analyzing your image...', showProgress = false }) => {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p className="loading-text">{status}</p>
      {showProgress && (
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p className="progress-text">Processing...</p>
        </div>
      )}
    </div>
  )
}

export default LoadingSpinner
