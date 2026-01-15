import { useState, useEffect } from 'react'
import { playlistService } from '../api/services'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { X, Plus } from 'lucide-react'
import { toast } from 'sonner'

const PlaylistModal = ({ isOpen, onClose, videoId, onSuccess }) => {
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists()
    }
  }, [isOpen])

  const fetchPlaylists = async () => {
    try {
      setLoading(true)
      const response = await playlistService.getMyPlaylists()
      const data = response?.data?.data
      const playlistsData = data?.playlists || []
      // Filter out Watch Later playlist
      const filtered = playlistsData.filter(p => !p.isWatchLater)
      setPlaylists(filtered)
    } catch (error) {
      toast.error('Failed to load playlists')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await playlistService.addVideoToPlaylist(videoId, playlistId)
      toast.success('Video added to playlist')
      onSuccess?.()
      onClose()
    } catch (error) {
      toast.error('Failed to add video to playlist')
    }
  }

  const handleCreatePlaylist = async (e) => {
    e.preventDefault()
    if (!newPlaylistName.trim()) return

    try {
      setCreating(true)
      const response = await playlistService.createPlaylist({
        name: newPlaylistName,
        description: '',
        isPublic: false
      })
      
      const newPlaylist = response?.data?.data
      if (newPlaylist) {
        await handleAddToPlaylist(newPlaylist.id)
        toast.success('Playlist created and video added')
      }
      
      setNewPlaylistName('')
      setShowCreateForm(false)
    } catch (error) {
      toast.error('Failed to create playlist')
    } finally {
      setCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Add to playlist</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {/* Create new playlist */}
            {!showCreateForm ? (
              <Button
                variant="outline"
                className="w-full mb-4"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create new playlist
              </Button>
            ) : (
              <form onSubmit={handleCreatePlaylist} className="mb-4 p-3 border rounded">
                <Input
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Playlist name"
                  className="mb-2"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <Button type="submit" size="sm" disabled={creating || !newPlaylistName.trim()}>
                    {creating ? 'Creating...' : 'Create'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewPlaylistName('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Existing playlists */}
            {loading ? (
              <div className="text-center py-4">Loading playlists...</div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No playlists found. Create your first playlist!
              </div>
            ) : (
              <div className="space-y-2">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                    className="w-full text-left p-3 rounded hover:bg-accent transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">{playlist.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {playlist.videos?.length || 0} videos
                      </div>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PlaylistModal