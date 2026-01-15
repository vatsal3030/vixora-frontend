export default function VideoCardSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="aspect-video bg-gray-800 rounded-lg" />
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-gray-800 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-800 rounded w-full" />
          <div className="h-4 bg-gray-800 rounded w-3/4" />
          <div className="h-3 bg-gray-800 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}
