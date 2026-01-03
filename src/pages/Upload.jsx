import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { videoService } from '../api/services'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Upload as UploadIcon, Video, Image } from 'lucide-react'

const Upload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const handleVideoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      console.log('Selected video file:', file.name, file.type)
      // Check if file is a video
      if (!file.type.startsWith('video/')) {
        setError('Please select a valid video file')
        e.target.value = '' // Clear the input
        return
      }
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        setError('Video file size must be less than 100MB')
        e.target.value = '' // Clear the input
        return
      }
      setVideoFile(file)
      setError('')
    }
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      console.log('Selected thumbnail file:', file.name, file.type)
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file for thumbnail')
        e.target.value = '' // Clear the input
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Thumbnail file size must be less than 5MB')
        e.target.value = '' // Clear the input
        return
      }
      setThumbnail(file)
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
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

    setLoading(true)
    setError('')
    setUploadProgress(0)

    try {
      const uploadData = new FormData()
      uploadData.append('videoFile', videoFile)
      uploadData.append('thumbnail', thumbnail)
      uploadData.append('title', formData.title)
      uploadData.append('description', formData.description)

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

            {/* Video File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video File *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors relative">
                <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {videoFile ? videoFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500">
                    MP4, WebM, AVI up to 100MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="video/*,.mp4,.webm,.avi,.mov,.wmv,.flv,.mkv"
                  onChange={handleVideoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors relative">
                <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {thumbnail ? thumbnail.name : 'Click to upload thumbnail'}
                  </p>
                  <p className="text-xs text-gray-500">
                    JPG, PNG up to 5MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                  onChange={handleThumbnailChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
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
                placeholder="Tell viewers about your video"
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/1000 characters
              </p>
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
                onClick={() => navigate('/')}
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