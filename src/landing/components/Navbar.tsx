import React, { useState, useEffect } from 'react'
import MagneticButton from '../components/MagneticButton'

interface NavbarProps {
  onEnterApp: () => void
}

export default function Navbar({ onEnterApp }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`landing-nav ${scrolled ? 'landing-nav-scrolled' : ''}`}>
      <div className="landing-nav-inner">
        <div className="landing-nav-brand">
          <div className="landing-nav-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="landing-nav-name">TransitOps</span>
        </div>

        <div className="landing-nav-links">
          <a href="#features" className="landing-nav-link">Features</a>
          <a href="#how-it-works" className="landing-nav-link">How it Works</a>
          <a href="#analytics" className="landing-nav-link">Analytics</a>
          <a href="#testimonials" className="landing-nav-link">Testimonials</a>
        </div>

        <div className="landing-nav-actions">
          <MagneticButton variant="ghost" onClick={onEnterApp}>
            Sign In
          </MagneticButton>
          <MagneticButton variant="primary" onClick={onEnterApp}>
            Get Started
          </MagneticButton>
        </div>
      </div>
    </nav>
  )
}
