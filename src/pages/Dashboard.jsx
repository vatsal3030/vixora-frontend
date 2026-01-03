import { useState, useEffect } from 'react'
import { dashboardService } from '../api/services'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { BarChart3, Eye, ThumbsUp, Users, Video } from 'lucide-react'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalViews: 0,
    totalVideos: 0,
    totalLikes: 0,
    totalSubscribers: 0
  })
  const [topVideos, setTopVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [overviewResponse, topVideosResponse] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getTopVideos()
      ])

      const overview = overviewResponse.data.data
      setStats({
        totalViews: overview.totalViews || 0,
        totalVideos: overview.totalVideos || 0,
        totalLikes: overview.totalLikes || 0,
        totalSubscribers: overview.totalSubscribers || 0
      })

      setTopVideos(topVideosResponse.data.data || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
      // Fallback to mock data
      setStats({
        totalViews: 12500,
        totalVideos: 25,
        totalLikes: 890,
        totalSubscribers: 156
      })
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-blue-600'
    },
    {
      title: 'Total Videos',
      value: stats.totalVideos.toLocaleString(),
      icon: Video,
      color: 'text-green-600'
    },
    {
      title: 'Total Likes',
      value: stats.totalLikes.toLocaleString(),
      icon: ThumbsUp,
      color: 'text-red-600'
    },
    {
      title: 'Subscribers',
      value: stats.totalSubscribers.toLocaleString(),
      icon: Users,
      color: 'text-purple-600'
    }
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center space-x-2 mb-8">
        <BarChart3 className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
          {error} - Showing sample data
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest channel activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New video uploaded</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">5 new subscribers</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Video reached 1K views</p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Videos</CardTitle>
            <CardDescription>
              Your most viewed videos this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topVideos.length > 0 ? (
                topVideos.slice(0, 3).map((video, index) => (
                  <div key={video.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{video.title}</p>
                      <p className="text-xs text-gray-500">{video.views?.toLocaleString()} views</p>
                    </div>
                    <div className="text-sm text-green-600">#{index + 1}</div>
                  </div>
                ))
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">How to Code React</p>
                      <p className="text-xs text-gray-500">2.5K views</p>
                    </div>
                    <div className="text-sm text-green-600">+15%</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">JavaScript Tips</p>
                      <p className="text-xs text-gray-500">1.8K views</p>
                    </div>
                    <div className="text-sm text-green-600">+8%</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">CSS Grid Tutorial</p>
                      <p className="text-xs text-gray-500">1.2K views</p>
                    </div>
                    <div className="text-sm text-red-600">-3%</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard