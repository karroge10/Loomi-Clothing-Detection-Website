import './LoadingSpinner.css'

const LoadingSpinner = () => {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Analyzing your image...</p>
    </div>
  )
}

export default LoadingSpinner
