'use client'
import { useRouter } from 'next/navigation'

interface TagFilterProps {
  tags: string[]
  selected: string | null
}

export default function TagFilter({ tags, selected }: TagFilterProps) {
  const router = useRouter()

  function handleSelect(tag: string | null) {
    router.push(tag ? `/blog?tag=${encodeURIComponent(tag)}` : '/blog')
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => handleSelect(null)}
        className="font-mono text-[10px] tracking-[0.14em] uppercase px-3 py-1.5 rounded-full transition-colors"
        style={
          !selected
            ? { background: 'var(--ink)', color: 'var(--paper)' }
            : { background: 'var(--accent-soft)', color: 'var(--accent-strong)' }
        }
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleSelect(tag)}
          className="font-mono text-[10px] tracking-[0.14em] uppercase px-3 py-1.5 rounded-full transition-colors"
          style={
            selected === tag
              ? { background: 'var(--ink)', color: 'var(--paper)' }
              : { background: 'var(--accent-soft)', color: 'var(--accent-strong)' }
          }
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
