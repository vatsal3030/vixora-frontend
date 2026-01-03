import { useSettings } from '../context/SettingsContext'
import VideoCard from './VideoCard'
import { useEffect } from 'react'

const VideoGrid = ({ videos = [], loading = false }) => {
  const { settings } = useSettings()

  // Update CSS variable when grid columns change
  useEffect(() => {
    if (settings.gridColumns) {
      document.documentElement.style.setProperty('--grid-columns', settings.gridColumns.toString())
    }
  }, [settings.gridColumns])

  if (loading) {
    return (
      <div className="video-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted aspect-video rounded-lg mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div 
      className={`
        video-grid
        ${settings.compactMode ? 'compact-mode' : ''}
        ${!settings.showVideoDuration ? 'hide-duration' : ''}
        ${!settings.showProgressBar ? 'hide-progress' : ''}
        ${!settings.showViewCount ? 'hide-views' : ''}
        ${!settings.showChannelName ? 'hide-channel' : ''}
      `}
    >
      {videos.map((video) => (
        <VideoCard 
          key={video._id || video.id} 
          video={video}
          showDuration={settings.showVideoDuration}
          showProgress={settings.showProgressBar}
          showViews={settings.showViewCount}
          showChannel={settings.showChannelName}
          compact={settings.compactMode}
        />
      ))}
    </div>
  )
}

export default VideoGrid