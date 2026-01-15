export default function CommentSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-10 h-10 bg-gray-800 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-800 rounded w-32" />
        <div className="h-4 bg-gray-800 rounded w-full" />
        <div className="h-4 bg-gray-800 rounded w-4/5" />
        <div className="h-3 bg-gray-800 rounded w-24 mt-2" />
      </div>
    </div>
  )
}
