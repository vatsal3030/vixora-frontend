import VideoCardSkeleton from './VideoCardSkeleton'

export default function HomePageSkeleton() {
  return (
    <div className="p-6">
      <div className="flex gap-2 mb-6 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
