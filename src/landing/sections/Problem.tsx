import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionHeading from '../components/SectionHeading'
import AnimatedCounter from '../components/AnimatedCounter'
import GlassCard from '../components/GlassCard'

gsap.registerPlugin(ScrollTrigger)

const problems = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
      </svg>
    ),
    stat: 37,
    suffix: '%',
    label: 'Fleet Downtime',
    desc: 'Average commercial fleet downtime due to unoptimized scheduling and reactive maintenance cycles.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    stat: 2.1,
    suffix: 'B',
    prefix: '$',
    label: 'Wasted Annually',
    desc: 'Global logistics industry fuel waste from inefficient routing and manual dispatch decisions.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    stat: 68,
    suffix: '%',
    label: 'Route Inefficiency',
    desc: 'Of fleet operators still rely on manual routing, missing optimization opportunities worth millions.',
  },
]

export default function Problem() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.problem-card', {
        y: 80,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.2,
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
    <section ref={sectionRef} className="landing-section problem-section" id="problem">
      <div className="landing-container">
        <SectionHeading
          badge="The Problem"
          title="Legacy logistics is broken"
          subtitle="The transportation industry loses billions every year to outdated systems, manual processes, and fragmented data."
        />

        <div className="problem-grid">
          {problems.map((p, i) => (
            <div key={i} className="problem-card">
              <GlassCard tilt glow>
                <div className="problem-card-icon">{p.icon}</div>
                <div className="problem-card-stat">
                  <AnimatedCounter
                    target={p.stat}
                    suffix={p.suffix}
                    prefix={p.prefix}
                    className="problem-stat-number"
                  />
                </div>
                <h3 className="problem-card-label">{p.label}</h3>
                <p className="problem-card-desc">{p.desc}</p>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
