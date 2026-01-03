import { useState, useEffect } from 'react'
import { videoService } from '../api/services'
import VideoGrid from '../components/VideoGrid'
import { Button } from '../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import { Link } from 'react-router-dom'
import { Upload } from 'lucide-react'

const MyVideos = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchMyVideos()
  }, [filter])

  const fetchMyVideos = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filter === 'videos') {
        params.isShort = 'false'
      } else if (filter === 'shorts') {
        params.isShort = 'true'
      }
      
      const response = await videoService.getMyVideos(params)
      const videosData = response?.data?.data?.videos || response?.data?.data || []
      setVideos(Array.isArray(videosData) ? videosData : [])
    } catch (error) {
      console.error('Error fetching my videos:', error)
      setError('Failed to load your videos')
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
            onClick={fetchMyVideos}
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Your Videos</h1>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="videos">Videos</SelectItem>
              <SelectItem value="shorts">Shorts</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button asChild>
          <Link to="/upload" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Upload Video</span>
          </Link>
        </Button>
      </div>
      
      {loading ? (
        <VideoGrid loading={true} />
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-2">No {filter === 'all' ? 'content' : filter} uploaded yet</p>
          <p className="text-muted-foreground/70 mb-4">Start sharing your content with the world!</p>
          <Button asChild>
            <Link to="/upload">Upload Your First Video</Link>
          </Button>
        </div>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </div>
  )
}

export default MyVideos