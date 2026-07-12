import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionHeading from '../components/SectionHeading'
import GlassCard from '../components/GlassCard'

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7" />
        <path d="M15 4l5.447 2.724A1 1 0 0 1 21 7.618v10.764a1 1 0 0 1-1.447.894L15 17" />
        <path d="M9 7l6-3v16l-6-3V7z" />
      </svg>
    ),
    title: 'Smart Route Engine',
    desc: 'AI-optimized routing that factors traffic, weather, vehicle capacity, and delivery windows in real-time.',
    accent: '#00d4ff',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Live Fleet Tracking',
    desc: 'Sub-second GPS tracking with geofencing, ETA predictions, and automated customer notifications.',
    accent: '#8b5cf6',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: 'Predictive Maintenance',
    desc: 'ML models predict component failures before they happen, reducing breakdown incidents by 78%.',
    accent: '#3b82f6',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" />
        <line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
    title: 'Advanced Analytics',
    desc: 'Deep operational insights with custom dashboards, trend analysis, and automated reporting.',
    accent: '#22d3ee',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: 'Automated Dispatch',
    desc: 'Intelligent job assignment that matches the right driver, vehicle, and route for every shipment.',
    accent: '#6366f1',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Enterprise Security',
    desc: 'SOC2 Type II certified with role-based access, audit logging, and end-to-end encryption.',
    accent: '#f59e0b',
  },
]

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feature-card-wrapper', {
        y: 80,
        opacity: 0,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.features-grid',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="landing-section features-section" id="features">
      <div className="landing-container">
        <SectionHeading
          badge="Features"
          title="Everything your fleet needs"
          subtitle="A complete suite of AI-powered tools designed to transform every aspect of your transportation operations."
        />

        <div className="features-grid">
          {features.map((feature, i) => (
            <div key={i} className="feature-card-wrapper">
              <GlassCard tilt glow>
                <div className="feature-card-icon" style={{ color: feature.accent }}>
                  {feature.icon}
                </div>
                <h3 className="feature-card-title">{feature.title}</h3>
                <p className="feature-card-desc">{feature.desc}</p>
                <div className="feature-card-accent" style={{ background: `linear-gradient(90deg, ${feature.accent}, transparent)` }} />
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
