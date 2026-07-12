import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionHeading from '../components/SectionHeading'

gsap.registerPlugin(ScrollTrigger)

export default function AIEngine() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ai-visual', {
        scale: 0.8,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
          toggleActions: 'play none none none',
        },
      })

      // Pulse the neural network nodes
      gsap.to('.ai-node', {
        scale: 1.3,
        opacity: 0.9,
        duration: 1.5,
        ease: 'sine.inOut',
        stagger: { each: 0.2, repeat: -1, yoyo: true },
        scrollTrigger: {
          trigger: '.ai-neural-network',
          start: 'top 80%',
          toggleActions: 'play pause resume pause',
        },
      })

      gsap.from('.ai-feature-item', {
        x: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.ai-features-list',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="landing-section ai-section" id="ai-engine">
      <div className="ai-bg-gradient" />

      <div className="landing-container">
        <SectionHeading
          badge="AI Engine"
          title="Intelligence that thinks in real-time"
          subtitle="Our proprietary neural engine processes millions of data points per second to optimize every decision."
        />

        <div className="ai-content">
          <div className="ai-visual">
            <div className="ai-neural-network">
              {/* Neural network visualization */}
              <svg viewBox="0 0 400 300" className="ai-network-svg">
                {/* Connection lines */}
                <line x1="80" y1="60" x2="200" y2="40" stroke="url(#aiGrad1)" strokeWidth="1" opacity="0.4" />
                <line x1="80" y1="60" x2="200" y2="120" stroke="url(#aiGrad1)" strokeWidth="1" opacity="0.3" />
                <line x1="80" y1="60" x2="200" y2="200" stroke="url(#aiGrad1)" strokeWidth="1" opacity="0.2" />
                <line x1="80" y1="150" x2="200" y2="40" stroke="url(#aiGrad2)" strokeWidth="1" opacity="0.2" />
                <line x1="80" y1="150" x2="200" y2="120" stroke="url(#aiGrad2)" strokeWidth="1" opacity="0.4" />
                <line x1="80" y1="150" x2="200" y2="200" stroke="url(#aiGrad2)" strokeWidth="1" opacity="0.3" />
                <line x1="80" y1="240" x2="200" y2="120" stroke="url(#aiGrad1)" strokeWidth="1" opacity="0.3" />
                <line x1="80" y1="240" x2="200" y2="200" stroke="url(#aiGrad1)" strokeWidth="1" opacity="0.4" />
                <line x1="80" y1="240" x2="200" y2="260" stroke="url(#aiGrad1)" strokeWidth="1" opacity="0.3" />

                <line x1="200" y1="40" x2="320" y2="100" stroke="url(#aiGrad2)" strokeWidth="1" opacity="0.4" />
                <line x1="200" y1="120" x2="320" y2="100" stroke="url(#aiGrad2)" strokeWidth="1" opacity="0.4" />
                <line x1="200" y1="200" x2="320" y2="100" stroke="url(#aiGrad1)" strokeWidth="1" opacity="0.3" />
                <line x1="200" y1="120" x2="320" y2="200" stroke="url(#aiGrad1)" strokeWidth="1" opacity="0.3" />
                <line x1="200" y1="200" x2="320" y2="200" stroke="url(#aiGrad2)" strokeWidth="1" opacity="0.4" />
                <line x1="200" y1="260" x2="320" y2="200" stroke="url(#aiGrad2)" strokeWidth="1" opacity="0.3" />

                {/* Input layer nodes */}
                <circle className="ai-node" cx="80" cy="60" r="8" fill="#00d4ff" opacity="0.6" />
                <circle className="ai-node" cx="80" cy="150" r="8" fill="#00d4ff" opacity="0.6" />
                <circle className="ai-node" cx="80" cy="240" r="8" fill="#00d4ff" opacity="0.6" />

                {/* Hidden layer nodes */}
                <circle className="ai-node" cx="200" cy="40" r="10" fill="#8b5cf6" opacity="0.6" />
                <circle className="ai-node" cx="200" cy="120" r="10" fill="#8b5cf6" opacity="0.6" />
                <circle className="ai-node" cx="200" cy="200" r="10" fill="#8b5cf6" opacity="0.6" />
                <circle className="ai-node" cx="200" cy="260" r="10" fill="#8b5cf6" opacity="0.6" />

                {/* Output layer nodes */}
                <circle className="ai-node" cx="320" cy="100" r="8" fill="#3b82f6" opacity="0.6" />
                <circle className="ai-node" cx="320" cy="200" r="8" fill="#3b82f6" opacity="0.6" />

                {/* Labels */}
                <text x="30" y="65" fill="#64748b" fontSize="10" fontFamily="Inter">Routes</text>
                <text x="30" y="155" fill="#64748b" fontSize="10" fontFamily="Inter">Traffic</text>
                <text x="25" y="245" fill="#64748b" fontSize="10" fontFamily="Inter">Weather</text>
                <text x="330" y="105" fill="#64748b" fontSize="10" fontFamily="Inter">Optimal Path</text>
                <text x="330" y="205" fill="#64748b" fontSize="10" fontFamily="Inter">ETA Predict</text>

                <defs>
                  <linearGradient id="aiGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="aiGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="ai-features-list">
            <div className="ai-feature-item">
              <div className="ai-feature-dot" />
              <div>
                <h4>Real-Time Processing</h4>
                <p>Processes 2M+ data points per second across your entire fleet network.</p>
              </div>
            </div>
            <div className="ai-feature-item">
              <div className="ai-feature-dot" />
              <div>
                <h4>Adaptive Learning</h4>
                <p>Continuously improves predictions based on historical patterns and live data.</p>
              </div>
            </div>
            <div className="ai-feature-item">
              <div className="ai-feature-dot" />
              <div>
                <h4>Multi-Variable Optimization</h4>
                <p>Balances fuel costs, delivery windows, driver hours, and vehicle wear simultaneously.</p>
              </div>
            </div>
            <div className="ai-feature-item">
              <div className="ai-feature-dot" />
              <div>
                <h4>Anomaly Detection</h4>
                <p>Identifies unusual patterns in driver behavior, fuel consumption, and route deviations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
