import { useState, useEffect } from 'react'
import { tweetService } from '../api/services'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Textarea } from '../components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { Card, CardContent } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Image as ImageIcon, X } from 'lucide-react'
import TweetCard from '../components/TweetCard'
import Loader from '../components/Loader'

const Tweets = () => {
  const { user } = useAuth()
  const [tweets, setTweets] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTweet, setNewTweet] = useState('')
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchTweets()
    }
  }, [user])

  const fetchTweets = async () => {
    try {
      const response = await tweetService.getUserTweets(user.id)
      const tweetsData = response?.data?.data || []
      setTweets(Array.isArray(tweetsData) ? tweetsData : [])
    } catch (error) {
      console.error('Error fetching tweets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleCreateTweet = async (e) => {
    e.preventDefault()
    if (!newTweet.trim()) return

    try {
      setPosting(true)
      const formData = new FormData()
      formData.append('content', newTweet)
      if (selectedImage) {
        formData.append('tweetImage', selectedImage)
      }

      const response = await tweetService.createTweet(formData)
      const tweetData = response?.data?.data || {}
      
      setTweets(prev => [tweetData, ...prev])
      setNewTweet('')
      removeImage()
    } catch (error) {
      console.error('Error creating tweet:', error)
    } finally {
      setPosting(false)
    }
  }

  const handleLikeTweet = async (tweetId) => {
    // This will be handled by TweetCard component
  }

  const handleDeleteTweet = (tweetId) => {
    setTweets(prev => prev.filter(tweet => tweet.id !== tweetId))
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tweets</h1>

      {/* Create Tweet */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleCreateTweet}>
            <div className="flex space-x-4">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={user?.avatar} alt={user?.fullName} />
                <AvatarFallback>
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={newTweet}
                  onChange={(e) => setNewTweet(e.target.value)}
                  placeholder="What's happening?"
                  className="min-h-[100px] resize-none border-none p-0 text-lg"
                  maxLength={280}
                />
                
                {imagePreview && (
                  <div className="relative mt-4">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-64 rounded-lg object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="tweet-image"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => document.getElementById('tweet-image').click()}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-500">
                      {newTweet.length}/280
                    </span>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={!newTweet.trim() || posting}
                    className="px-6"
                  >
                    {posting ? 'Posting...' : 'Tweet'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tweets List */}
      <div className="space-y-4">
        {tweets.map((tweet) => (
          <TweetCard 
            key={tweet.id} 
            tweet={tweet} 
            onDelete={handleDeleteTweet}
          />
        ))}
        
        {tweets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tweets yet. Share your first thought!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Tweets