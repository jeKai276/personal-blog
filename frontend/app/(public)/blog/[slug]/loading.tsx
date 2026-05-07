export default function BlogDetailLoading() {
  return (
    <article className="space-y-6">
      <header className="space-y-2 border-b pb-6">
        <div className="h-9 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
      </header>
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`h-4 animate-pulse rounded bg-gray-100 ${i === 5 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    </article>
  )
}
