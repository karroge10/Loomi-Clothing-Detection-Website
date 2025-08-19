import './About.css'

const About = () => {
  return (
    <section id="about" className="about">
      <div className="about-container">
        <div className="about-header">
          <h2>About This Demo</h2>
          <p>This is a demonstration of the AI-powered clothing analysis API used in the Loomi app</p>
        </div>
        
        <div className="about-content">
          <div className="about-story">
            <h3>What is Loomi?</h3>
            <p>
              Loomi is a digital closet app that helps you organize your wardrobe. Upload photos of your clothes, 
              add brand and category details, and create amazing outfits with drag-and-drop functionality.
            </p>
          </div>
          
          <div className="about-mission">
            <h3>This Demo</h3>
            <p>
              This website showcases the clothing analysis API that powers Loomi. It demonstrates how our AI 
              can detect clothing items, remove backgrounds, and analyze colors - the same technology used in the app.
            </p>
          </div>
        </div>
        
        <div className="about-cta">
          <button 
            className="cta-button secondary"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Try Demo
          </button>
          <button 
            className="cta-button primary"
            onClick={() => window.open('https://loomicloset.com', '_blank')}
          >
            Get Loomi App
          </button>
        </div>
      </div>
    </section>
  )
}

export default About
