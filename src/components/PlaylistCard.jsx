import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play, Lock, Globe, Clock, MoreVertical, Edit2, Trash2, Share2, Eye, EyeOff } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { playlistService } from '../api/services'
import EditPlaylistDialog from './EditPlaylistDialog'
import PermissionDialog from './common/PermissionDialog'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'

const PlaylistCard = ({ playlist, onPlaylistUpdated, onPlaylistDeleted }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const isOwner = user?.id === playlist?.ownerId

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '0s'
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) return `${hours}h ${mins}m`
    if (mins > 0) return `${mins}m ${secs}s`
    return `${secs}s`
  }

  const formatDate = (date) => {
    if (!date) return ''
    const now = new Date()
    const updated = new Date(date)
    const diffDays = Math.floor((now - updated) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Updated today'
    if (diffDays === 1) return 'Updated yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return `${Math.floor(diffDays / 30)}mo ago`
  }

  const playlistLink = playlist.isWatchLater ? '/watch-later' : `/playlist/${playlist.id}`

  const handleTogglePrivacy = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isUpdating) return
    
    try {
      setIsUpdating(true)
      await playlistService.togglePlaylistPrivacy(playlist.id)
      const newIsPublic = !playlist.isPublic
      onPlaylistUpdated?.({ ...playlist, isPublic: newIsPublic })
      toast.success(`Playlist is now ${newIsPublic ? 'public' : 'private'}`)
    } catch (error) {
      toast.error('Failed to update privacy')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleShare = async (e, platform) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!playlist.isPublic) {
      toast.error('Only public playlists can be shared')
      return
    }
    
    const url = `${window.location.origin}/playlist/${playlist.id}`
    
    switch (platform) {
      case 'whatsapp':
        const whatsappText = `Check out this playlist: ${playlist.name}\n\n${url}`
        window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'twitter':
        const twitterText = `Check out this playlist: ${playlist.name}`
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'copy':
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard')
        break
      default:
        break
    }
  }

  const handleDelete = async () => {
    setDeleteDialogOpen(false)
    if (isUpdating) return
    
    try {
      setIsUpdating(true)
      await playlistService.deletePlaylist(playlist.id)
      toast.success('Playlist moved to trash')
      onPlaylistDeleted?.(playlist.id)
    } catch (error) {
      toast.error('Failed to delete playlist')
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePlayAll = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(playlistLink)
  }

  return (
    <div className="group relative">
      <Link to={playlistLink} className="block">
        {/* Thumbnail Container */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 mb-3 shadow-md hover:shadow-xl transition-shadow">
          {/* Thumbnail Image or Background Icon */}
          {playlist.thumbnail ? (
            <img 
              src={playlist.thumbnail} 
              alt={playlist.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {playlist.isWatchLater ? (
                <Clock className="h-16 w-16 text-gray-700" />
              ) : (
                <Play className="h-16 w-16 text-gray-700" />
              )}
            </div>
          )}
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40" />
          
          {/* Video Count Badge - Right Side */}
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-black/90 flex flex-col items-center justify-center border-l border-white/10">
            <Play className="w-5 h-5 text-white mb-1" />
            <span className="text-white text-sm font-bold">
              {playlist.videoCount || 0}
            </span>
            <span className="text-white/70 text-xs">
              video{playlist.videoCount !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Play All Button - Center (Desktop Hover) */}
          <div className="absolute inset-0 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button 
              onClick={handlePlayAll}
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full hover:scale-105 transition-transform shadow-lg font-semibold"
            >
              <Play className="w-5 h-5" fill="currentColor" />
              Play all
            </button>
          </div>
          
          {/* Three-Dot Menu - Top Right */}
          {isOwner && (
            <div className="absolute top-3 right-3 z-10" onClick={(e) => e.preventDefault()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isUpdating}
                    className="h-8 w-8 rounded-full bg-black/80 hover:bg-black text-white backdrop-blur-sm"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {!playlist.isWatchLater && (
                    <>
                      <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit playlist
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleTogglePrivacy} disabled={isUpdating}>
                        {playlist.isPublic ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Make private
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Make public
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {playlist.isPublic && (
                    <>
                      <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share playlist
                      </DropdownMenuItem>
                      <div className="px-2 py-1">
                        <div className="grid grid-cols-2 gap-1">
                          <button
                            onClick={(e) => handleShare(e, 'whatsapp')}
                            className="flex flex-col items-center p-2 rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mb-1">
                              <span className="text-white text-[10px] font-bold">W</span>
                            </div>
                            <span className="text-[10px]">WhatsApp</span>
                          </button>
                          <button
                            onClick={(e) => handleShare(e, 'facebook')}
                            className="flex flex-col items-center p-2 rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mb-1">
                              <span className="text-white text-[10px] font-bold">f</span>
                            </div>
                            <span className="text-[10px]">Facebook</span>
                          </button>
                          <button
                            onClick={(e) => handleShare(e, 'twitter')}
                            className="flex flex-col items-center p-2 rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center mb-1">
                              <span className="text-white text-[10px] font-bold">𝕏</span>
                            </div>
                            <span className="text-[10px]">Twitter</span>
                          </button>
                          <button
                            onClick={(e) => handleShare(e, 'copy')}
                            className="flex flex-col items-center p-2 rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center mb-1">
                              <Copy className="h-3 w-3 text-white" />
                            </div>
                            <span className="text-[10px]">Copy</span>
                          </button>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {!playlist.isWatchLater && (
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setDeleteDialogOpen(true)
                      }} 
                      disabled={isUpdating} 
                      className="text-red-500 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete playlist
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          
          {/* Watch Later Badge */}
          {playlist.isWatchLater && (
            <div className="absolute top-3 left-3 bg-black/80 text-white text-xs px-2.5 py-1.5 rounded-md flex items-center gap-1.5 backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5" />
              Watch Later
            </div>
          )}
        </div>
      </Link>
      
      {/* Playlist Info */}
      <div className="space-y-1.5">
        <Link to={playlistLink}>
          <h3 className="text-base font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
            {playlist.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{playlist.videoCount || 0} videos</span>
          <span>•</span>
          <span>{formatDuration(playlist.totalDuration || 0)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {playlist.isPublic ? (
            <>
              <Globe className="w-3 h-3" />
              <span>Public</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" />
              <span>Private</span>
            </>
          )}
          <span>•</span>
          <span>{formatDate(playlist.updatedAt)}</span>
        </div>
      </div>

      {/* Edit Dialog */}
      {isOwner && !playlist.isWatchLater && (
        <>
          <EditPlaylistDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            playlist={playlist}
            onPlaylistUpdated={(updated) => {
              onPlaylistUpdated?.({ ...playlist, ...updated })
              toast.success('Playlist updated successfully')
            }}
          />
          <PermissionDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={handleDelete}
            title="Delete Playlist?"
            description={`Are you sure you want to delete "${playlist.name}"? This action will move it to trash for 7 days.`}
            confirmText="Delete"
            cancelText="Cancel"
            variant="alert"
          />
        </>
      )}
    </div>
  )
}

export default PlaylistCard