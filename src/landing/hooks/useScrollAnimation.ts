import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface ScrollAnimationOptions {
  trigger?: string
  start?: string
  end?: string
  scrub?: boolean | number
  pin?: boolean
  markers?: boolean
  once?: boolean
}

export function useScrollAnimation(
  animationFn: (ctx: gsap.Context) => void,
  deps: any[] = []
) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      animationFn(ctx as unknown as gsap.Context)
    }, containerRef)

    return () => ctx.revert()
  }, deps)

  return containerRef
}

export function useRevealAnimation(
  selector: string,
  options: ScrollAnimationOptions = {}
) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(selector, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: options.trigger || containerRef.current,
          start: options.start || 'top 80%',
          end: options.end || 'bottom 20%',
          toggleActions: options.once ? 'play none none none' : 'play none none reverse',
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return containerRef
}
