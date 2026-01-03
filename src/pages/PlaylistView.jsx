import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { playlistService } from '../api/services'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Play, Lock, Globe, Clock, Eye } from 'lucide-react'
import Loader from '../components/Loader'

const PlaylistView = () => {
  const { playlistId } = useParams()
  const [playlist, setPlaylist] = useState(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (playlistId) {
      fetchPlaylist()
    }
  }, [playlistId])

  const fetchPlaylist = async () => {
    try {
      setLoading(true)
      const response = await playlistService.getPlaylist(playlistId)
      setPlaylist(response.data.data)
    } catch (error) {
      console.error('Error fetching playlist:', error)
      setError('Failed to load playlist')
    } finally {
      setLoading(false)
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

  const currentVideo = playlist.videos?.[currentVideoIndex]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Section */}
        <div className="lg:col-span-2">
          {currentVideo ? (
            <div className="space-y-4">
              {/* Video Player */}
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                {currentVideo.videoFile ? (
                  <video
                    controls
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
                <h1 className="text-xl font-bold mb-2">{currentVideo.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                  <span>{formatViews(currentVideo.views)}</span>
                  <span>•</span>
                  <span>{new Date(currentVideo.createdAt).toLocaleDateString()}</span>
                </div>
                
                {/* Channel Info */}
                {currentVideo.owner && (
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
                {currentVideo.description && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{currentVideo.description}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">No videos in this playlist</p>
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
                  {playlist.owner && (
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
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {playlist.videos?.map((video, index) => (
                  <div
                    key={video.id}
                    className={`flex space-x-3 p-2 rounded cursor-pointer hover:bg-muted transition-colors ${
                      index === currentVideoIndex ? 'bg-muted' : ''
                    }`}
                    onClick={() => setCurrentVideoIndex(index)}
                  >
                    <div className="relative flex-shrink-0">
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
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium line-clamp-2 mb-1">
                        {video.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{video.owner?.username}</span>
                        <span>•</span>
                        <span>{formatViews(video.views)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {playlist.videos?.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No videos in this playlist</p>
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