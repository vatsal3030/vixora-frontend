import { Link } from 'react-router-dom'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Play, Lock, Globe } from 'lucide-react'

const PlaylistCard = ({ playlist }) => {
  const formatVideoCount = (count) => {
    return `${count || 0} video${count !== 1 ? 's' : ''}`
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-card">
      <Link to={`/playlist/${playlist.id}`}>
        <div className="relative aspect-video bg-muted">
          {playlist.videos?.[0]?.thumbnail ? (
            <img
              src={playlist.videos[0].thumbnail}
              alt={playlist.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Play className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded flex items-center">
            <Play className="h-3 w-3 mr-1" />
            {formatVideoCount(playlist.totalVideos)}
          </div>
        </div>
      </Link>
      
      <CardContent className="p-3 sm:p-4">
        <Link to={`/playlist/${playlist.id}`}>
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 hover:text-red-600 text-card-foreground mb-2">
            {playlist.name}
          </h3>
        </Link>
        
        {playlist.description && (
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
            {playlist.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatVideoCount(playlist.totalVideos)}</span>
          <div className="flex items-center">
            {playlist.isPublic ? (
              <Globe className="h-3 w-3" />
            ) : (
              <Lock className="h-3 w-3" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PlaylistCard