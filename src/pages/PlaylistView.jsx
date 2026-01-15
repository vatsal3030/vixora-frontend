import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { playlistService } from '../api/services'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Play, Lock, Globe, Plus, X } from 'lucide-react'
import Loader from '../components/Loader'
import { toast } from 'sonner'

const PlaylistView = () => {
  const { playlistId } = useParams()
  const navigate = useNavigate()
  const [playlist, setPlaylist] = useState(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (playlistId) {
      fetchPlaylist()
    }
  }, [playlistId])

  useEffect(() => {
    // Start from first video when playlist loads
    if (playlist?.videos?.length > 0) {
      setCurrentVideoIndex(0)
    }
  }, [playlist])

  const fetchPlaylist = async () => {
    try {
      setLoading(true)
      const response = await playlistService.getPlaylist(playlistId)
      const data = response.data.data
      // Deduplicate videos by ID
      const uniqueVideos = data.videos?.reduce((acc, video) => {
        if (!acc.find(v => v.id === video.id)) {
          acc.push(video)
        }
        return acc
      }, []) || []
      setPlaylist({ ...data, videos: uniqueVideos })
      setError('')
    } catch (error) {
      setError('Failed to load playlist')
      toast.error('Failed to load playlist')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveVideo = async (videoId) => {
    try {
      await playlistService.removeVideoFromPlaylist(videoId, playlistId)
      setPlaylist(prev => ({
        ...prev,
        videos: prev.videos.filter(v => v.id !== videoId)
      }))
      toast.success('Video removed from playlist')
      if (currentVideoIndex >= playlist.videos.length - 1) {
        setCurrentVideoIndex(Math.max(0, playlist.videos.length - 2))
      }
    } catch (error) {
      toast.error('Failed to remove video')
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatViews = (views) => {
    if (!views) return '0 views'
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`
    return `${views} views`
  }

  if (loading) return <Loader />

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchPlaylist}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Playlist not found</p>
      </div>
    )
  }

  const currentVideo = playlist?.videos?.[currentVideoIndex]
  const hasVideos = playlist?.videos?.length > 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Section */}
        <div className="lg:col-span-2">
          {hasVideos ? (
            <div className="space-y-4">
              {/* Video Player */}
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {currentVideo?.videoFile ? (
                  <video
                    key={currentVideo.id}
                    controls
                    autoPlay
                    className="w-full h-full"
                    poster={currentVideo.thumbnail}
                  >
                    <source src={currentVideo.videoFile} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="h-16 w-16 text-white/50" />
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div>
                <h1 className="text-xl font-bold mb-2">{currentVideo?.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <span>{formatViews(currentVideo?.views)}</span>
                  <span>•</span>
                  <span>{new Date(currentVideo?.createdAt).toLocaleDateString()}</span>
                </div>
                
                {/* Channel Info */}
                {currentVideo?.owner && (
                  <Link 
                    to={`/channel/${currentVideo.owner.id}`}
                    className="flex items-center space-x-3 mb-4"
                  >
                    <img
                      src={currentVideo.owner.avatar}
                      alt={currentVideo.owner.fullName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{currentVideo.owner.fullName}</p>
                      <p className="text-sm text-muted-foreground">@{currentVideo.owner.username}</p>
                    </div>
                  </Link>
                )}

                {/* Description */}
                {currentVideo?.description && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{currentVideo.description}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center p-8">
              <Play className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No videos in this playlist</h3>
              <p className="text-muted-foreground text-center mb-4">
                This playlist is empty. Add videos to start watching.
              </p>
              <Button onClick={() => navigate('/')}>
                <Plus className="h-4 w-4 mr-2" />
                Browse Videos
              </Button>
            </div>
          )}
        </div>

        {/* Playlist Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              {/* Playlist Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-lg">{playlist.name}</h2>
                  <div className="flex items-center text-muted-foreground">
                    {playlist.isPublic ? (
                      <Globe className="h-4 w-4" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </div>
                </div>
                
                {playlist.description && (
                  <p className="text-sm text-muted-foreground mb-2">{playlist.description}</p>
                )}
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{playlist.videos?.length || 0} videos</span>
                  {!playlist.isWatchLater && playlist.owner && (
                    <>
                      <span>•</span>
                      <Link 
                        to={`/channel/${playlist.owner.id}`}
                        className="hover:text-foreground"
                      >
                        {playlist.owner.username}
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Video List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {playlist.videos?.map((video, index) => (
                  <div
                    key={`${video.id}-${index}`}
                    className={`flex space-x-3 p-2 rounded hover:bg-muted transition-colors group ${
                      index === currentVideoIndex ? 'bg-muted' : ''
                    }`}
                  >
                    <div 
                      className="relative flex-shrink-0 cursor-pointer"
                      onClick={() => setCurrentVideoIndex(index)}
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-20 h-12 object-cover rounded"
                      />
                      {video.duration && (
                        <span className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 rounded">
                          {formatDuration(video.duration)}
                        </span>
                      )}
                      {index === currentVideoIndex && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                          <Play className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setCurrentVideoIndex(index)}
                    >
                      <h4 className="text-sm font-medium line-clamp-2 mb-1">
                        {video.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{video.owner?.username}</span>
                        <span>•</span>
                        <span>{formatViews(video.views)}</span>
                      </div>
                    </div>

                    {!playlist.isWatchLater && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveVideo(video.id)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {!hasVideos && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No videos in this playlist</p>
                  <Button size="sm" onClick={() => navigate('/')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Videos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PlaylistView