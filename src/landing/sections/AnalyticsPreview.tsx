import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionHeading from '../components/SectionHeading'

gsap.registerPlugin(ScrollTrigger)

export default function AnalyticsPreview() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.analytics-dashboard', {
        y: 100,
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          toggleActions: 'play none none none',
        },
      })

      // Animate chart lines
      gsap.from('.analytics-chart-line', {
        scaleX: 0,
        duration: 1.5,
        ease: 'power2.out',
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.analytics-dashboard',
          start: 'top 70%',
          toggleActions: 'play none none none',
        },
      })

      // Animate metric cards
      gsap.from('.analytics-metric', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.analytics-metrics-row',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="landing-section analytics-section" id="analytics">
      <div className="landing-container">
        <SectionHeading
          badge="Analytics"
          title="Insights that drive decisions"
          subtitle="A command center that transforms raw fleet data into actionable intelligence."
        />

        <div className="analytics-dashboard">
          {/* Mock dashboard UI */}
          <div className="analytics-topbar">
            <div className="analytics-topbar-dots">
              <span /><span /><span />
            </div>
            <div className="analytics-topbar-title">TransitOps Analytics Dashboard</div>
            <div className="analytics-topbar-actions">
              <span className="analytics-live-dot" />
              Live
            </div>
          </div>

          <div className="analytics-body">
            <div className="analytics-metrics-row">
              <div className="analytics-metric">
                <div className="analytics-metric-label">Active Vehicles</div>
                <div className="analytics-metric-value">847</div>
                <div className="analytics-metric-change positive">↑ 12%</div>
              </div>
              <div className="analytics-metric">
                <div className="analytics-metric-label">On-Time Delivery</div>
                <div className="analytics-metric-value">98.4%</div>
                <div className="analytics-metric-change positive">↑ 3.2%</div>
              </div>
              <div className="analytics-metric">
                <div className="analytics-metric-label">Fuel Efficiency</div>
                <div className="analytics-metric-value">8.2 km/L</div>
                <div className="analytics-metric-change positive">↑ 15%</div>
              </div>
              <div className="analytics-metric">
                <div className="analytics-metric-label">Cost per Mile</div>
                <div className="analytics-metric-value">$1.23</div>
                <div className="analytics-metric-change negative">↓ 22%</div>
              </div>
            </div>

            <div className="analytics-chart-area">
              <div className="analytics-chart-header">
                <span>Fleet Performance — Last 30 Days</span>
                <div className="analytics-chart-legend">
                  <span className="legend-item"><span className="legend-dot cyan" />Efficiency</span>
                  <span className="legend-item"><span className="legend-dot purple" />Utilization</span>
                </div>
              </div>
              <div className="analytics-chart-container">
                <svg className="analytics-chart-svg" viewBox="0 0 600 200" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.05)" />
                  <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.05)" />
                  <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.05)" />

                  {/* Efficiency line */}
                  <path
                    className="analytics-chart-line"
                    d="M0,160 C30,155 60,140 100,130 C140,120 180,100 220,85 C260,70 300,60 340,55 C380,50 420,45 460,35 C500,30 540,25 580,20 L600,18"
                    fill="none"
                    stroke="#00d4ff"
                    strokeWidth="2.5"
                    style={{ transformOrigin: 'left' }}
                  />
                  {/* Gradient fill under line */}
                  <path
                    d="M0,160 C30,155 60,140 100,130 C140,120 180,100 220,85 C260,70 300,60 340,55 C380,50 420,45 460,35 C500,30 540,25 580,20 L600,18 L600,200 L0,200 Z"
                    fill="url(#cyanGradient)"
                    opacity="0.15"
                  />

                  {/* Utilization line */}
                  <path
                    className="analytics-chart-line"
                    d="M0,140 C40,135 80,125 120,115 C160,105 200,95 240,90 C280,85 320,80 360,70 C400,65 440,55 480,50 C520,45 560,40 600,38"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2.5"
                    style={{ transformOrigin: 'left' }}
                  />

                  <defs>
                    <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d4ff" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
