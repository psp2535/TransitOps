import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import MagneticButton from '../components/MagneticButton'

gsap.registerPlugin(ScrollTrigger)

interface CTAProps {
  onEnterApp: () => void
}

export default function CallToAction({ onEnterApp }: CTAProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cta-content > *', {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 65%',
          toggleActions: 'play none none none',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="landing-section cta-section" id="cta">
      <div className="cta-bg-glow cta-bg-glow-1" />
      <div className="cta-bg-glow cta-bg-glow-2" />

      <div className="landing-container">
        <div className="cta-content">
          <div className="cta-badge">
            <span className="cta-badge-dot" />
            Start Today — No Credit Card Required
          </div>

          <h2 className="cta-title">
            Ready to transform
            <br />
            <span className="cta-title-gradient">your fleet?</span>
          </h2>

          <p className="cta-subtitle">
            Join 500+ companies already using TransitOps to
            <br />
            revolutionize their transportation operations.
          </p>

          <div className="cta-buttons">
            <MagneticButton variant="primary" className="cta-main-btn" onClick={onEnterApp}>
              <span>Get Started Free</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </MagneticButton>
            <MagneticButton variant="secondary" onClick={onEnterApp}>
              Schedule a Demo
            </MagneticButton>
          </div>

          <div className="cta-trust">
            <div className="cta-trust-logos">
              <span>Trusted by teams at</span>
              <div className="cta-trust-names">
                <span>FedEx</span>
                <span>•</span>
                <span>DHL</span>
                <span>•</span>
                <span>Maersk</span>
                <span>•</span>
                <span>XPO</span>
                <span>•</span>
                <span>Ryder</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
