import { useState, useEffect, useRef } from 'react'
import { Shirt } from 'lucide-react'
import './Header.css'

const Header = ({ onScrollToSection, apiStatus }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef(null)
  const mobileToggleRef = useRef(null)

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && 
          mobileMenuRef.current && 
          !mobileMenuRef.current.contains(event.target) &&
          mobileToggleRef.current &&
          !mobileToggleRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      // Prevent background scrolling when mobile menu is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      // Restore scrolling when mobile menu is closed
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const getStatusIndicator = () => {
    switch (apiStatus) {
      case 'live':
        return (
          <div className="status-indicator online" title="API Online">
            <div className="status-dot"></div>
            <span className="status-text">LIVE</span>
          </div>
        )
      case 'in_use':
        return (
          <div className="status-indicator in-use" title="Model In Use">
            <div className="status-dot"></div>
            <span className="status-text">IN USE</span>
          </div>
        )
      case 'offline':
        return (
          <div className="status-indicator offline" title="API Offline">
            <div className="status-dot"></div>
            <span className="status-text">OFFLINE</span>
          </div>
        )
      case 'checking':
        return (
          <div className="status-indicator checking" title="Checking API Status">
            <div className="status-dot"></div>
            <span className="status-text">CHECKING</span>
          </div>
        )
      default:
        return (
          <div className="status-indicator checking" title="Checking API Status">
            <div className="status-dot"></div>
            <span className="status-text">CHECKING</span>
          </div>
        )
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleNavClick = (section) => {
    onScrollToSection(section)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="header">
      <div className="header-container">
        {/* Left side - Logo */}
        <div className="logo">
          <div className="logo-icon">
            <Shirt size={24} strokeWidth={2} />
          </div>
          <span className="logo-text">Loomi</span>
        </div>
        
        {/* Center - Navigation */}
        <nav className="nav-desktop">
          <button onClick={() => handleNavClick('analyzer')}>Preview</button>
          <button onClick={() => handleNavClick('features')}>Features</button>
          <button onClick={() => handleNavClick('about')}>About</button>
        </nav>
        
        {/* Right side - Status and CTA */}
        <div className="header-right">
          {getStatusIndicator()}
          <button 
            className="cta-button primary" 
            onClick={() => window.open('https://loomicloset.com', '_blank')}
          >
            Join Waitlist
          </button>
        </div>

        {/* Mobile hamburger menu */}
        <button 
          ref={mobileToggleRef}
          className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      <nav ref={mobileMenuRef} className={`nav-mobile ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <button onClick={() => handleNavClick('analyzer')}>Preview</button>
        <button onClick={() => handleNavClick('features')}>Features</button>
        <button onClick={() => handleNavClick('about')}>About</button>
      </nav>
    </header>
  )
}

export default Header
