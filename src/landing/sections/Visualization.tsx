import { useEffect, useRef, Suspense, lazy } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionHeading from '../components/SectionHeading'

gsap.registerPlugin(ScrollTrigger)

const GlobeNetwork = lazy(() => import('../three/GlobeNetwork'))

export default function Visualization() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.viz-globe-wrapper', {
        scale: 0.6,
        opacity: 0,
        duration: 1.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          toggleActions: 'play none none none',
        },
      })

      gsap.from('.viz-info-card', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.viz-info-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="landing-section viz-section" id="visualization">
      <div className="viz-bg-glow" />

      <div className="landing-container">
        <SectionHeading
          badge="Global Network"
          title="Connected across every continent"
          subtitle="Real-time visibility into your entire transportation network, powered by AI-driven route optimization."
        />

        <div className="viz-globe-wrapper">
          <Suspense fallback={
            <div className="viz-globe-fallback">
              <div className="viz-globe-placeholder" />
            </div>
          }>
            <GlobeNetwork />
          </Suspense>
        </div>

        <div className="viz-info-grid">
          <div className="viz-info-card">
            <div className="viz-info-number">143</div>
            <div className="viz-info-label">Countries Connected</div>
          </div>
          <div className="viz-info-card">
            <div className="viz-info-number">50M+</div>
            <div className="viz-info-label">Shipments Tracked</div>
          </div>
          <div className="viz-info-card">
            <div className="viz-info-number">99.99%</div>
            <div className="viz-info-label">Data Accuracy</div>
          </div>
          <div className="viz-info-card">
            <div className="viz-info-number">&lt;10ms</div>
            <div className="viz-info-label">Global Latency</div>
          </div>
        </div>
      </div>
    </section>
  )
}
