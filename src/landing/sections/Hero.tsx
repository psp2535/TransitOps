import { useEffect, useRef, Suspense, lazy } from 'react'
import { gsap } from 'gsap'
import MagneticButton from '../components/MagneticButton'

const HeroScene = lazy(() => import('../three/HeroScene'))

interface HeroProps {
  onEnterApp: () => void
}

export default function Hero({ onEnterApp }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

      tl.from('.hero-badge-anim', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
      })
      .from('.hero-title-line', {
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
      }, '-=0.4')
      .from('.hero-subtitle-anim', {
        y: 30,
        opacity: 0,
        duration: 0.8,
      }, '-=0.5')
      .from('.hero-cta-anim', {
        y: 30,
        opacity: 0,
        duration: 0.8,
      }, '-=0.4')
      .from('.hero-stat', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
      }, '-=0.4')
      .from('.hero-scroll-indicator', {
        opacity: 0,
        duration: 1,
      }, '-=0.2')
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="hero-section" id="hero">
      {/* 3D Background */}
      <div className="hero-3d-container">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      {/* Gradient overlays */}
      <div className="hero-gradient-top" />
      <div className="hero-gradient-bottom" />
      <div className="hero-aurora" />

      {/* Content */}
      <div className="hero-content">
        <div className="hero-badge-anim">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span>AI-Powered Fleet Intelligence</span>
          </div>
        </div>

        <h1 className="hero-title">
          <span className="hero-title-line">
            <span className="hero-title-gradient">The Future</span> of
          </span>
          <span className="hero-title-line">
            Transportation is <span className="hero-title-gradient">Here</span>
          </span>
        </h1>

        <p className="hero-subtitle-anim hero-subtitle">
          Orchestrate your entire fleet with real-time AI optimization.
          <br />
          Reduce costs by 40%, eliminate downtime, and deliver faster than ever.
        </p>

        <div className="hero-cta-anim hero-cta-group">
          <MagneticButton variant="primary" className="hero-cta-btn" onClick={onEnterApp}>
            <span>Start Free Trial</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </MagneticButton>
          <MagneticButton variant="secondary" className="hero-cta-btn" onClick={onEnterApp}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
            <span>Watch Demo</span>
          </MagneticButton>
        </div>

        <div className="hero-stats-row">
          <div className="hero-stat">
            <div className="hero-stat-value">99.8%</div>
            <div className="hero-stat-label">Uptime SLA</div>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <div className="hero-stat-value">40%</div>
            <div className="hero-stat-label">Cost Reduction</div>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <div className="hero-stat-value">2.4M+</div>
            <div className="hero-stat-label">Routes Optimized</div>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <div className="hero-stat-value">&lt;50ms</div>
            <div className="hero-stat-label">AI Response</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-indicator">
        <div className="hero-scroll-line" />
        <span className="hero-scroll-text">Scroll to explore</span>
      </div>
    </section>
  )
}
