import { useState, useEffect } from 'react'
import { playlistService } from '../api/services'
import VideoGrid from '../components/VideoGrid'

const WatchLater = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [watchLaterPlaylist, setWatchLaterPlaylist] = useState(null)

  useEffect(() => {
    fetchWatchLaterPlaylist()
  }, [])

  const fetchWatchLaterPlaylist = async () => {
    try {
      setLoading(true)
      // Get user's playlists and find "Watch Later" playlist
      const response = await playlistService.getMyPlaylists()
      console.log('Playlists response:', response?.data)
      
      const playlistsData = response?.data?.data || response?.data || []
      const playlists = Array.isArray(playlistsData) ? playlistsData : []
      
      // Find or create "Watch Later" playlist
      let watchLater = playlists.find(p => p.name === 'Watch Later')
      
      if (!watchLater) {
        // Create "Watch Later" playlist if it doesn't exist
        const createResponse = await playlistService.createPlaylist({
          name: 'Watch Later',
          description: 'Videos saved for later viewing',
          isPublic: false
        })
        watchLater = createResponse?.data?.data
      }
      
      setWatchLaterPlaylist(watchLater)
      
      // Get playlist videos
      if (watchLater) {
        const playlistResponse = await playlistService.getPlaylist(watchLater.id)
        const videosData = playlistResponse?.data?.data?.videos || []
        setVideos(videosData)
      }
    } catch (error) {
      console.error('Error fetching watch later videos:', error)
      setError('Failed to load watch later videos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Watch Later</h1>
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
            onClick={fetchWatchLaterPlaylist}
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
      <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Watch Later</h1>
      
      {videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No videos saved for later</p>
          <p className="text-muted-foreground/70 mt-2">Save videos to watch them later</p>
        </div>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  )
}

export default WatchLater