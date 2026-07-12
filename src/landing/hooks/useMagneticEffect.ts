import { useCallback, useRef } from 'react'

interface MagneticOptions {
  strength?: number
  radius?: number
}

export function useMagneticEffect({ strength = 0.3, radius = 200 }: MagneticOptions = {}) {
  const elementRef = useRef<HTMLElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const el = elementRef.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const distX = e.clientX - centerX
      const distY = e.clientY - centerY
      const distance = Math.sqrt(distX * distX + distY * distY)

      if (distance < radius) {
        const pull = (1 - distance / radius) * strength
        el.style.transform = `translate(${distX * pull}px, ${distY * pull}px)`
        el.style.transition = 'transform 0.2s ease-out'
      }
    },
    [strength, radius]
  )

  const handleMouseLeave = useCallback(() => {
    const el = elementRef.current
    if (!el) return
    el.style.transform = 'translate(0, 0)'
    el.style.transition = 'transform 0.5s ease-out'
  }, [])

  return { elementRef, handleMouseMove, handleMouseLeave }
}
