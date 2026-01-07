import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { videoService } from '../api/services'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Upload as UploadIcon, Video, Image, Play, Clock, X } from 'lucide-react'

const Upload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '' // 'video' or 'shorts'
  })
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState(null)
  const [videoDuration, setVideoDuration] = useState(0)
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const videoRef = useRef(null)
  const videoInputRef = useRef(null)
  const thumbnailInputRef = useRef(null)

  const navigate = useNavigate()

  // Prevent page refresh/navigation when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Track form changes
  useEffect(() => {
    const hasChanges = formData.title || formData.description || formData.type || videoFile || thumbnail
    setHasUnsavedChanges(hasChanges)
  }, [formData, videoFile, thumbnail])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'description') {
      // Extract tags from description
      const hashtagRegex = /#\w+/g
      const foundTags = value.match(hashtagRegex) || []
      const uniqueTags = [...new Set(foundTags.map(tag => tag.toLowerCase()))]
      
      if (uniqueTags.length > 20) {
        setError('Maximum 20 tags allowed')
        return
      }
      
      setTags(uniqueTags)
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleTypeChange = (value) => {
    setFormData(prev => ({ ...prev, type: value }))
    setError('')
    // Clear video if type changes and duration doesn't match
    if (videoFile && videoDuration > 0) {
      validateVideoDuration(videoDuration, value)
    }
  }

  const validateVideoDuration = (duration, type) => {
    if (type === 'shorts' && duration > 61) {
      setError('Shorts must be 60 seconds or less')
      return false
    }
    if (type === 'video' && duration > 7200) { // 2 hours = 7200 seconds
      setError('Videos must be 2 hours or less')
      return false
    }
    return true
  }

  const handleVideoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check if file is a video
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file')
        e.target.value = ''
        return
      }
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        setError('Video file size must be less than 100MB')
        e.target.value = ''
        return
      }

      // Create video preview and get duration
      const videoUrl = URL.createObjectURL(file)
      setVideoPreview(videoUrl)
      
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        const duration = Math.round(video.duration)
        setVideoDuration(duration)
        
        // Validate duration if type is selected
        if (formData.type && !validateVideoDuration(duration, formData.type)) {
          setVideoFile(null)
          setVideoPreview(null)
          setVideoDuration(0)
          e.target.value = ''
          return
        }
        
        setVideoFile(file)
        setError('')
      }
      video.src = videoUrl
    }
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file for thumbnail')
        e.target.value = ''
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Thumbnail file size must be less than 5MB')
        e.target.value = ''
        return
      }
      
      const imageUrl = URL.createObjectURL(file)
      setThumbnailPreview(imageUrl)
      setThumbnail(file)
      setError('')
    }
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview)
    }
    setVideoFile(null)
    setVideoPreview(null)
    setVideoDuration(0)
    if (videoInputRef.current) {
      videoInputRef.current.value = ''
    }
    setError('')
  }

  const removeThumbnail = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview)
    }
    setThumbnail(null)
    setThumbnailPreview(null)
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ''
    }
    setError('')
  }

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        // Clean up object URLs
        if (videoPreview) URL.revokeObjectURL(videoPreview)
        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview)
        navigate('/')
      }
    } else {
      navigate('/')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.type) {
      setError('Please select video type (Video or Shorts)')
      return
    }

    if (!videoFile) {
      setError('Please select a video file')
      return
    }

    if (!thumbnail) {
      setError('Please select a thumbnail image')
      return
    }

    if (!formData.title.trim()) {
      setError('Please enter a title')
      return
    }

    // Final duration validation
    if (!validateVideoDuration(videoDuration, formData.type)) {
      return
    }

    setLoading(true)
    setError('')
    setUploadProgress(0)

    try {
      const uploadData = new FormData()
      uploadData.append('videoFile', videoFile)
      uploadData.append('thumbnail', thumbnail)
      uploadData.append('title', formData.title)
      uploadData.append('description', formData.description)
      uploadData.append('type', formData.type)
      uploadData.append('duration', videoDuration)
      uploadData.append('tags', JSON.stringify(tags.map(tag => tag.replace('#', ''))))

      const response = await videoService.uploadVideo(uploadData)
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      setUploadProgress(100)
      
      // Navigate to the uploaded video
      const videoId = response.data.data.id
      navigate(`/video/${videoId}`)
      
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed')
      setUploadProgress(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UploadIcon className="h-6 w-6" />
            <span>Upload Video</span>
          </CardTitle>
          <CardDescription>
            Share your video with the world
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Video Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Type *
              </label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select video type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center space-x-2">
                      <Video className="h-4 w-4" />
                      <span>Video (up to 2 hours)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="shorts">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Shorts (up to 60 seconds)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Video File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video File *
              </label>
              {!videoFile ? (
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => videoInputRef.current?.click()}
                    className="flex items-center space-x-2"
                  >
                    <Video className="h-4 w-4" />
                    <span>Choose Video File</span>
                  </Button>
                  <span className="text-sm text-gray-500">MP4, WebM, AVI up to 100MB</span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Video className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{videoFile.name}</p>
                      {videoDuration > 0 && (
                        <p className="text-xs text-blue-600">Duration: {formatDuration(videoDuration)}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeVideo}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*,.mp4,.webm,.avi,.mov,.wmv,.flv,.mkv"
                onChange={handleVideoChange}
                className="hidden"
              />
              
              {/* Video Preview */}
              {videoPreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <video
                    ref={videoRef}
                    src={videoPreview}
                    controls
                    className="w-full max-w-md h-48 bg-black rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail *
              </label>
              {!thumbnail ? (
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="flex items-center space-x-2"
                  >
                    <Image className="h-4 w-4" />
                    <span>Choose Thumbnail</span>
                  </Button>
                  <span className="text-sm text-gray-500">JPG, PNG up to 5MB</span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <Image className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-medium text-gray-900">{thumbnail.name}</p>
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
                accept="image/*,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                onChange={handleThumbnailChange}
                className="hidden"
              />
              
              {/* Thumbnail Preview */}
              {thumbnailPreview && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full max-w-md h-32 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>

            {/* Title */}
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

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell viewers about your video. Use #hashtags for tags (max 20 tags)"
                rows={4}
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  {formData.description.length}/1000 characters
                </p>
                <p className="text-xs text-gray-500">
                  Tags: {tags.length}/20
                </p>
              </div>
              
              {/* Tags Display */}
              {tags.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Tags:</p>
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {loading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Video'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Upload