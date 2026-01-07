import { useState, useEffect, lazy, Suspense } from 'react'
import { feedService } from '../api/services'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import VideoGrid from '../components/VideoGrid'
import VideoCardSkeleton from '../components/VideoCardSkeleton'

const VideoCard = lazy(() => import('../components/VideoCard'))

const Trending = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useDocumentTitle('Trending')

  useEffect(() => {
    fetchTrendingVideos()
  }, [])

  const fetchTrendingVideos = async () => {
    try {
      setLoading(true)
      const response = await feedService.getTrendingFeed()
      const videosData =
        response?.data?.data?.docs ||
        response?.data?.data?.videos ||
        response?.data?.data ||
        [];

      setVideos(Array.isArray(videosData) ? videosData : []);
    } catch (error) {
      console.error('Error fetching trending videos:', error)
      setError('Failed to load trending videos')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchTrendingVideos}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Trending Videos</h1>

      {loading ? (
        <VideoGrid videos={[]} loading={true} />
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No trending videos found</p>
        </div>
      ) : (
        <VideoGrid videos={videos} loading={false} />
      )}
    </div>
  )
}

export default Trending