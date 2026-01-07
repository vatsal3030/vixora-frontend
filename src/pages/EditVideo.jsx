import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { videoService } from '../api/services'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Edit, Save, X, Image, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const EditVideo = () => {
  const { videoId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [video, setVideo] = useState(null)
  const [newThumbnail, setNewThumbnail] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const thumbnailInputRef = useRef(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public'
  })

  useEffect(() => {
    fetchVideo()
  }, [videoId])

  const fetchVideo = async () => {
    try {
      const response = await videoService.getVideo(videoId)
      const videoData = response.data.data
      setVideo(videoData)
      setFormData({
        title: videoData.title || '',
        description: videoData.description || '',
        visibility: videoData.isPublished ? 'public' : 'private'
      })
    } catch (error) {
      setError('Failed to load video')
    } finally {
      setLoading(false)
    }
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      
      const imageUrl = URL.createObjectURL(file)
      setThumbnailPreview(imageUrl)
      setNewThumbnail(file)
      setError('')
    }
  }

  const removeThumbnail = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview)
    }
    setNewThumbnail(null)
    setThumbnailPreview(null)
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) return
    
    setDeleting(true)
    try {
      await videoService.deleteVideo(videoId)
      toast.success('Video deleted successfully')
      navigate('/my-videos')
    } catch (error) {
      toast.error('Failed to delete video')
    } finally {
      setDeleting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const updateData = new FormData()
      updateData.append('title', formData.title)
      updateData.append('description', formData.description)
      updateData.append('isPublished', formData.visibility === 'public')
      
      if (newThumbnail) {
        updateData.append('thumbnail', newThumbnail)
      }

      await videoService.updateVideo(videoId, updateData)
      toast.success('Video updated successfully!')
      navigate(`/video/${videoId}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update video')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600">Video not found</p>
        <Button onClick={() => navigate('/my-videos')} className="mt-4">
          Back to My Videos
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Edit className="h-6 w-6" />
            <span>Edit Video</span>
          </CardTitle>
          <CardDescription>
            Update your video details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Video Preview */}
          <div className="mb-6">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src={thumbnailPreview || video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Upload */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Update Thumbnail
              </label>
              {!newThumbnail ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="flex items-center space-x-2"
                >
                  <Image className="h-4 w-4" />
                  <span>Choose New Thumbnail</span>
                </Button>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Image className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-medium text-gray-900">{newThumbnail.name}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeThumbnail}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter video title"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/100 characters
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell viewers about your video"
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <Select value={formData.visibility} onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={saving || deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? 'Deleting...' : 'Delete Video'}
              </Button>
              
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/video/${videoId}`)}
                  disabled={saving || deleting}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || deleting}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditVideo