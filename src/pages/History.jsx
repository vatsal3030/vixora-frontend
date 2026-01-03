import { useState, useEffect } from 'react'
import { watchHistoryService } from '../api/services'
import VideoGrid from '../components/VideoGrid'

const History = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      console.log('Fetching watch history...')
      const response = await watchHistoryService.getContinueWatching()
      console.log('Watch history response:', response.data)
      
      // Handle the correct response structure from backend
      let videosData = []
      if (response?.data?.data) {
        if (response.data.data.videos) {
          // Backend returns { videos: [...], pagination: {...} }
          videosData = response.data.data.videos
        } else if (Array.isArray(response.data.data)) {
          // Direct array
          videosData = response.data.data
        }
      }

      // Extract video data from watch history entries
      const extractedVideos = videosData.map(item => {
        // Backend returns { progress, duration, updatedAt, video: {...} }
        if (item.video) {
          return {
            ...item.video,
            watchProgress: item.progress || 0,
            watchedAt: item.updatedAt
          }
        }
        // Fallback if structure is different
        return item
      })

      setVideos(Array.isArray(extractedVideos) ? extractedVideos : [])
    } catch (error) {
      console.error('Error fetching watch history:', error)
      setError('Failed to load watch history')
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
            onClick={fetchHistory}
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
      <h1 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Watch History</h1>
      
      {loading ? (
        <VideoGrid loading={true} />
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No watch history yet</p>
          <p className="text-muted-foreground/70 mt-2">Videos you watch will appear here</p>
        </div>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  )
}

export default History