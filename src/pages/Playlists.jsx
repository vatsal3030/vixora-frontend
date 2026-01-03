import { useState, useEffect, lazy, Suspense } from 'react'
import { playlistService } from '../api/services'
import PlaylistCardSkeleton from '../components/PlaylistCardSkeleton'
import CreatePlaylistDialog from '../components/CreatePlaylistDialog'
import { ListMusic } from 'lucide-react'

const PlaylistCard = lazy(() => import('../components/PlaylistCard'))

const Playlists = () => {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const fetchPlaylists = async () => {
    try {
      setLoading(true)
      const response = await playlistService.getMyPlaylists()
      const playlistsData = response?.data?.data?.playlists || response?.data?.data || []
      setPlaylists(Array.isArray(playlistsData) ? playlistsData : [])
    } catch (error) {
      console.error('Error fetching playlists:', error)
      setError('Failed to load playlists')
    } finally {
      setLoading(false)
    }
  }

  const handlePlaylistCreated = (newPlaylist) => {
    setPlaylists(prev => [newPlaylist, ...prev])
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchPlaylists}
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Your Playlists</h1>
        <CreatePlaylistDialog onPlaylistCreated={handlePlaylistCreated} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <PlaylistCardSkeleton key={i} />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-12">
          <ListMusic className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-2">No playlists created yet</p>
          <p className="text-muted-foreground/70 mb-4">Organize your favorite videos into playlists</p>
          <CreatePlaylistDialog onPlaylistCreated={handlePlaylistCreated}>
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Create Your First Playlist
            </button>
          </CreatePlaylistDialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          <Suspense fallback={<PlaylistCardSkeleton />}>
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </Suspense>
        </div>
      )}
    </div>
  )
}

export default Playlists