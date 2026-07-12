import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface TextRevealProps {
  children: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  splitBy?: 'char' | 'word'
  stagger?: number
  delay?: number
  scrollTriggered?: boolean
  startTrigger?: string
}

export default function TextReveal({
  children,
  className = '',
  as: Tag = 'h2',
  splitBy = 'char',
  stagger = 0.03,
  delay = 0,
  scrollTriggered = true,
  startTrigger = 'top 80%',
}: TextRevealProps) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const chars = containerRef.current.querySelectorAll('.text-reveal-unit')

    const animConfig: gsap.TweenVars = {
      y: 60,
      opacity: 0,
      duration: 0.8,
      ease: 'power4.out',
      stagger,
      delay,
    }

    if (scrollTriggered) {
      animConfig.scrollTrigger = {
        trigger: containerRef.current,
        start: startTrigger,
        toggleActions: 'play none none none',
      }
    }

    const ctx = gsap.context(() => {
      gsap.from(chars, animConfig)
    }, containerRef)

    return () => ctx.revert()
  }, [children, stagger, delay, scrollTriggered, startTrigger])

  const units = splitBy === 'char' ? children.split('') : children.split(' ')

  return (
    <Tag ref={containerRef as any} className={`text-reveal ${className}`}>
      {units.map((unit, i) => (
        <span
          key={i}
          className="text-reveal-unit"
          style={{ display: 'inline-block' }}
        >
          {splitBy === 'char'
            ? unit === ' '
              ? '\u00A0'
              : unit
            : (
              <>
                {unit}
                {i < units.length - 1 && '\u00A0'}
              </>
            )}
        </span>
      ))}
    </Tag>
  )
}
