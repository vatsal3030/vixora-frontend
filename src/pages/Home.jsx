import { useState, useEffect, lazy, Suspense } from 'react'
import { feedService, videoService } from '../api/services'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import VideoGrid from '../components/VideoGrid'
import HomePageSkeleton from '../components/skeletons/HomePageSkeleton'
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
  const [sortBy, setSortBy] = useState('latest')
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false)
  const [selectedVideoId, setSelectedVideoId] = useState(null)
  const [key, setKey] = useState(0)

  useDocumentTitle(null) // Home page shows only "Vixora"

  const fetchVideos = async (page) => {
    let response

    if (sortBy === 'trending') {
      response = await feedService.getTrendingFeed()
    } else {
      const params = {
        sortBy: sortBy === 'latest' ? 'createdAt' : 'views',
        sortType: 'desc',
        page,
        limit: 20
      }
      response = await videoService.getVideos(params)
    }

    const videosData =
      response?.data?.data?.docs ||
      response?.data?.data?.videos ||
      response?.data?.data ||
      [];

    return Array.isArray(videosData) ? videosData : []
  }

  const { data: videos, loading, error, hasMore, observerRef } = useInfiniteScroll(fetchVideos, key)

  // Reset when sortBy changes
  useEffect(() => {
    setKey(prev => prev + 1)
  }, [sortBy])

  const handleAddToPlaylist = (videoId) => {
    setSelectedVideoId(videoId)
    setShowAddToPlaylist(true)
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

        {loading && videos.length === 0 ? (
          <HomePageSkeleton />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Try Again
            </button>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No videos found</p>
            <p className="text-muted-foreground/70 mt-2">Be the first to upload a video!</p>
          </div>
        ) : (
          <>
            <VideoGrid videos={videos} loading={false} />
            {hasMore && <div ref={observerRef} className="h-20 flex items-center justify-center"><HomePageSkeleton /></div>}
          </>
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