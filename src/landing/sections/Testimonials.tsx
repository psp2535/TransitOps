import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import SectionHeading from '../components/SectionHeading'

gsap.registerPlugin(ScrollTrigger)

const testimonials = [
  {
    quote: "TransitOps transformed our entire logistics operation. We reduced fuel costs by 38% in the first quarter alone. The AI routing is genuinely game-changing.",
    name: 'Sarah Chen',
    role: 'VP of Operations',
    company: 'Pacific Freight Co.',
    avatar: 'SC',
  },
  {
    quote: "The predictive maintenance feature alone paid for itself within two months. Zero unplanned breakdowns since implementation. Our drivers love it.",
    name: 'Marcus Williams',
    role: 'Fleet Director',
    company: 'Metro Express',
    avatar: 'MW',
  },
  {
    quote: "We went from managing 200 vehicles on spreadsheets to 1,500 on TransitOps with a smaller team. The automation is extraordinary.",
    name: 'Priya Sharma',
    role: 'CEO',
    company: 'SwiftHaul Logistics',
    avatar: 'PS',
  },
  {
    quote: "The real-time analytics dashboard gives us visibility we never had before. Decision-making went from gut feeling to data-driven overnight.",
    name: 'James O\'Brien',
    role: 'Operations Manager',
    company: 'Continental Transport',
    avatar: 'JO',
  },
]

export default function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.testimonial-card', {
        y: 60,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.testimonials-grid',
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="landing-section testimonials-section" id="testimonials">
      <div className="landing-container">
        <SectionHeading
          badge="Testimonials"
          title="Trusted by industry leaders"
          subtitle="See what fleet operators around the world are saying about TransitOps."
        />

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-quote-mark">"</div>
              <p className="testimonial-text">{t.quote}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div className="testimonial-info">
                  <div className="testimonial-name">{t.name}</div>
                  <div className="testimonial-role">{t.role}, {t.company}</div>
                </div>
              </div>
              <div className="testimonial-stars">
                {'★★★★★'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
