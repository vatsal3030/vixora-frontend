import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { channelService, subscriptionService, playlistService, tweetService } from '../api/services'
import { useAuth } from '../hooks/useAuth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Card, CardContent } from '../components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import VideoGrid from '../components/VideoGrid'
import PlaylistCardSkeleton from '../components/PlaylistCardSkeleton'
import PlaylistCard from '../components/PlaylistCard'
import TweetCard from '../components/TweetCard'
import TweetCreateForm from '../components/TweetCreateForm'
import { Bell, Users, Video as VideoIcon, PlaySquare, List, Info, MessageSquare } from 'lucide-react'

const Channel = ({ username: propUsername }) => {
  const { channelId, username: paramUsername } = useParams()
  const { user } = useAuth()
  const [channel, setChannel] = useState(null)
  const [videos, setVideos] = useState([])
  const [shorts, setShorts] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [tweets, setTweets] = useState([])
  const [tweetsPage, setTweetsPage] = useState(1)
  const [tweetsLoading, setTweetsLoading] = useState(false)
  const [tweetsHasMore, setTweetsHasMore] = useState(true)
  const [tweetSort, setTweetSort] = useState('latest')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('videos')
  const [tabLoading, setTabLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscribersCount, setSubscribersCount] = useState(0)
  const [notificationLevel, setNotificationLevel] = useState('NONE')

  const currentChannelId = channelId || channel?.id
  const currentUsername = propUsername || paramUsername

  useDocumentTitle(channel?.fullName ? `${channel.fullName} - Vidora` : null)

  useEffect(() => {
    if (channelId || currentUsername) {
      fetchChannelData()
    }
  }, [channelId, currentUsername])

  useEffect(() => {
    if (currentChannelId) {
      fetchSubscriptionStatus()
      if (activeTab !== 'videos') {
        fetchTabData()
      }
    }
  }, [activeTab, currentChannelId])

  const fetchChannelData = async () => {
    try {
      setLoading(true)
      
      // Use username route if available, otherwise use ID route
      const channelResponse = currentUsername 
        ? await channelService.getChannelByUsername(currentUsername) 
        : await channelService.getChannel(channelId)
      
      const channelData = channelResponse?.data?.data || {}
      setChannel(channelData)
      
      // Now fetch videos using the channel ID
      const videosResponse = await channelService.getChannelVideos(channelData.id, { isShort: false })
      const videosData = videosResponse?.data?.data?.videos || videosResponse?.data?.data || []
      setVideos(Array.isArray(videosData) ? videosData : [])
      
    } catch (error) {
      console.error('Error fetching channel data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriptionStatus = async () => {
    if (!user?.id || !currentChannelId) return
    
    try {
      const response = await subscriptionService.getSubscriptionStatus(currentChannelId)
      const data = response?.data?.data || {}
      setIsSubscribed(data.isSubscribed || false)
      setNotificationLevel(data.notificationLevel || 'NONE')
    } catch (error) {
      console.error('Error fetching subscription status:', error)
    }
  }

  const fetchTabData = async () => {
    try {
      setTabLoading(true)
      
      if (activeTab === 'shorts') {
        const response = await channelService.getChannelVideos(channel?.id, { isShort: true })
        const shortsData = response?.data?.data?.videos || response?.data?.data || []
        setShorts(Array.isArray(shortsData) ? shortsData : [])
      } else if (activeTab === 'playlists') {
        const response = await channelService.getChannelPlaylists(channel?.id)
        const playlistsData = response?.data?.data || []
        setPlaylists(Array.isArray(playlistsData) ? playlistsData : [])
      } else if (activeTab === 'tweets') {
        await fetchTweets(1, true)
      }
    } catch (error) {
      console.error('Error fetching tab data:', error)
    } finally {
      setTabLoading(false)
    }
  }

  const handleSubscribe = async () => {
    try {
      const response = await subscriptionService.toggleSubscription(channel?.id)
      const data = response?.data?.data || {}
      setIsSubscribed(data.isSubscribed || false)
      
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
      await subscriptionService.setNotificationLevel(channel?.id, level)
      setNotificationLevel(level)
    } catch (error) {
      console.error('Error updating notification level:', error)
    }
  }

  const fetchTweets = async (page = 1, reset = false) => {
    try {
      setTweetsLoading(true)
      const response = await channelService.getChannelTweets(channel?.id, { 
        page, 
        limit: 10,
        sortBy: 'createdAt',
        sortType: tweetSort === 'latest' ? 'desc' : 'asc'
      })
      const tweetsData = response?.data?.data || []
      const tweetsArray = Array.isArray(tweetsData) ? tweetsData : []
      
      if (reset) {
        setTweets(tweetsArray)
        setTweetsPage(1)
      } else {
        setTweets(prev => [...prev, ...tweetsArray])
      }
      
      setTweetsHasMore(tweetsArray.length === 10)
      setTweetsPage(page)
    } catch (error) {
      console.error('Error fetching tweets:', error)
    } finally {
      setTweetsLoading(false)
    }
  }

  const loadMoreTweets = () => {
    if (!tweetsLoading && tweetsHasMore) {
      fetchTweets(tweetsPage + 1, false)
    }
  }

  // Refetch tweets when sort changes
  useEffect(() => {
    if (activeTab === 'tweets' && tweets.length > 0) {
      fetchTweets(1, true)
    }
  }, [tweetSort])

  const tabs = [
    { id: 'videos', label: 'Videos', icon: VideoIcon },
    { id: 'shorts', label: 'Shorts', icon: PlaySquare },
    { id: 'tweets', label: 'Tweets', icon: MessageSquare },
    { id: 'playlists', label: 'Playlists', icon: List },
    { id: 'about', label: 'About', icon: Info },
  ]

  const renderTabContent = () => {
    if (tabLoading) {
      return activeTab === 'playlists' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <PlaylistCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <VideoGrid loading={true} />
      )
    }

    switch (activeTab) {
      case 'videos':
        return videos.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <VideoIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No videos available
              </h3>
            </CardContent>
          </Card>
        ) : (
          <VideoGrid videos={videos} />
        )

      case 'shorts':
        return shorts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <PlaySquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No shorts available
              </h3>
            </CardContent>
          </Card>
        ) : (
          <VideoGrid videos={shorts} />
        )

      case 'playlists':
        return playlists.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <List className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No playlists available
              </h3>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        )

      case 'tweets':
        return (
          <div className="space-y-6">
            {/* Tweet Creation Form - Only show on own channel */}
            {isOwnChannel && (
              <Card>
                <CardContent className="p-6">
                  <TweetCreateForm onTweetCreated={(newTweet) => setTweets(prev => [newTweet, ...prev])} />
                </CardContent>
              </Card>
            )}
            
            {/* Tweet Sorting */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Tweets</h3>
              <select 
                value={tweetSort} 
                onChange={(e) => setTweetSort(e.target.value)}
                className="text-sm border rounded px-3 py-1 bg-background"
              >
                <option value="latest">Latest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
            
            {/* Tweets List */}
            {tweets.length === 0 && !tweetsLoading ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    No tweets available
                  </h3>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tweets.map((tweet) => (
                  <TweetCard 
                    key={tweet.id} 
                    tweet={tweet} 
                    onDelete={(tweetId) => setTweets(prev => prev.filter(t => t.id !== tweetId))}
                  />
                ))}
                
                {/* Load More Button */}
                {tweetsHasMore && (
                  <div className="text-center pt-4">
                    <Button 
                      onClick={loadMoreTweets} 
                      disabled={tweetsLoading}
                      variant="outline"
                    >
                      {tweetsLoading ? 'Loading...' : 'Load More Tweets'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )

      case 'about':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">
                    {channel?.description || 'No description available.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Stats</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>{subscribersCount} subscribers</p>
                      <p>{videos.length} videos</p>
                      <p>Joined {new Date(channel?.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Details</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Username: @{channel?.username}</p>
                      <p>Email: {channel?.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="space-y-6">
          <div className="h-48 bg-muted rounded-lg animate-pulse" />
          <div className="flex items-center space-x-4">
            <div className="h-24 w-24 bg-muted rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted rounded animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!channel) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Channel not found</p>
      </div>
    )
  }

  const isOwnChannel = user?.id === channel?.id

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Channel Header */}
      <div className="mb-8">
        {/* Cover Image */}
        {channel.coverImage && (
          <div className="h-32 sm:h-48 md:h-64 bg-muted rounded-lg overflow-hidden mb-6">
            <img
              src={channel.coverImage}
              alt="Channel cover"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Channel Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32">
            <AvatarImage src={channel.avatar} alt={channel.fullName} />
            <AvatarFallback className="text-xl sm:text-2xl">
              {channel.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              {channel.fullName}
            </h1>
            <p className="text-muted-foreground mb-2">@{channel.username}</p>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {channel?.subscribersCount || 0} subscribers
              </div>
              <div className="flex items-center">
                <VideoIcon className="h-4 w-4 mr-1" />
                {videos.length} videos
              </div>
            </div>

            {!isOwnChannel && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleSubscribe}
                  variant={isSubscribed ? "outline" : "default"}
                  className="flex items-center space-x-2"
                >
                  <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
                </Button>
                {isSubscribed && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
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
        </div>
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

export default Channel