import { useState, useEffect } from 'react'
import { tweetService } from '../api/services'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Trash2, RotateCcw, MessageSquare, Video, PlaySquare } from 'lucide-react'
import { formatDate } from '../utils/formatDate'
import { useAuth } from '../hooks/useAuth'
import Loader from '../components/Loader'

const Trash = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('videos')
  const [deletedTweets, setDeletedTweets] = useState([])
  const [loading, setLoading] = useState(true)

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
      }
      // TODO: Add other content types when backend supports them
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
      }
      // TODO: Add restore for other content types
    } catch (error) {
      console.error('Error restoring item:', error)
    }
  }

  const handlePermanentDelete = async (itemId, type) => {
    if (!confirm('Are you sure? This will permanently delete the item and cannot be undone.')) return
    
    try {
      // TODO: Implement permanent delete endpoints
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
              Deleted tweets will appear here for 30 days before being permanently removed.
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

  const renderPlaceholder = (type) => (
    <Card>
      <CardContent className="p-12 text-center">
        <Trash2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">
          No deleted {type}
        </h3>
        <p className="text-muted-foreground">
          Deleted {type} will appear here when available.
        </p>
      </CardContent>
    </Card>
  )

  const renderTabContent = () => {
    if (loading) {
      return <Loader />
    }

    switch (activeTab) {
      case 'tweets':
        return renderDeletedTweets()
      case 'videos':
        return renderPlaceholder('videos')
      case 'shorts':
        return renderPlaceholder('shorts')
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Trash</h1>
        <p className="text-muted-foreground">
          Restore or permanently delete your content. Items are automatically deleted after 30 days.
        </p>
      </div>

      {/* Tabs */}
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

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  )
}

export default Trash