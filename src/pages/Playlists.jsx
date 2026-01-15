import { useState, useEffect, lazy, Suspense } from 'react'
import { playlistService } from '../api/services'
import PlaylistCardSkeleton from '../components/PlaylistCardSkeleton'
import CreatePlaylistDialog from '../components/CreatePlaylistDialog'
import { ListMusic, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { Button } from '../components/ui/button'

const PlaylistCard = lazy(() => import('../components/PlaylistCard'))

const Playlists = () => {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('recently-added')

  useEffect(() => {
    fetchPlaylists()
  }, [])

  const fetchPlaylists = async () => {
    try {
      setLoading(true)
      const response = await playlistService.getMyPlaylists()
      const data = response?.data?.data
      const playlistsData = data?.playlists || []
      
      const sorted = playlistsData.sort((a, b) => {
        if (a.isWatchLater) return -1
        if (b.isWatchLater) return 1
        return new Date(b.updatedAt) - new Date(a.updatedAt)
      })
      
      setPlaylists(sorted)
    } catch (error) {
      toast.error('Failed to load playlists')
    } finally {
      setLoading(false)
    }
  }

  const handlePlaylistCreated = (newPlaylist) => {
    setPlaylists(prev => {
      const watchLater = prev.filter(p => p.isWatchLater)
      const others = prev.filter(p => !p.isWatchLater)
      return [...watchLater, newPlaylist, ...others]
    })
    toast.success('Playlist created successfully')
  }

  const handlePlaylistUpdated = (updatedPlaylist) => {
    setPlaylists(prev => prev.map(p => p.id === updatedPlaylist.id ? updatedPlaylist : p))
  }

  const handlePlaylistDeleted = (playlistId) => {
    setPlaylists(prev => prev.filter(p => p.id !== playlistId))
  }

  const filterOptions = [
    { id: 'recently-added', label: 'Recently Added', sortBy: 'updatedAt', sortType: 'desc' },
    { id: 'a-z', label: 'A-Z', sortBy: 'name', sortType: 'asc' },
    { id: 'most-videos', label: 'Most Videos', sortBy: 'videoCount', sortType: 'desc' },
    { id: 'owned', label: 'Owned' },
    { id: 'public', label: 'Public Only' },
    { id: 'private', label: 'Private Only' },
  ]

  const filteredPlaylists = playlists.filter(p => {
    if (filter === 'owned') return !p.isWatchLater
    if (filter === 'public') return p.isPublic
    if (filter === 'private') return !p.isPublic
    return true
  }).sort((a, b) => {
    const option = filterOptions.find(f => f.id === filter)
    if (!option?.sortBy) return 0
    
    const aVal = a[option.sortBy]
    const bVal = b[option.sortBy]
    
    if (option.sortType === 'asc') {
      return aVal > bVal ? 1 : -1
    }
    return aVal < bVal ? 1 : -1
  })

  const currentFilterLabel = filterOptions.find(f => f.id === filter)?.label || 'Recently Added'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Your Playlists</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 min-w-[160px] justify-between">
                <span className="text-sm">{currentFilterLabel}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {filterOptions.map(option => (
                <DropdownMenuItem
                  key={option.id}
                  onClick={() => setFilter(option.id)}
                  className={filter === option.id ? 'bg-accent' : ''}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <CreatePlaylistDialog onPlaylistCreated={handlePlaylistCreated} />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <PlaylistCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredPlaylists.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <ListMusic className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-base sm:text-lg mb-2">No playlists found</p>
          <p className="text-muted-foreground/70 text-sm mb-4">Organize your favorite videos into playlists</p>
          <CreatePlaylistDialog onPlaylistCreated={handlePlaylistCreated}>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition min-h-[44px]">
              Create Your First Playlist
            </button>
          </CreatePlaylistDialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          <Suspense fallback={<PlaylistCardSkeleton />}>
            {filteredPlaylists.map((playlist) => (
              <PlaylistCard 
                key={playlist.id} 
                playlist={playlist}
                onPlaylistUpdated={handlePlaylistUpdated}
                onPlaylistDeleted={handlePlaylistDeleted}
              />
            ))}
          </Suspense>
        </div>
      )}
    </div>
  )
}

export default Playlists