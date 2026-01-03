import { useLocalSettings } from '../context/LocalSettingsContext'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'

const SettingsDemo = () => {
  const { settings } = useLocalSettings()

  // Generate demo video cards based on settings
  const demoVideos = Array.from({ length: settings.gridColumns * 2 }, (_, i) => ({
    id: i + 1,
    title: `Demo Video ${i + 1}`,
    channel: 'Demo Channel',
    views: '1.2M views',
    duration: '10:30',
    progress: Math.random() * 100
  }))

  return (
    <div className="space-y-6">
      {/* Settings Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-muted-foreground">Theme</span>
              <Badge variant="outline">{settings.theme}</Badge>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Grid</span>
              <Badge variant="outline">{settings.gridColumns} columns</Badge>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Font</span>
              <Badge variant="outline">{settings.fontSize}</Badge>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground">Mode</span>
              <Badge variant="outline">{settings.compactMode ? 'Compact' : 'Normal'}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Video Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Video Grid Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            className={`
              grid gap-4 transition-all duration-300
              ${settings.compactMode ? 'gap-2' : 'gap-4'}
            `}
            style={{ 
              gridTemplateColumns: `repeat(${Math.min(settings.gridColumns, 4)}, 1fr)` 
            }}
          >
            {demoVideos.slice(0, settings.gridColumns).map((video) => (
              <div 
                key={video.id}
                className={`
                  bg-muted rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md
                  ${settings.compactMode ? 'p-2' : 'p-3'}
                `}
              >
                {/* Video Thumbnail */}
                <div className="relative aspect-video bg-primary/20 rounded mb-2">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-primary font-medium">Video {video.id}</span>
                  </div>
                  
                  {/* Duration */}
                  {settings.showVideoDuration && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1 rounded">
                      {video.duration}
                    </div>
                  )}
                  
                  {/* Progress Bar */}
                  {settings.showProgressBar && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                      <div 
                        className="h-full bg-red-600 transition-all duration-200"
                        style={{ width: `${video.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                
                {/* Video Info */}
                <div className={`space-y-1 ${settings.compactMode ? 'text-sm' : ''}`}>
                  <h3 className={`
                    font-medium line-clamp-2 transition-all duration-200
                    ${settings.fontSize === 'small' ? 'text-sm' : ''}
                    ${settings.fontSize === 'large' ? 'text-lg' : ''}
                  `}>
                    {video.title}
                  </h3>
                  
                  {settings.showChannelName && (
                    <p className="text-muted-foreground text-sm">{video.channel}</p>
                  )}
                  
                  {settings.showViewCount && (
                    <p className="text-muted-foreground text-xs">{video.views}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Active Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { key: 'showProgressBar', label: 'Progress Bar' },
              { key: 'showViewCount', label: 'View Count' },
              { key: 'showVideoDuration', label: 'Video Duration' },
              { key: 'showChannelName', label: 'Channel Name' },
              { key: 'personalizeRecommendations', label: 'Personalized' },
              { key: 'showTrending', label: 'Trending Content' },
              { key: 'hideShorts', label: 'Hide Shorts' },
              { key: 'compactMode', label: 'Compact Mode' }
            ].map((feature) => (
              <div 
                key={feature.key}
                className={`
                  flex items-center justify-between p-2 rounded transition-all duration-200
                  ${settings[feature.key] 
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                    : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  }
                `}
              >
                <span>{feature.label}</span>
                <span className="text-xs font-medium">
                  {settings[feature.key] ? 'ON' : 'OFF'}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsDemo