import { useState, useEffect } from 'react'
import { playlistService } from '../api/services'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import ButtonPrimary from '../components/ui/ButtonPrimary'
import ButtonSecondary from '../components/ui/ButtonSecondary'
import PermissionDialog from '../components/common/PermissionDialog'
import { Trash2, RotateCcw, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '../utils/formatDate'

const PlaylistTrash = () => {
  const [deletedPlaylists, setDeletedPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(null)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)

  useEffect(() => {
    fetchDeletedPlaylists()
  }, [])

  const fetchDeletedPlaylists = async () => {
    try {
      setLoading(true)
      const response = await playlistService.getDeletedPlaylists()
      setDeletedPlaylists(response?.data?.data || [])
    } catch (error) {
      toast.error('Failed to load deleted playlists')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async () => {
    if (!selectedPlaylist) return
    setRestoreDialogOpen(false)
    
    try {
      setRestoring(selectedPlaylist.id)
      await playlistService.restorePlaylist(selectedPlaylist.id)
      setDeletedPlaylists(prev => prev.filter(p => p.id !== selectedPlaylist.id))
      toast.success('Playlist restored successfully')
    } catch (error) {
      toast.error('Failed to restore playlist')
    } finally {
      setRestoring(null)
      setSelectedPlaylist(null)
    }
  }

  const formatDaysLeft = (deletedAt) => {
    const deleted = new Date(deletedAt)
    const now = new Date()
    const sevenDaysLater = new Date(deleted.getTime() + 7 * 24 * 60 * 60 * 1000)
    const daysLeft = Math.ceil((sevenDaysLater - now) / (1000 * 60 * 60 * 24))
    return daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Expired'
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold mb-6">Deleted Playlists</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Deleted Playlists</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Playlists are permanently deleted after 7 days
          </p>
        </div>
      </div>

      {deletedPlaylists.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trash2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground mb-2">No deleted playlists</p>
            <p className="text-sm text-muted-foreground">
              Deleted playlists will appear here for 7 days before being permanently removed
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {deletedPlaylists.map((playlist) => (
            <Card key={playlist.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{playlist.name}</h3>
                    {playlist.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {playlist.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>Deleted {formatDate(playlist.deletedAt)}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDaysLeft(playlist.deletedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <ButtonPrimary
                    onClick={() => {
                      setSelectedPlaylist(playlist)
                      setRestoreDialogOpen(true)
                    }}
                    disabled={restoring === playlist.id}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {restoring === playlist.id ? 'Restoring...' : 'Restore'}
                  </ButtonPrimary>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {/* Restore Confirmation Dialog */}
      <PermissionDialog
        open={restoreDialogOpen}
        onOpenChange={setRestoreDialogOpen}
        onConfirm={handleRestore}
        title="Restore Playlist?"
        description={`Are you sure you want to restore "${selectedPlaylist?.name}"? It will be moved back to your playlists.`}
        confirmText="Restore"
        cancelText="Cancel"
        variant="confirm"
      />
    </div>
  )
}

export default PlaylistTrash
