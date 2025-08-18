import './Header.css'

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <span>📱</span>
        <span>Loomi Analyzer</span>
      </div>
      <nav className="navigation">
        <a href="#" className="nav-link active">Analyzer</a>
        <a href="#" className="nav-link">Features</a>
        <a href="#" className="nav-link">About</a>
        <a href="#" className="nav-cta">Get Loomi App</a>
      </nav>
    </header>
  )
}

export default Header
