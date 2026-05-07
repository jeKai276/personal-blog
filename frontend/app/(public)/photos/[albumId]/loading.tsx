export default function AlbumDetailLoading() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="h-9 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
      </header>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-md bg-gray-100" />
        ))}
      </div>
    </div>
  )
}
