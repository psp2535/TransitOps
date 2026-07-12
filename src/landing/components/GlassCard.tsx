import React, { useRef, useCallback } from 'react'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  tilt?: boolean
  glow?: boolean
}

export default function GlassCard({
  children,
  className = '',
  tilt = true,
  glow = false,
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tilt || !cardRef.current) return

      const rect = cardRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      const rotateX = (y - 0.5) * -10
      const rotateY = (x - 0.5) * 10

      cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`

      // Move glow to mouse position
      const glowEl = cardRef.current.querySelector('.glass-card-glow') as HTMLElement
      if (glowEl) {
        glowEl.style.left = `${x * 100}%`
        glowEl.style.top = `${y * 100}%`
        glowEl.style.opacity = '1'
      }
    },
    [tilt]
  )

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'

    const glowEl = cardRef.current.querySelector('.glass-card-glow') as HTMLElement
    if (glowEl) {
      glowEl.style.opacity = '0'
    }
  }, [])

  return (
    <div
      ref={cardRef}
      className={`glass-card-landing ${glow ? 'glass-card-glow-border' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {glow && <div className="glass-card-glow" />}
      <div className="glass-card-content">{children}</div>
    </div>
  )
}
