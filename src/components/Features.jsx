import { Search, Palette, Scissors, Zap, Smartphone, RefreshCw } from 'lucide-react'
import './Features.css'

const Features = () => {
  const features = [
    {
      icon: <Search size={32} />,
      title: 'Smart Detection',
      description: 'AI-powered clothing detection with high accuracy'
    },
    {
      icon: <Palette size={32} />,
      title: 'Color Analysis',
      description: 'Extract dominant colors automatically'
    },
    {
      icon: <Scissors size={32} />,
      title: 'Background Removal',
      description: 'Clean clothing extraction for any use'
    },
    {
      icon: <Zap size={32} />,
      title: 'Fast Processing',
      description: 'Quick analysis with smart optimization'
    },
    {
      icon: <Smartphone size={32} />,
      title: 'Mobile Ready',
      description: 'Works perfectly on all devices'
    },
    {
      icon: <RefreshCw size={32} />,
      title: 'Smart Fallback',
      description: 'Reliable processing with automatic fallback'
    }
  ]

  return (
    <section id="features" className="features">
      <div className="features-container">
        <div className="features-header">
          <h2>Core Features</h2>
          <p>Start analyzing your clothing with AI-powered tools from day one</p>
        </div>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
