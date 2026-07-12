import React, { useRef, useCallback } from 'react'

interface MagneticButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
}

export default function MagneticButton({
  children,
  className = '',
  onClick,
  variant = 'primary',
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = buttonRef.current
    const txt = textRef.current
    if (!btn || !txt) return

    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`
    txt.style.transform = `translate(${x * 0.08}px, ${y * 0.08}px)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    const btn = buttonRef.current
    const txt = textRef.current
    if (!btn || !txt) return

    btn.style.transform = 'translate(0, 0)'
    txt.style.transform = 'translate(0, 0)'
  }, [])

  const baseClasses = 'magnetic-btn'
  const variantClasses = {
    primary: 'magnetic-btn-primary',
    secondary: 'magnetic-btn-secondary',
    ghost: 'magnetic-btn-ghost',
  }

  return (
    <button
      ref={buttonRef}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <span ref={textRef} className="magnetic-btn-text">
        {children}
      </span>
      <span className="magnetic-btn-glow" />
    </button>
  )
}
