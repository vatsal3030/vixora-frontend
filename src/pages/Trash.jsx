import { useState, useEffect } from 'react'
import { tweetService, videoService } from '../api/services'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Trash2, RotateCcw, MessageSquare, Video, PlaySquare } from 'lucide-react'
import { formatDate } from '../utils/formatDate'
import { formatDuration } from '../utils/videoUtils'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/Loader'
import { toast } from 'sonner'

const Trash = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('videos')
  const [deletedTweets, setDeletedTweets] = useState([])
  const [deletedVideos, setDeletedVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useDocumentTitle('Trash')

  useEffect(() => {
    fetchDeletedContent()
  }, [activeTab])

  const fetchDeletedContent = async () => {
    try {
      setLoading(true)
      if (activeTab === 'tweets') {
        const response = await tweetService.getDeletedTweets()
        const tweetsData = response?.data?.data || []
        setDeletedTweets(Array.isArray(tweetsData) ? tweetsData : [])
      } else if (activeTab === 'videos' || activeTab === 'shorts') {
        const response = await videoService.getDeletedVideos()
        const videosData = response?.data?.data || []
        const allVideos = Array.isArray(videosData) ? videosData : []
        
        if (activeTab === 'videos') {
          setDeletedVideos(allVideos.filter(video => !video.isShort))
        } else {
          setDeletedVideos(allVideos.filter(video => video.isShort))
        }
      }
    } catch (error) {
      console.error('Error fetching deleted content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (itemId, type) => {
    try {
      if (type === 'tweet') {
        await tweetService.restoreTweet(itemId)
        setDeletedTweets(prev => prev.filter(item => item.id !== itemId))
        toast.success('Tweet restored successfully')
      } else if (type === 'video') {
        await videoService.restoreVideo(itemId)
        setDeletedVideos(prev => prev.filter(item => item.id !== itemId))
        toast.success('Video restored successfully')
      }
    } catch (error) {
      toast.error('Failed to restore item')
      console.error('Error restoring item:', error)
    }
  }

  const handlePermanentDelete = async (itemId, type) => {
    if (!confirm('Are you sure? This will permanently delete the item and cannot be undone.')) return
    
    try {
      console.log('Permanent delete not implemented yet')
    } catch (error) {
      console.error('Error permanently deleting item:', error)
    }
  }

  const tabs = [
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'shorts', label: 'Shorts', icon: PlaySquare },
    { id: 'tweets', label: 'Tweets', icon: MessageSquare },
  ]

  const renderDeletedVideos = () => {
    if (deletedVideos.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <Trash2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No deleted {activeTab}
            </h3>
            <p className="text-muted-foreground">
              Deleted {activeTab} will appear here for 7 days before being permanently removed.
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deletedVideos.map((video) => (
          <Card key={video.id} className="border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="relative aspect-video bg-muted rounded-lg mb-3">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover rounded-lg opacity-75"
                />
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                  {formatDuration(video.duration)}
                </div>
              </div>
              
              <h3 className="font-medium line-clamp-2 mb-2">{video.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Deleted {formatDate(video.updatedAt)}
              </p>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(video.id, 'video')}
                  className="flex-1 text-green-600 hover:text-green-700"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restore
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handlePermanentDelete(video.id, 'video')}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderDeletedTweets = () => {
    if (deletedTweets.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <Trash2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              No deleted tweets
            </h3>
            <p className="text-muted-foreground">
              Deleted tweets will appear here for 7 days before being permanently removed.
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {deletedTweets.map((tweet) => (
          <Card key={tweet.id} className="border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarImage src={user?.avatar} alt={user?.fullName} />
                  <AvatarFallback>
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{user?.fullName}</span>
                      <span className="text-sm text-gray-500">
                        Deleted {formatDate(tweet.updatedAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(tweet.id, 'tweet')}
                        className="text-green-600 hover:text-green-700"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handlePermanentDelete(tweet.id, 'tweet')}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete Forever
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-gray-900 dark:text-gray-100 mb-3 whitespace-pre-wrap">
                    {tweet.content}
                  </p>
                  
                  {tweet.image && (
                    <img 
                      src={tweet.image} 
                      alt="Tweet image" 
                      className="max-h-64 rounded-lg object-cover opacity-75"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderTabContent = () => {
    if (loading) {
      return <Loader />
    }

    switch (activeTab) {
      case 'tweets':
        return renderDeletedTweets()
      case 'videos':
      case 'shorts':
        return renderDeletedVideos()
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Trash</h1>
        <p className="text-muted-foreground">
          Restore or permanently delete your content. Items are automatically deleted after 7 days.
        </p>
      </div>

      <div className="border-b mb-6">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        {renderTabContent()}
      </div>
    </div>
  )
}

export default Trash