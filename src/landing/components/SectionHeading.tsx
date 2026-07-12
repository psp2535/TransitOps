import React from 'react'
import TextReveal from './TextReveal'

interface SectionHeadingProps {
  badge?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  light?: boolean
}

export default function SectionHeading({
  badge,
  title,
  subtitle,
  align = 'center',
  light = true,
}: SectionHeadingProps) {
  return (
    <div className={`section-heading ${align === 'center' ? 'section-heading-center' : ''}`}>
      {badge && (
        <div className="section-badge">
          <span className="section-badge-dot" />
          {badge}
        </div>
      )}
      <TextReveal
        as="h2"
        className={`section-title ${light ? 'section-title-light' : ''}`}
        splitBy="word"
        stagger={0.08}
      >
        {title}
      </TextReveal>
      {subtitle && (
        <p className={`section-subtitle ${light ? 'section-subtitle-light' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
