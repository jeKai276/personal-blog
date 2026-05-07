import Link from 'next/link'

interface SectionHeadingProps {
  label?: string
  title: string
  href?: string
  hrefLabel?: string
}

export default function SectionHeading({ label, title, href, hrefLabel = 'Xem tất cả →' }: SectionHeadingProps) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <div>
        {label && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-blue-500">{label}</p>
        )}
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="text-sm font-medium text-blue-500 hover:text-blue-600">
          {hrefLabel}
        </Link>
      )}
    </div>
  )
}
