import { useState, useEffect } from 'react'
import { watchHistoryService } from '../api/services'
import VideoGrid from '../components/VideoGrid'

const WatchLater = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchContinueWatching()
  }, [])

  const fetchContinueWatching = async () => {
    try {
      setLoading(true)
      const response = await watchHistoryService.getContinueWatching()
      const videosData = response?.data?.data?.videos || response?.data?.data || []
      
      // Extract video data from watch history entries
      const videos = Array.isArray(videosData) ? videosData.map(entry => {
        // If it's a watch history entry with video nested inside
        if (entry.video) {
          return {
            ...entry.video,
            progress: {
              percentage: entry.progress || 0,
              watchedDuration: entry.duration || 0,
              lastWatchedAt: entry.updatedAt
            }
          }
        }
        // If it's already a video object
        return entry
      }).filter(video => video && video.id) : []
      
      setVideos(videos)
    } catch (error) {
      console.error('Error fetching continue watching:', error)
      setError('Failed to load continue watching')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Continue Watching</h1>
        <VideoGrid loading={true} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchContinueWatching}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Continue Watching</h1>
      
      {videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No videos to continue watching</p>
          <p className="text-muted-foreground/70 mt-2">Start watching videos to see them here</p>
        </div>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  )
}

export default WatchLater