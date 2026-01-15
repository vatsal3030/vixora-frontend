import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { feedService, likeService, commentService, subscriptionService } from '../api/services'
import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useSidebar } from '../context/SidebarContext'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { 
  Heart,
  MessageCircle, 
  Share, 
  Volume2,
  VolumeX,
  Copy,
  ExternalLink,
  MoreVertical,
  Plus
} from 'lucide-react'
import { formatDate } from '../utils/formatDate'

const Shorts = () => {
  const { user } = useAuth()
  const { isCollapsed } = useSidebar()
  const [shorts, setShorts] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [showComments, setShowComments] = useState({})
  const [newComment, setNewComment] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [lastTap, setLastTap] = useState(0)
  
  const containerRef = useRef(null)
  const videoRefs = useRef({})
  const observerRef = useRef(null)

  useDocumentTitle(shorts[currentIndex]?.title)

  useEffect(() => {
    const initShorts = async () => {
      await fetchShorts()
      setupIntersectionObserver()
    }
    initShorts()
    
    // Keyboard controls
    const handleKeyPress = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault()
        const currentVideo = videoRefs.current[shorts[currentIndex]?.id]
        if (currentVideo) {
          if (currentVideo.paused) {
            currentVideo.play()
          } else {
            currentVideo.pause()
          }
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [currentIndex, shorts])

  const fetchShorts = useCallback(async (page = 1) => {
    if (loading || !hasMore) return
    
    try {
      setLoading(true)
      const response = await feedService.getShortsFeed({ page, limit: 10 })
      const shortsData = response?.data?.data?.shorts || response?.data?.data?.videos || response?.data?.data || []
      const newShorts = Array.isArray(shortsData) ? shortsData : []
      
      if (page === 1) {
        setShorts(newShorts)
      } else {
        setShorts(prev => [...prev, ...newShorts])
      }
      
      setHasMore(newShorts.length === 10)
    } catch (error) {
      // Error fetching shorts
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore])

  const setupIntersectionObserver = useCallback(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoId = entry.target.dataset.videoId
          const video = videoRefs.current[videoId]
          
          if (entry.isIntersecting) {
            if (video) {
              video.play().catch(() => {})
              const index = shorts.findIndex(s => s.id === videoId)
              setCurrentIndex(index)
            }
          } else {
            if (video) {
              video.pause()
            }
          }
        })
      },
      { threshold: 0.7 }
    )
  }, [])

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        const nextPage = Math.floor(shorts.length / 10) + 1
        fetchShorts(nextPage)
      }
    }
  }, [shorts.length, loading, hasMore])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  useEffect(() => {
    // Observe all video elements
    shorts.forEach((short) => {
      const videoElement = videoRefs.current[short.id]
      if (videoElement && observerRef.current) {
        observerRef.current.observe(videoElement)
      }
    })
  }, [shorts])

  const handleLike = useCallback(async (videoId) => {
    try {
      await likeService.toggleVideoLike(videoId)
      setShorts(prev => prev.map(short => 
        short.id === videoId 
          ? { 
              ...short, 
              isLiked: !short.isLiked,
              likesCount: short.isLiked 
                ? Math.max((short.likesCount || 0) - 1, 0)
                : (short.likesCount || 0) + 1
            }
          : short
      ))
    } catch (error) {
      // Error toggling like
    }
  }, [])

  const handleSubscribe = useCallback(async (channelId) => {
    try {
      await subscriptionService.toggleSubscription(channelId)
      setShorts(prev => prev.map(short => 
        short.owner?.id === channelId 
          ? { 
              ...short, 
              owner: {
                ...short.owner,
                isSubscribed: !short.owner?.isSubscribed
              }
            }
          : short
      ))
    } catch (error) {
      // Error toggling subscription
    }
  }, [])

  const handleAddComment = async (videoId) => {
    if (!newComment.trim()) return
    
    try {
      const response = await commentService.addComment(videoId, newComment)
      const commentData = response?.data?.data || {}
      
      setShorts(prev => prev.map(short => 
        short.id === videoId 
          ? { 
              ...short, 
              comments: [commentData, ...(short.comments || [])],
              commentsCount: (short.commentsCount || 0) + 1
            }
          : short
      ))
      setNewComment('')
    } catch (error) {
      // Error adding comment
    }
  }

  const handleShare = useCallback((short, platform) => {
    const videoUrl = `${window.location.origin}/video/${short.id}`
    
    switch (platform) {
      case 'whatsapp':
        // WhatsApp works better with URL on separate line
        const whatsappText = `Check out this video: ${short.title}\n\n${videoUrl}`
        window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoUrl)}`, '_blank')
        break
      case 'twitter':
        const twitterText = `Check out this video: ${short.title}`
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(videoUrl)}`, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(videoUrl)
        // You could add a toast notification here
        break
      default:
        break
    }
  }, [])
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev
      Object.values(videoRefs.current).forEach(video => {
        if (video) video.muted = newMuted
      })
      return newMuted
    })
  }, [])

  // Touch gesture handlers
  const handleTouchStart = (e, videoId) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e, videoId) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = (e, videoId) => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
  }

  const handleDoubleTap = (e, videoId) => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      const video = videoRefs.current[videoId]
      if (!video) return
      
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const width = rect.width
      
      if (x < width / 3) {
        video.currentTime = Math.max(0, video.currentTime - 10)
      } else if (x > (width * 2) / 3) {
        video.currentTime = Math.min(video.duration, video.currentTime + 10)
      } else {
        handleLike(videoId)
      }
    }
    setLastTap(now)
  }

  const formatViews = useMemo(() => (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views?.toString() || '0'
  }, [])

  if (shorts.length === 0 && !loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No shorts available</p>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 bg-background overflow-hidden will-change-transform ${
      isCollapsed ? 'sm:pl-16' : 'sm:pl-52 md:pl-56 lg:pl-60'
    } pt-16`} style={{ transition: 'padding-left 0.3s ease-out' }}>
      <div 
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {shorts.map((short, index) => (
          <div 
            key={short.id} 
            className="relative h-screen w-full snap-start flex items-center justify-center"
            onTouchStart={(e) => handleTouchStart(e, short.id)}
            onTouchMove={(e) => handleTouchMove(e, short.id)}
            onTouchEnd={(e) => handleTouchEnd(e, short.id)}
            onClick={(e) => handleDoubleTap(e, short.id)}
          >
            <video
              ref={el => videoRefs.current[short.id] = el}
              data-video-id={short.id}
              src={short.videoFile}
              className="h-full w-auto max-w-full object-contain"
              loop
              muted={isMuted}
              playsInline
              poster={short.thumbnail}
            />
            
            {/* Video Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <div className="flex items-end justify-between">
                <div className="flex-1 mr-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={short.owner?.avatar} alt={short.owner?.fullName} />
                      <AvatarFallback className="bg-gray-600 text-white">
                        {short.owner?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {short.owner?.fullName}
                      </p>
                      <p className="text-gray-300 text-xs">
                        {formatViews(short.views)} views • {formatDate(short.createdAt)}
                      </p>
                    </div>
                    {short.owner?.id !== user?.id && (
                      <Button
                        size="sm"
                        variant={short.owner?.isSubscribed ? "secondary" : "default"}
                        onClick={() => handleSubscribe(short.owner?.id)}
                        className="ml-2"
                      >
                        {short.owner?.isSubscribed ? 'Subscribed' : 'Subscribe'}
                      </Button>
                    )}
                  </div>
                  
                  <h2 className="text-white font-semibold text-base mb-1">
                    {short.title}
                  </h2>
                  
                  {short.description && (
                    <p className="text-gray-300 text-sm line-clamp-2 mb-2">
                      {short.description}
                    </p>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col items-center space-y-4">
                  <button
                    onClick={() => handleLike(short.id)}
                    className="flex flex-col items-center space-y-1"
                  >
                    <div className={`p-3 rounded-full ${short.isLiked ? 'bg-red-600' : 'bg-gray-600/80'}`}>
                      <Heart className={`h-6 w-6 ${short.isLiked ? 'text-white fill-current' : 'text-white'}`} />
                    </div>
                    <span className="text-white text-xs">{formatViews(short.likesCount || 0)}</span>
                  </button>
                  
                  <button
                    onClick={() => setShowComments(prev => ({ ...prev, [short.id]: !prev[short.id] }))}
                    className="flex flex-col items-center space-y-1"
                  >
                    <div className="p-3 rounded-full bg-gray-600/80">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-white text-xs">{formatViews(short.commentsCount || 0)}</span>
                  </button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex flex-col items-center space-y-1">
                        <div className="p-3 rounded-full bg-gray-600/80">
                          <Share className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-white text-xs">Share</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <div className="p-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleShare(short, 'whatsapp')}
                            className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
                              <span className="text-white text-xs font-bold">W</span>
                            </div>
                            <span className="text-xs">WhatsApp</span>
                          </button>
                          <button
                            onClick={() => handleShare(short, 'facebook')}
                            className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mb-1">
                              <span className="text-white text-xs font-bold">f</span>
                            </div>
                            <span className="text-xs">Facebook</span>
                          </button>
                          <button
                            onClick={() => handleShare(short, 'twitter')}
                            className="flex flex-col items-center p-3 rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center mb-1">
                              <span className="text-white text-xs font-bold">𝕏</span>
                            </div>
                            <span className="text-xs">Twitter</span>
                          </button>
                          <button
                            onClick={() => handleShare(short, 'copy')}
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
                      <button className="flex flex-col items-center space-y-1">
                        <div className="p-3 rounded-full bg-gray-600/80">
                          <MoreVertical className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-white text-xs">More</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Plus className="mr-2 h-4 w-4" />
                        Add to playlist
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Save to Watch Later
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Report
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <button
                    onClick={toggleMute}
                    className="flex flex-col items-center space-y-1"
                  >
                    <div className="p-3 rounded-full bg-gray-600/80">
                      {isMuted ? <VolumeX className="h-6 w-6 text-white" /> : <Volume2 className="h-6 w-6 text-white" />}
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Comments Panel */}
            {showComments[short.id] && (
              <div className="absolute right-0 top-0 bottom-0 w-80 bg-background/95 backdrop-blur-sm p-4 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Comments</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComments(prev => ({ ...prev, [short.id]: false }))}
                  >
                    ×
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.fullName} />
                      <AvatarFallback>{user?.fullName?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="min-h-[60px] resize-none"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddComment(short.id)}
                        disabled={!newComment.trim()}
                        className="mt-2"
                      >
                        Comment
                      </Button>
                    </div>
                  </div>
                  
                  {short.comments?.map((comment) => (
                    <div key={comment.id} className="flex space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.owner?.avatar} alt={comment.owner?.fullName} />
                        <AvatarFallback>{comment.owner?.fullName?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-foreground">{comment.owner?.fullName}</p>
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(comment.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Shorts