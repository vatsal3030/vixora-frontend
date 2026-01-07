import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { videoService, commentService, likeService, subscriptionService, watchHistoryService } from '../api/services'
import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Card, CardContent } from '../components/ui/card'
import CustomVideoPlayer from '../components/CustomVideoPlayer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { ThumbsUp, Share, Bell, Eye, MoreVertical, Copy } from 'lucide-react'
import { formatDate } from '../utils/formatDate'
import Loader from '../components/Loader'

const Video = () => {
  const { videoId } = useParams()
  const { user } = useAuth()
  const [video, setVideo] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [notificationLevel, setNotificationLevel] = useState('NONE')
  const [watchProgress, setWatchProgress] = useState(0)
  const [commentSort, setCommentSort] = useState('latest')
  const hasResumed = useRef(false)

  useDocumentTitle(video?.title)

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
      console.log('No previous watch progress found')
    }
  }

  const fetchVideo = async () => {
    try {
      const response = await videoService.getVideo(videoId)
      const videoData = response?.data?.data || {}
      setVideo(videoData)
      setIsLiked(videoData.isLiked || false)
    } catch (error) {
      console.error('Error fetching video:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriptionStatus = async () => {
    if (!user?.id || !video?.owner?.id) return
    
    try {
      const response = await subscriptionService.getSubscriptionStatus(video.owner.id)
      const data = response?.data?.data || {}
      setIsSubscribed(data.isSubscribed || false)
      setNotificationLevel(data.notificationLevel || 'NONE')
    } catch (error) {
      console.error('Error fetching subscription status:', error)
    }
  }

  const fetchComments = async () => {
    try {
      const response = await commentService.getComments(videoId)
      const commentsData = response?.data?.data || []
      const sortedComments = sortComments(Array.isArray(commentsData) ? commentsData : [])
      setComments(sortedComments)
    } catch (error) {
      console.error('Error fetching comments:', error)
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
    } catch (error) {
      console.error('Error toggling like:', error)
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
    } catch (error) {
      console.error('Error toggling subscription:', error)
    }
  }

  const handleNotificationChange = async (level) => {
    try {
      await subscriptionService.setNotificationLevel(video.owner.id, level)
      setNotificationLevel(level)
    } catch (error) {
      console.error('Error updating notification level:', error)
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
    } catch (error) {
      console.error('Error adding comment:', error)
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
    } catch (error) {
      console.error('Failed to save progress:', error)
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

  if (loading) {
    return <Loader />
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Video not found</p>
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

          {/* Recommended Videos Sidebar - Desktop Only */}
          <div className="hidden xl:block xl:col-span-1">
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
    </div>
  )
}

export default Video