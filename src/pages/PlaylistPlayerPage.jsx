import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { playlistService, videoService, commentService, likeService, subscriptionService, watchHistoryService } from '../api/services'
import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Card, CardContent } from '../components/ui/card'
import CustomVideoPlayer from '../components/CustomVideoPlayer'
import PermissionDialog from '../components/common/PermissionDialog'
import ButtonPrimary from '../components/ui/ButtonPrimary'
import ButtonSecondary from '../components/ui/ButtonSecondary'
import ButtonIcon from '../components/ui/ButtonIcon'
import { ThumbsUp, Share, Bell, Eye, MoreVertical, Copy, Volume2, X, ChevronDown, ChevronUp, Edit2, Trash2, Globe, Lock, Clock, ListPlus, Share2 } from 'lucide-react'
import { formatDate } from '../utils/formatDate'
import Loader from '../components/Loader'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'

const PlaylistPlayerPage = () => {
  const { playlistId } = useParams()
  const navigate = useNavigate()
  const [playlist, setPlaylist] = useState(null)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const { user } = useAuth()
  const [video, setVideo] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [videoLoading, setVideoLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [notificationLevel, setNotificationLevel] = useState('NONE')
  const [watchProgress, setWatchProgress] = useState(0)
  const [commentSort, setCommentSort] = useState('latest')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(true)
  const [videoMenuOpen, setVideoMenuOpen] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const hasResumed = useRef(false)

  const videoId = playlist?.videos?.[currentVideoIndex]?.id
  const isOwner = user?.id === playlist?.ownerId

  useDocumentTitle(video?.title || 'Playlist')

  useEffect(() => {
    if (playlistId) {
      fetchPlaylist()
    }
  }, [playlistId])

  useEffect(() => {
    if (videoId) {
      fetchVideo()
      fetchComments()
      fetchWatchProgress()
    }
  }, [videoId])

  useEffect(() => {
    if (video?.owner?.id && user?.id) {
      fetchSubscriptionStatus()
    }
  }, [video?.owner?.id, user?.id])

  const fetchWatchProgress = async () => {
    try {
      const response = await watchHistoryService.getWatchProgress(videoId)
      const progress = response?.data?.data?.progress || 0
      setWatchProgress(progress)
    } catch (error) {
      // No previous watch progress found
    }
  }

  const fetchPlaylist = async () => {
    try {
      setLoading(true)
      const response = await playlistService.getPlaylist(playlistId)
      const data = response.data.data
      const uniqueVideos = data.videos?.reduce((acc, video) => {
        if (!acc.find(v => v.id === video.id)) acc.push(video)
        return acc
      }, []) || []
      setPlaylist({ ...data, videos: uniqueVideos })
    } catch (error) {
      toast.error('Failed to load playlist')
      navigate('/playlists')
    } finally {
      setLoading(false)
    }
  }

  const fetchVideo = async () => {
    if (!videoId) return
    try {
      setVideoLoading(true)
      const response = await videoService.getVideo(videoId)
      const videoData = response?.data?.data || {}
      setVideo(videoData)
      setIsLiked(videoData.isLiked || false)
    } catch {
      // Ignore fetch errors; loading and fallback UI handle the state.
    } finally {
      setVideoLoading(false)
    }
  }

  const fetchSubscriptionStatus = async () => {
    if (!user?.id || !video?.owner?.id) return
    
    try {
      const response = await subscriptionService.getSubscriptionStatus(video.owner.id)
      const data = response?.data?.data || {}
      setIsSubscribed(data.isSubscribed || false)
      setNotificationLevel(data.notificationLevel || 'NONE')
    } catch {
      // Ignore subscription status errors and keep existing values.
    }
  }

  const fetchComments = async () => {
    try {
      const response = await commentService.getComments(videoId)
      const commentsData = response?.data?.data || []
      const sortedComments = sortComments(Array.isArray(commentsData) ? commentsData : [])
      setComments(sortedComments)
    } catch {
      // Ignore comments fetch errors and keep existing comments.
    }
  }

  const sortComments = (commentsArray) => {
    return [...commentsArray].sort((a, b) => {
      if (commentSort === 'latest') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt)
      }
    })
  }

  useEffect(() => {
    if (comments.length > 0) {
      setComments(sortComments(comments))
    }
  }, [commentSort])

  const handleLike = async () => {
    try {
      await likeService.toggleVideoLike(videoId)
      const newIsLiked = !isLiked
      setIsLiked(newIsLiked)
      setVideo(prev => ({
        ...prev,
        likesCount: newIsLiked ? (prev.likesCount || 0) + 1 : Math.max((prev.likesCount || 0) - 1, 0),
        isLiked: newIsLiked
      }))
    } catch {
      setIsLiked(isLiked)
    }
  }

  const handleSubscribe = async () => {
    try {
      const response = await subscriptionService.toggleSubscription(video.owner.id)
      const data = response?.data?.data || {}
      setIsSubscribed(data.isSubscribed || false)
      setVideo(prev => ({
        ...prev,
        owner: {
          ...prev.owner,
          subscribersCount: data.subscriberCount || prev.owner.subscribersCount
        }
      }))
      
      // Reset notifications if unsubscribing
      if (!data.isSubscribed) {
        setNotificationLevel('NONE')
      }
    } catch {
      // Ignore subscription toggle errors.
    }
  }

  const handleNotificationChange = async (level) => {
    try {
      await subscriptionService.setNotificationLevel(video.owner.id, level)
      setNotificationLevel(level)
    } catch {
      // Ignore notification update errors.
    }
  }

  const handleShare = (platform) => {
    const videoUrl = `${window.location.origin}/video/${videoId}`
    
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
        break
      default:
        break
    }
  }
  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      setCommentLoading(true)
      const response = await commentService.addComment(videoId, newComment)
      const commentData = response?.data?.data || {}
      const newCommentObj = {
        id: commentData.id || commentData._id,
        content: commentData.content || newComment,
        createdAt: commentData.createdAt || new Date().toISOString(),
        owner: commentData.owner || {
          id: user?.id,
          fullName: user?.fullName,
          avatar: user?.avatar
        },
        ...commentData
      }
      
      setComments(prev => [newCommentObj, ...prev])
      setNewComment('')
      setVideo(prev => ({
        ...prev,
        commentsCount: (prev.commentsCount || 0) + 1
      }))
    } catch {
      // Ignore comment submission errors.
    } finally {
      setCommentLoading(false)
    }
  }

  const handleVideoPlay = () => {
    // Track play event
  }

  const handleVideoPause = () => {
    saveCurrentProgress()
  }

  const handleVideoEnded = () => {
    saveProgressToBackend(100)
    // Auto-play next video in playlist
    if (currentVideoIndex < playlist?.videos?.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1)
    }
  }

  const playVideo = (video, index) => {
    setCurrentVideoIndex(index)
  }

  const handleRemoveVideo = async (videoId) => {
    try {
      await playlistService.removeVideoFromPlaylist(videoId, playlistId)
      setPlaylist(prev => ({ ...prev, videos: prev.videos.filter(v => v.id !== videoId) }))
      toast.success('Video removed from playlist')
      if (currentVideoIndex >= playlist.videos.length - 1) {
        setCurrentVideoIndex(Math.max(0, playlist.videos.length - 2))
      }
    } catch (error) {
      toast.error('Failed to remove video')
    }
  }

  const handleSaveToWatchLater = async (videoId) => {
    try {
      const response = await playlistService.toggleWatchLater(videoId)
      const saved = response?.data?.data?.saved
      toast.success(saved ? 'Added to Watch Later' : 'Removed from Watch Later')
    } catch (error) {
      toast.error('Failed to update Watch Later')
    }
  }

  const handleShareVideo = (video, platform) => {
    const videoUrl = `${window.location.origin}/video/${video.id}`
    
    switch (platform) {
      case 'whatsapp':
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
        toast.success('Link copied to clipboard')
        break
      default:
        break
    }
    setVideoMenuOpen(null)
  }

  const handleSharePlaylist = (platform) => {
    if (!playlist?.isPublic) {
      toast.error('Only public playlists can be shared')
      return
    }
    
    const playlistUrl = `${window.location.origin}/playlist/${playlistId}`
    
    switch (platform) {
      case 'whatsapp':
        const whatsappText = `Check out this playlist: ${playlist.name}\n\n${playlistUrl}`
        window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(playlistUrl)}`, '_blank')
        break
      case 'twitter':
        const twitterText = `Check out this playlist: ${playlist.name}`
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(playlistUrl)}`, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(playlistUrl)
        toast.success('Playlist link copied to clipboard')
        break
      default:
        break
    }
  }

  const handleDeletePlaylist = async () => {
    setDeleteDialogOpen(false)
    try {
      await playlistService.deletePlaylist(playlistId)
      toast.success('Playlist deleted successfully')
      navigate('/playlists')
    } catch (error) {
      toast.error('Failed to delete playlist')
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTotalDuration = (seconds) => {
    if (!seconds || seconds === 0) return '0s'
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}m`
    } else if (mins > 0) {
      return `${mins}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const handleTimeUpdate = () => {
    // Progress tracking handled by CustomVideoPlayer
  }

  const saveCurrentProgress = () => {
    // Progress saving handled by parent
  }

  const saveProgressToBackend = async (progress) => {
    try {
      await watchHistoryService.saveWatchProgress({
        videoId,
        progress: Math.round(progress),
        duration: Math.round(video?.duration || 0)
      })
    } catch {
      // Ignore progress save errors.
    }
  }

  // Save progress when user leaves
  useEffect(() => {
    const handleBeforeUnload = () => saveCurrentProgress()
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      saveCurrentProgress()
    }
  }, [])

  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views?.toString() || '0'
  }

  if (loading || videoLoading) {
    return (
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            {/* Main Video Column Skeleton */}
            <div className="xl:col-span-2">
              {/* Video Player Skeleton */}
              <div className="w-full aspect-video bg-muted rounded-none sm:rounded-lg mb-3 sm:mb-4 animate-pulse" />

              {/* Title Skeleton */}
              <div className="h-6 bg-muted rounded w-3/4 mb-2 px-4 sm:px-0 animate-pulse" />

              {/* Stats Skeleton */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 px-4 sm:px-0">
                <div className="h-4 bg-muted rounded w-40 animate-pulse" />
                <div className="flex items-center gap-2">
                  <div className="h-10 w-24 bg-muted rounded-full animate-pulse" />
                  <div className="h-10 w-24 bg-muted rounded-full animate-pulse" />
                  <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                </div>
              </div>

              {/* Channel Card Skeleton */}
              <Card className="mb-4 mx-3 sm:mx-0 bg-card/50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                        <div className="h-3 bg-muted rounded w-24 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-9 w-24 bg-muted rounded-full animate-pulse" />
                  </div>
                </CardContent>
              </Card>

              {/* Description Skeleton */}
              <Card className="mb-4 mx-3 sm:mx-0 bg-card/50">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-full animate-pulse" />
                    <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-4/6 animate-pulse" />
                  </div>
                </CardContent>
              </Card>

              {/* Comments Skeleton */}
              <div className="block px-3 sm:px-0">
                <Card className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="h-5 bg-muted rounded w-32 mb-4 animate-pulse" />
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/4 animate-pulse" />
                            <div className="h-4 bg-muted rounded w-full animate-pulse" />
                            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="hidden xl:block xl:col-span-1">
              {/* Playlist Skeleton */}
              <Card className="mb-4">
                <CardContent className="p-0">
                  <div className="p-4 border-b">
                    <div className="h-5 bg-muted rounded w-3/4 mb-2 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-1/2 mb-1 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                  </div>
                  <div className="p-3 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="w-6 h-6 bg-muted rounded animate-pulse" />
                        <div className="w-24 h-16 bg-muted rounded animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-full animate-pulse" />
                          <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommended Skeleton */}
              <Card>
                <CardContent className="p-4">
                  <div className="h-5 bg-muted rounded w-32 mb-4 animate-pulse" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex gap-2">
                        <div className="w-40 h-24 bg-muted rounded animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-full animate-pulse" />
                          <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                          <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="w-full">
      {/* Video Player & Primary Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Main Video Column */}
          <div className="xl:col-span-2">
            {/* Video Player - Optimized for Mobile */}
            <CustomVideoPlayer
              src={video.videoFile}
              poster={video.thumbnail}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onEnded={handleVideoEnded}
              onTimeUpdate={handleTimeUpdate}
              autoResume={watchProgress > 5}
              resumeTime={(watchProgress / 100) * (video.duration || 0)}
              className="w-full aspect-video rounded-none sm:rounded-lg overflow-hidden mb-3 sm:mb-4"
            />

            {/* Video Title - Mobile Optimized */}
            <h1 className="text-lg font-semibold mb-2 px-4 sm:px-0 leading-snug">
              {video.title}
            </h1>
            
            {/* Video Stats & Actions - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 px-4 sm:px-0">
              {/* Views and Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatViews(video.views)} views</span>
                <span>•</span>
                <span>{formatDate(video.createdAt)}</span>
              </div>

              {/* Action Buttons - Mobile Optimized */}
              <div className="flex items-center gap-2">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-2 h-10 px-4 text-sm rounded-full bg-secondary hover:bg-secondary/80 ${isLiked ? 'text-primary' : ''}`}
                >
                  <ThumbsUp className="h-5 w-5" />
                  <span>{video.likesCount || 0}</span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 px-4 text-sm rounded-full bg-secondary hover:bg-secondary/80 flex items-center gap-2">
                      <Share className="h-5 w-5" />
                      Share
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="p-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
                            <span className="text-white text-xs font-bold">W</span>
                          </div>
                          <span className="text-xs">WhatsApp</span>
                        </button>
                        <button
                          onClick={() => handleShare('facebook')}
                          className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-1">
                            <span className="text-white text-xs font-bold">f</span>
                          </div>
                          <span className="text-xs">Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center mb-1">
                            <span className="text-white text-xs font-bold">𝕏</span>
                          </div>
                          <span className="text-xs">Twitter</span>
                        </button>
                        <button
                          onClick={() => handleShare('copy')}
                          className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mb-1">
                            <Copy className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-xs">Copy Link</span>
                        </button>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-10 w-10 p-0 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      Save to Watch Later
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Channel Info Card - Mobile Optimized */}
            <Card className="mb-4 mx-3 sm:mx-0 bg-card/50">
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={video.owner?.avatar} alt={video.owner?.username} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {video.owner?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col justify-center">
                      <h3 className="font-semibold text-[15px] text-foreground truncate leading-tight">
                        {video.owner?.username}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {video.owner?.subscribersCount || 0} subscribers
                      </p>
                    </div>
                  </div>

                  {video.owner?.id !== user?.id && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleSubscribe}
                        variant={isSubscribed ? "outline" : "default"}
                        size="sm"
                        className={`flex-shrink-0 h-9 px-6 rounded-full font-semibold flex items-center gap-2 ${
                          isSubscribed ? 'bg-secondary hover:bg-secondary/80' : 'bg-primary hover:bg-primary/90'
                        }`}
                      >
                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                      </Button>
                      
                      {isSubscribed && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 px-3 rounded-full flex items-center space-x-1"
                            >
                              <Bell className={`h-4 w-4 ${notificationLevel !== 'NONE' ? 'fill-current' : ''}`} />
                              <span className="text-xs">
                                {notificationLevel === 'ALL' ? 'All' : 
                                 notificationLevel === 'PERSONALIZED' ? 'Personalized' : 'None'}
                              </span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleNotificationChange('ALL')}
                              className={notificationLevel === 'ALL' ? 'bg-accent' : ''}
                            >
                              <Bell className="h-4 w-4 mr-2 fill-current" />
                              All notifications
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleNotificationChange('PERSONALIZED')}
                              className={notificationLevel === 'PERSONALIZED' ? 'bg-accent' : ''}
                            >
                              <Bell className="h-4 w-4 mr-2" />
                              Personalized
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleNotificationChange('NONE')}
                              className={notificationLevel === 'NONE' ? 'bg-accent' : ''}
                            >
                              <Bell className="h-4 w-4 mr-2 opacity-50" />
                              None
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description - Mobile Optimized */}
            {video.description && (
              <Card className="mb-4 mx-3 sm:mx-0 bg-card/50">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3 sm:line-clamp-none leading-relaxed">
                    {video.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Comments Section - Mobile Optimized */}
            <div className="block px-3 sm:px-0">
              <Card className="bg-card/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-base mb-3">
                    {comments.length} Comments
                  </h3>

                  {/* Comment Sort */}
                  <div className="flex items-center justify-between mb-4">
                    <select 
                      value={commentSort} 
                      onChange={(e) => setCommentSort(e.target.value)}
                      className="text-sm border rounded-lg px-4 py-2 bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="latest">Latest first</option>
                      <option value="oldest">Oldest first</option>
                    </select>
                  </div>

                  {/* Add Comment */}
                  {user && (
                    <form onSubmit={handleAddComment} className="mb-6">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={user?.avatar} alt={user?.username} />
                          <AvatarFallback>
                            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="min-h-[60px] resize-none text-sm bg-transparent border-0 border-b focus-visible:ring-0 focus-visible:border-primary"
                          />
                          <div className="flex justify-end mt-2">
                            <Button
                              type="submit"
                              size="sm"
                              disabled={!newComment.trim() || commentLoading}
                            >
                              {commentLoading ? 'Posting...' : 'Comment'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={comment.owner?.avatar} alt={comment.owner?.username} />
                          <AvatarFallback>
                            {comment.owner?.username?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-foreground">
                              {comment.owner?.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground break-words leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Playlist Sidebar + Recommended - Desktop Only */}
          <div className="hidden xl:block xl:col-span-1">
            {/* Playlist Sidebar */}
            <Card className="mb-4">
              <CardContent className="p-0">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold line-clamp-1 flex-1">{playlist?.name}</h2>
                    <Button variant="ghost" size="sm" onClick={() => setShowPlaylist(!showPlaylist)} className="h-8 w-8 p-0">
                      {showPlaylist ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <span>{playlist?.owner?.fullName || playlist?.owner?.username}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      {playlist?.isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                      <span>{playlist?.isPublic ? 'Public' : 'Private'}</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {playlist?.videoCount || playlist?.videos?.length || 0} videos • {formatTotalDuration(playlist?.totalDuration || 0)}
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Updated {formatDate(playlist?.updatedAt)}
                  </div>

                  {isOwner && !playlist?.isWatchLater && (
                    <div className="flex flex-wrap items-center gap-2">
                      <ButtonSecondary onClick={() => setEditDialogOpen(true)} className="flex items-center gap-1">
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </ButtonSecondary>
                      <ButtonSecondary onClick={() => setDeleteDialogOpen(true)} className="flex items-center gap-1 text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </ButtonSecondary>
                    </div>
                  )}

                  {!playlist?.isWatchLater && playlist?.isPublic && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1 mt-2">
                          <Share2 className="h-3 w-3" />
                          Share Playlist
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-48">
                        <div className="p-2">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => handleSharePlaylist('whatsapp')}
                              className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors"
                            >
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
                                <span className="text-white text-xs font-bold">W</span>
                              </div>
                              <span className="text-xs">WhatsApp</span>
                            </button>
                            <button
                              onClick={() => handleSharePlaylist('facebook')}
                              className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors"
                            >
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-1">
                                <span className="text-white text-xs font-bold">f</span>
                              </div>
                              <span className="text-xs">Facebook</span>
                            </button>
                            <button
                              onClick={() => handleSharePlaylist('twitter')}
                              className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors"
                            >
                              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center mb-1">
                                <span className="text-white text-xs font-bold">𝕏</span>
                              </div>
                              <span className="text-xs">Twitter</span>
                            </button>
                            <button
                              onClick={() => handleSharePlaylist('copy')}
                              className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors"
                            >
                              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mb-1">
                                <Copy className="h-4 w-4 text-white" />
                              </div>
                              <span className="text-xs">Copy Link</span>
                            </button>
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {showPlaylist && (
                  <div className="max-h-[400px] overflow-y-auto">
                    {!playlist?.videos || playlist.videos.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No videos in this playlist
                      </div>
                    ) : (
                      playlist.videos.map((video, index) => (
                      <div
                        key={`${video.id}-${index}`}
                        className={`flex gap-2 p-3 transition group relative ${currentVideoIndex === index ? 'bg-muted' : 'hover:bg-muted/50'}`}
                      >
                        <div 
                          className="flex gap-2 flex-1 cursor-pointer"
                          onClick={() => playVideo(video, index)}
                        >
                          <div className="flex items-center justify-center w-6 text-sm text-muted-foreground">
                            {currentVideoIndex === index ? <Volume2 className="h-4 w-4 text-primary" /> : <span>{index + 1}</span>}
                          </div>

                          <div className="relative w-24 aspect-video rounded overflow-hidden flex-shrink-0">
                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                            <div className="absolute bottom-1 right-1 bg-black/80 px-1 text-xs text-white rounded">
                              {formatDuration(video.duration)}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium line-clamp-2 ${currentVideoIndex === index ? 'text-primary' : ''}`}>
                              {video.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">{video.owner?.username}</p>
                            <p className="text-xs text-muted-foreground">{formatViews(video.views)} views</p>
                          </div>
                        </div>

                        <DropdownMenu open={videoMenuOpen === video.id} onOpenChange={(open) => setVideoMenuOpen(open ? video.id : null)}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 p-1 h-auto absolute right-2 top-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {isOwner && !playlist?.isWatchLater && (
                              <>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveVideo(video.id)
                                    setVideoMenuOpen(null)
                                  }}
                                  className="text-red-500"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Remove from playlist
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSaveToWatchLater(video.id)
                                setVideoMenuOpen(null)
                              }}
                            >
                              <Clock className="h-4 w-4 mr-2" />
                              Save to Watch Later
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                setVideoMenuOpen(null)
                              }}
                            >
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <div className="px-2 py-1">
                              <div className="grid grid-cols-2 gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleShareVideo(video, 'whatsapp')
                                  }}
                                  className="flex flex-col items-center p-2 rounded-lg hover:bg-accent transition-colors"
                                >
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mb-1">
                                    <span className="text-white text-[10px] font-bold">W</span>
                                  </div>
                                  <span className="text-[10px]">WhatsApp</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleShareVideo(video, 'facebook')
                                  }}
                                  className="flex flex-col items-center p-2 rounded-lg hover:bg-accent transition-colors"
                                >
                                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mb-1">
                                    <span className="text-white text-[10px] font-bold">f</span>
                                  </div>
                                  <span className="text-[10px]">Facebook</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleShareVideo(video, 'twitter')
                                  }}
                                  className="flex flex-col items-center p-2 rounded-lg hover:bg-accent transition-colors"
                                >
                                  <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center mb-1">
                                    <span className="text-white text-[10px] font-bold">𝕏</span>
                                  </div>
                                  <span className="text-[10px]">Twitter</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleShareVideo(video, 'copy')
                                  }}
                                  className="flex flex-col items-center p-2 rounded-lg hover:bg-accent transition-colors"
                                >
                                  <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center mb-1">
                                    <Copy className="h-3 w-3 text-white" />
                                  </div>
                                  <span className="text-[10px]">Copy</span>
                                </button>
                              </div>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Videos */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Recommended</h3>
                <div className="space-y-3">
                  {/* Skeleton for recommended videos */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-2 animate-pulse">
                      <div className="w-40 h-24 bg-muted rounded flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-3 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Playlist Dialog */}
      {isOwner && (
        <EditPlaylistDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          playlist={playlist}
          onPlaylistUpdated={(updated) => setPlaylist({ ...playlist, ...updated })}
        />
      )}
      {/* Delete Playlist Dialog */}
      <PermissionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeletePlaylist}
        title="Delete Playlist?"
        description={`Are you sure you want to delete "${playlist?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="alert"
      />
    </div>
  )
}

export default PlaylistPlayerPage
