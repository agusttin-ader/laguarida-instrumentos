'use client'

/**
 * Hijos con clase `motion-stagger-item` y style `--stagger-i` para delay escalonado.
 */
export default function StaggerGroup({
  children,
  className = '',
  staggerMs = 36,
  as = 'div',
  ...rest
}) {
  const Tag = as || 'div'
  return (
    <Tag
      className={`motion-stagger ${className}`.trim()}
      style={{ '--motion-stagger-step': `${staggerMs}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
