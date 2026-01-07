import { useState, useEffect, lazy, Suspense } from 'react'
import { likeService } from '../api/services'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import VideoGrid from '../components/VideoGrid'
import VideoCardSkeleton from '../components/VideoCardSkeleton'

const VideoCard = lazy(() => import('../components/VideoCard'))

const LikedVideos = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useDocumentTitle('Liked Videos')

  useEffect(() => {
    fetchLikedVideos()
  }, [])

  const fetchLikedVideos = async () => {
    try {
      setLoading(true)
      const response = await likeService.getLikedVideos()
      console.log('Liked videos response:', response.data)
      
      // Handle different response structures
      let videosData = []
      if (response?.data?.data) {
        if (Array.isArray(response.data.data)) {
          // Direct array of videos
          videosData = response.data.data
        } else if (response.data.data.docs) {
          // Paginated response
          videosData = response.data.data.docs
        } else if (response.data.data.videos) {
          // Videos in videos property
          videosData = response.data.data.videos
        }
      }

      setVideos(Array.isArray(videosData) ? videosData : [])
    } catch (error) {
      console.error('Error fetching liked videos:', error)
      setError('Failed to load liked videos')
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
            onClick={fetchLikedVideos}
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
      <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Liked Videos</h1>

      {loading ? (
        <VideoGrid videos={[]} loading={true} />
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No liked videos yet</p>
          <p className="text-muted-foreground/70 mt-2">Videos you like will appear here</p>
        </div>
      ) : (
        <VideoGrid videos={videos} loading={false} />
      )}
    </div>
  )
}

export default LikedVideos