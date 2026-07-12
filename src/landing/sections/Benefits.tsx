import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionHeading from '../components/SectionHeading'

gsap.registerPlugin(ScrollTrigger)

const benefits = [
  { value: '40%', label: 'Lower fuel costs', desc: 'AI-optimized routes drastically reduce fuel consumption and emissions.' },
  { value: '78%', label: 'Fewer breakdowns', desc: 'Predictive maintenance catches failures before they impact operations.' },
  { value: '3x', label: 'Faster dispatch', desc: 'Automated AI dispatch replaces hours of manual scheduling.' },
  { value: '60%', label: 'Less idle time', desc: 'Dynamic load balancing ensures every vehicle is utilized optimally.' },
]

export default function Benefits() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      benefits.forEach((_, i) => {
        gsap.from(`.benefit-item-${i}`, {
          x: -80,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: `.benefit-item-${i}`,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        })
      })

      gsap.from('.benefits-visual', {
        x: 80,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.benefits-content',
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="landing-section benefits-section" id="benefits">
      <div className="landing-container">
        <SectionHeading
          badge="Benefits"
          title="Impact that speaks for itself"
          subtitle="Measurable results from day one. Our customers see ROI within the first month."
        />

        <div className="benefits-content">
          <div className="benefits-list">
            {benefits.map((b, i) => (
              <div key={i} className={`benefit-item benefit-item-${i}`}>
                <div className="benefit-value">{b.value}</div>
                <div className="benefit-info">
                  <h3 className="benefit-label">{b.label}</h3>
                  <p className="benefit-desc">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="benefits-visual">
            <div className="benefits-visual-card">
              <div className="benefits-chart">
                <div className="benefits-chart-bar" style={{ height: '40%' }}>
                  <span>Before</span>
                </div>
                <div className="benefits-chart-bar benefits-chart-bar-after" style={{ height: '85%' }}>
                  <span>After</span>
                </div>
              </div>
              <div className="benefits-chart-label">Fleet Efficiency Score</div>
              <div className="benefits-visual-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                <span>+112% improvement</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
