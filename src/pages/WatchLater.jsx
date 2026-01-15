import { useState, useEffect } from 'react'
import { playlistService } from '../api/services'
import { Clock } from 'lucide-react'
import VideoGrid from '../components/VideoGrid'
import { toast } from 'sonner'

const WatchLater = () => {
  const [videos, setVideos] = useState([])
  const [metadata, setMetadata] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWatchLater()
  }, [])

  const fetchWatchLater = async () => {
    try {
      setLoading(true)
      const response = await playlistService.getWatchLater()
      const data = response?.data?.data
      setVideos(data?.videos || [])
      setMetadata(data?.metadata || null)
    } catch (error) {
      toast.error('Failed to load watch later videos')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${mins}m`
    return `${mins}m`
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="h-6 w-6" />
          <h1 className="text-xl sm:text-2xl font-bold">Watch Later</h1>
        </div>
        <VideoGrid loading={true} />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Clock className="h-6 w-6" />
          <h1 className="text-xl sm:text-2xl font-bold">Watch Later</h1>
        </div>
        {metadata && (
          <div className="text-sm text-muted-foreground">
            {metadata.videoCount} videos • {formatDuration(metadata.totalDuration)}
          </div>
        )}
      </div>
      
      {videos.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-2">No videos saved for later</p>
          <p className="text-muted-foreground/70">Click the clock icon on any video to save it here</p>
        </div>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  )
}

export default WatchLater