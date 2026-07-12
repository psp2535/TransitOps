import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface AnimatedCounterProps {
  target: number
  suffix?: string
  prefix?: string
  duration?: number
  className?: string
}

export default function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  duration = 2,
  className = '',
}: AnimatedCounterProps) {
  const [value, setValue] = useState(0)
  const counterRef = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!counterRef.current) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: counterRef.current,
        start: 'top 85%',
        onEnter: () => {
          if (hasAnimated.current) return
          hasAnimated.current = true

          const obj = { val: 0 }
          gsap.to(obj, {
            val: target,
            duration,
            ease: 'power2.out',
            onUpdate: () => {
              setValue(
                target % 1 !== 0
                  ? parseFloat(obj.val.toFixed(1))
                  : Math.round(obj.val)
              )
            },
          })
        },
      })
    }, counterRef)

    return () => ctx.revert()
  }, [target, duration])

  return (
    <span ref={counterRef} className={`animated-counter ${className}`}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  )
}
