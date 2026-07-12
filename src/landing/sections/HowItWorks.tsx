import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionHeading from '../components/SectionHeading'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  {
    number: '01',
    title: 'Connect Your Fleet',
    desc: 'Integrate vehicles, drivers, and assets in minutes with our zero-friction onboarding. Real-time telemetry begins immediately.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'AI Learns Your Operations',
    desc: 'Our neural engine analyzes route patterns, fuel consumption, driver behavior, and maintenance cycles to build your optimization profile.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" />
        <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" />
        <path d="M16 16h2a2 2 0 0 1 0 4h-2" /><path d="M8 16H6a2 2 0 0 0 0 4h2" />
        <path d="M16 8h3" /><path d="M8 8H5" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Optimize Everything',
    desc: 'Real-time route optimization, predictive maintenance alerts, automated dispatch, and dynamic load balancing — all powered by AI.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Scale Without Limits',
    desc: 'From 10 vehicles to 10,000. Our infrastructure scales elastically with your fleet, maintaining sub-50ms response times globally.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
        <polyline points="7.5 19.79 7.5 14.6 3 12" />
        <polyline points="21 12 16.5 14.6 16.5 19.79" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate progress line
      gsap.fromTo(
        '.hiw-progress-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 40%',
            end: 'bottom 60%',
            scrub: 1,
          },
        }
      )

      // Animate each step
      steps.forEach((_, i) => {
        gsap.from(`.hiw-step-${i}`, {
          x: i % 2 === 0 ? -60 : 60,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: `.hiw-step-${i}`,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="landing-section hiw-section" id="how-it-works">
      <div className="landing-container">
        <SectionHeading
          badge="How It Works"
          title="From chaos to clarity in four steps"
          subtitle="A seamless pipeline from fleet connection to AI-powered optimization."
        />

        <div className="hiw-timeline">
          <div className="hiw-progress-track">
            <div className="hiw-progress-fill" />
          </div>

          {steps.map((step, i) => (
            <div key={i} className={`hiw-step hiw-step-${i} ${i % 2 === 0 ? 'hiw-step-left' : 'hiw-step-right'}`}>
              <div className="hiw-step-dot">
                <span className="hiw-step-number">{step.number}</span>
              </div>
              <div className="hiw-step-card">
                <div className="hiw-step-icon">{step.icon}</div>
                <h3 className="hiw-step-title">{step.title}</h3>
                <p className="hiw-step-desc">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
