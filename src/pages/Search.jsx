import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { videoService } from '../api/services'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import VideoCard from '../components/VideoCard'
import Loader from '../components/Loader'

const Search = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useDocumentTitle(query ? `${query} - Search` : 'Search')

  useEffect(() => {
    if (query) {
      searchVideos()
    }
  }, [query])

  const searchVideos = async () => {
    try {
      setLoading(true)
      const response = await videoService.getVideos({ query })
      const videosData = response?.data?.data?.videos || response?.data?.data || []
      setVideos(Array.isArray(videosData) ? videosData : [])
    } catch (error) {
      console.error('Error searching videos:', error)
      setError('Failed to search videos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <Loader />

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={searchVideos}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Search Results</h1>
      <p className="text-gray-600 mb-8">
        {videos.length} results for "{query}"
      </p>

      {videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No videos found</p>
          <p className="text-gray-400 mt-2">Try searching with different keywords</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Search