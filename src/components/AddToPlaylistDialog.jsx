import { useState, useEffect } from 'react'
import { playlistService } from '../api/services'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'
import { Checkbox } from './ui/checkbox'
import { Plus, ListMusic } from 'lucide-react'
import CreatePlaylistDialog from './CreatePlaylistDialog'

const AddToPlaylistDialog = ({ open, onOpenChange, videoId }) => {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState({})

  useEffect(() => {
    if (open) {
      fetchPlaylists()
    }
  }, [open])

  const fetchPlaylists = async () => {
    try {
      setLoading(true)
      const response = await playlistService.getMyPlaylists()
      const playlistsData = response?.data?.data?.playlists || response?.data?.data || []
      setPlaylists(Array.isArray(playlistsData) ? playlistsData : [])
    } catch (error) {
      console.error('Error fetching playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlaylistToggle = async (playlistId, isInPlaylist) => {
    try {
      setUpdating(prev => ({ ...prev, [playlistId]: true }))
      
      if (isInPlaylist) {
        await playlistService.removeVideoFromPlaylist(videoId, playlistId)
      } else {
        await playlistService.addVideoToPlaylist(videoId, playlistId)
      }
      
      // Update local state
      setPlaylists(prev => prev.map(playlist => 
        playlist.id === playlistId 
          ? { 
              ...playlist, 
              videos: isInPlaylist 
                ? playlist.videos?.filter(v => v.id !== videoId) || []
                : [...(playlist.videos || []), { id: videoId }]
            }
          : playlist
      ))
    } catch (error) {
      console.error('Error updating playlist:', error)
    } finally {
      setUpdating(prev => ({ ...prev, [playlistId]: false }))
    }
  }

  const handlePlaylistCreated = (newPlaylist) => {
    setPlaylists(prev => [newPlaylist, ...prev])
  }

  const isVideoInPlaylist = (playlist) => {
    return playlist.videos?.some(video => video.id === videoId) || false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to playlist</DialogTitle>
          <DialogDescription>
            Choose which playlists to add this video to.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Create New Playlist */}
          <CreatePlaylistDialog onPlaylistCreated={handlePlaylistCreated}>
            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Create new playlist
            </Button>
          </CreatePlaylistDialog>

          {/* Playlist List */}
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-2">
                  <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                  <div className="flex-1 h-4 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center py-8">
              <ListMusic className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No playlists found</p>
              <p className="text-sm text-muted-foreground">Create your first playlist to get started</p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-1">
              {playlists.map((playlist) => {
                const inPlaylist = isVideoInPlaylist(playlist)
                const isUpdating = updating[playlist.id]
                
                return (
                  <div
                    key={playlist.id}
                    className="flex items-center space-x-3 p-2 hover:bg-muted rounded cursor-pointer"
                    onClick={() => !isUpdating && handlePlaylistToggle(playlist.id, inPlaylist)}
                  >
                    <Checkbox
                      checked={inPlaylist}
                      disabled={isUpdating}
                      className="pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{playlist.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {playlist.videos?.length || 0} videos
                      </p>
                    </div>
                    {isUpdating && (
                      <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddToPlaylistDialog