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
        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
          !selected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
        }`}
      >
        Tất cả
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => handleSelect(tag)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            selected === tag ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
