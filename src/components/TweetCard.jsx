import { useState } from 'react'
import { tweetService, likeService } from '../api/services'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Card, CardContent } from './ui/card'
import { ThumbsUp, Trash2, MoreHorizontal } from 'lucide-react'
import { formatDate } from '../utils/formatDate'

const TweetCard = ({ tweet, onDelete, onUpdate }) => {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(tweet.isLiked || false)
  const [likesCount, setLikesCount] = useState(tweet.likesCount || 0)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    try {
      setLoading(true)
      // Temporarily disabled until backend like routes are fixed
      // await likeService.toggleTweetLike(tweet.id)
      const newIsLiked = !isLiked
      setIsLiked(newIsLiked)
      setLikesCount(prev => newIsLiked ? prev + 1 : Math.max(prev - 1, 0))
    } catch (error) {
      console.error('Error toggling tweet like:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this tweet?')) return

    try {
      await tweetService.deleteTweet(tweet.id)
      onDelete(tweet.id)
    } catch (error) {
      console.error('Error deleting tweet:', error)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex space-x-4">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={tweet.owner?.avatar} alt={tweet.owner?.fullName} />
            <AvatarFallback>
              {tweet.owner?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{tweet.owner?.fullName}</span>
                <span className="text-sm text-muted-foreground">
                  @{tweet.owner?.username}
                </span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(tweet.createdAt)}
                </span>
              </div>
              
              {tweet.owner?.id === user?.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <p className="text-foreground mb-3 whitespace-pre-wrap">
              {tweet.content}
            </p>
            
            {tweet.image && (
              <img 
                src={tweet.image} 
                alt="Tweet image" 
                className="max-h-96 rounded-lg object-cover mb-3 cursor-pointer"
                onClick={() => window.open(tweet.image, '_blank')}
              />
            )}
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                disabled={loading}
                className={`flex items-center space-x-2 ${
                  isLiked ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{likesCount}</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TweetCard