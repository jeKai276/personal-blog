interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'brand'
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-gray-100 text-gray-700',
  brand: 'bg-blue-100 text-blue-600',
}

export default function Badge({ children, className = '', variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  )
}
