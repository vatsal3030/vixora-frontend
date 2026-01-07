import { useState, useEffect, lazy, Suspense } from 'react'
import { feedService, videoService } from '../api/services'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import VideoGrid from '../components/VideoGrid'
import VideoCardSkeleton from '../components/VideoCardSkeleton'
import AddToPlaylistDialog from '../components/AddToPlaylistDialog'
import CreatePlaylistDialog from '../components/CreatePlaylistDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'

const VideoCard = lazy(() => import('../components/VideoCard'))

const Home = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState(null)

  useDocumentTitle(null) // Home page shows only "Vidora"

  useEffect(() => {
    fetchVideos()
  }, [sortBy])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      let response

      if (sortBy === 'trending') {
        response = await feedService.getTrendingFeed()
      } else {
        const params = {
          sortBy: sortBy === 'latest' ? 'createdAt' : 'views',
          sortType: 'desc',
          page: 1,
          limit: 20
        }
        response = await videoService.getVideos(params)
      }

      const videosData =
        response?.data?.data?.docs ||
        response?.data?.data?.videos ||
        response?.data?.data ||
        [];

      setVideos(Array.isArray(videosData) ? videosData : []);
    } catch (error) {
      console.error('Error fetching videos:', error)
      setError('Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToPlaylist = (videoId) => {
    setSelectedVideoId(videoId)
    setShowAddToPlaylist(true)
  }



  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchVideos}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Home</h1>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <VideoGrid videos={[]} loading={true} />
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No videos found</p>
            <p className="text-muted-foreground/70 mt-2">Be the first to upload a video!</p>
          </div>
        ) : (
          <VideoGrid videos={videos} loading={false} />
        )}
      </div>

      {/* Add to Playlist Dialog */}
      <AddToPlaylistDialog
        open={showAddToPlaylist}
        onOpenChange={setShowAddToPlaylist}
        videoId={selectedVideoId}
      />

      {/* Create Playlist Dialog */}

    </>
  )
}

export default Home