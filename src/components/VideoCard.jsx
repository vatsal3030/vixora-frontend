import { Link } from 'react-router-dom'
import { useState, useRef, useCallback } from 'react'
import { Card, CardContent } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { formatDate } from '../utils/formatDate'
import { formatDuration, formatViews } from '../utils/videoUtils'
import { Eye, Clock, MoreVertical, Plus, ListPlus, Share, Copy, ExternalLink, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import PlaylistModal from './PlaylistModal'

const VideoCard = ({ 
  video, 
  showDuration = true, 
  showProgress = true, 
  showViews = true, 
  showChannel = true, 
  compact = false 
}) => {
  const [showPreview, setShowPreview] = useState(false)
  const [showPlaylistModal, setShowPlaylistModal] = useState(false)
  const [message, setMessage] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const hoverTimeoutRef = useRef(null)
  const videoRef = useRef(null)

  const handlePlaylistSuccess = (msg, type = 'success') => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleShare = (platform) => {
    const videoUrl = `${window.location.origin}/video/${video.id}`
    
    switch (platform) {
      case 'whatsapp':
        // WhatsApp works better with URL on separate line
        const whatsappText = `Check out this video: ${video.title}\n\n${videoUrl}`
        window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`, '_blank')
        break
      case 'twitter':
        const twitterText = `Check out this video: ${video.title}`
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(videoUrl)}`, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(videoUrl)
        setMessage('Link copied to clipboard!')
        break
      default:
        break
    }
  }

  // Get progress from video data (now included in backend response)
  const watchProgress = video.progress?.percentage || 0

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    hoverTimeoutRef.current = setTimeout(() => {
      if (video.videoFile) {
        setShowPreview(true)
      }
    }, 1000)
  }, [video.videoFile])

  const handleMouseLeave = useCallback(() => {
    setShowPreview(false)
    setIsPlaying(false)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setCurrentTime(0)
    }
  }, [])

  // Auto-play when preview shows
  const handleVideoLoad = () => {
    if (videoRef.current && showPreview) {
      videoRef.current.currentTime = 0
      videoRef.current.muted = isMuted
      videoRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(console.error)
    }
  }

  const togglePlayPause = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const toggleMute = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const newTime = (clickX / rect.width) * duration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-card relative group">
      <Link to={`/video/${video.id}`}>
        <div 
          className="relative aspect-video bg-muted"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {showPreview && video.videoFile ? (
            <>
              <video
                ref={videoRef}
                src={video.videoFile}
                className="w-full h-full object-cover"
                muted={isMuted}
                loop
                playsInline
                autoPlay
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onCanPlay={handleVideoLoad}
              />
              
              {/* Video Controls Overlay */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayPause}
                    className="h-8 w-8 p-0 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full"
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4 text-white" />
                    ) : (
                      <Play className="h-4 w-4 text-white ml-0.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="h-8 w-8 p-0 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4 text-white" />
                    ) : (
                      <Volume2 className="h-4 w-4 text-white" />
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Progress Bar */}
              {duration > 0 && (
                <div 
                  className="absolute bottom-0 left-0 w-full h-1 bg-black/40 cursor-pointer group/progress"
                  onClick={handleSeek}
                >
                  <div 
                    className="h-full bg-primary transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                  <div className="absolute inset-0 opacity-0 group-hover/progress:opacity-100 transition-opacity">
                    <div className="h-full bg-white/20" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
          {/* Duration Badge - Bottom Right */}
          {video.duration && showDuration && (
            <div className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded font-medium video-duration">
              {formatDuration(video.duration)}
            </div>
          )}
          
          {/* Watch Progress Bar */}
          {watchProgress > 0 && showProgress && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black/20 video-progress">
              <div 
                className="h-full bg-primary"
                style={{ width: `${watchProgress}%` }}
              />
            </div>
          )}
          {/* Three Dots Menu - Bottom Right */}
          <div className="absolute bottom-1.5 right-1.5 z-10" onClick={(e) => e.preventDefault()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-black/60 hover:bg-black/80 backdrop-blur-sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowPlaylistModal(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add to playlist
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleShare('whatsapp')}
                      className="flex flex-col items-center p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mb-1">
                        <span className="text-white text-xs font-bold">W</span>
                      </div>
                      <span className="text-xs">WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleShare('facebook')}
                      className="flex flex-col items-center p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mb-1">
                        <span className="text-white text-xs font-bold">f</span>
                      </div>
                      <span className="text-xs">Facebook</span>
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className="flex flex-col items-center p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center mb-1">
                        <span className="text-white text-xs font-bold">𝕏</span>
                      </div>
                      <span className="text-xs">Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare('copy')}
                      className="flex flex-col items-center p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center mb-1">
                        <Copy className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-xs">Copy</span>
                    </button>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  Save to Watch Later
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Link>
      
      <CardContent className={`${compact ? 'p-2' : 'p-2.5 sm:p-3'} video-card`}>
        <div className="flex gap-2 sm:gap-2.5">
          {showChannel && (
            <Link to={`/@${video.owner?.username}`} className="flex-shrink-0">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                <AvatarImage src={video.owner?.avatar} alt={video.owner?.username} />
                <AvatarFallback className="text-xs">
                  {video.owner?.username?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
          
          <div className="flex-1 min-w-0">
            <Link to={`/video/${video.id}`}>
              <h3 className={`font-medium line-clamp-2 hover:text-primary text-card-foreground leading-snug mb-1 ${
                compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
              }`}>
                {video.title}
              </h3>
            </Link>
            
            {showChannel && (
              <Link to={`/@${video.owner?.username}`}>
                <p className="text-[11px] sm:text-xs text-muted-foreground hover:text-foreground truncate video-channel mb-0.5">
                  {video.owner?.username}
                </p>
              </Link>
            )}
            
            <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground gap-1">
              {showViews && (
                <>
                  <span className="video-views">{formatViews(video.views)} views</span>
                  <span>•</span>
                </>
              )}
              <span>{formatDate(video.createdAt)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Success/Error Message */}
      {message && (
        <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
          {message}
        </div>
      )}
      
      {/* Playlist Modal */}
      <PlaylistModal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        videoId={video.id}
        onSuccess={handlePlaylistSuccess}
      />
    </Card>
  )
}

export default VideoCard