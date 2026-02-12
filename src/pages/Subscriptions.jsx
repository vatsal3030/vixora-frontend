import { useState, useEffect, lazy, Suspense } from 'react'
import { feedService, subscriptionService } from '../api/services'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import VideoGrid from '../components/VideoGrid'
import VideoCardSkeleton from '../components/VideoCardSkeleton'
import ChannelCardSkeleton from '../components/ChannelCardSkeleton'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Button } from '../components/ui/button'

const VideoCard = lazy(() => import('../components/VideoCard'))

const Subscriptions = () => {
  const [videos, setVideos] = useState([])
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [channelsLoading, setChannelsLoading] = useState(true)
  const [error, setError] = useState('')

  useDocumentTitle('Subscriptions')

  useEffect(() => {
    fetchSubscriptionVideos()
    fetchSubscribedChannels()
  }, [])

  const fetchSubscriptionVideos = async () => {
    try {
      setLoading(true)
      const response = await feedService.getSubscriptionsFeed()
      const videosData =
        response?.data?.data?.docs ||
        response?.data?.data?.videos ||
        response?.data?.data ||
        [];

      setVideos(Array.isArray(videosData) ? videosData : []);
    } catch {
      setError('Failed to load subscription videos')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscribedChannels = async () => {
    try {
      setChannelsLoading(true)
      const response = await subscriptionService.getSubscriptions()
      const channelsData = response?.data?.data || []
      setChannels(Array.isArray(channelsData) ? channelsData : [])
    } catch {
      // Ignore channel fetch errors and keep current state.
    } finally {
      setChannelsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchSubscriptionVideos}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-6">Subscriptions</h1>

      {/* Subscribed Channels */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Your Channels</h2>
        {channelsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ChannelCardSkeleton key={i} />
            ))}
          </div>
        ) : channels.length === 0 ? (
          <p className="text-muted-foreground">No subscribed channels</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((subscription) => (
              <Link
                key={subscription.id}
                to={`/@${subscription.username}`}
                className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={subscription.avatar} />
                  <AvatarFallback>
                    {subscription.fullName?.charAt(0)?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{subscription.fullName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {subscription.subscribersCount || 0} subscribers
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Latest Videos */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Latest Videos</h2>
        {loading ? (
          <VideoGrid videos={[]} loading={true} />
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No videos from your subscriptions</p>
            <p className="text-muted-foreground/70 mt-2">Subscribe to channels to see their latest videos here</p>
          </div>
        ) : (
          <VideoGrid videos={videos} loading={false} />
        )}
      </div>
    </div>
  )
}

export default Subscriptions
