import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, PictureInPicture, SkipBack, SkipForward, Info } from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from './ui/dropdown-menu'

const CustomVideoPlayer = ({ 
  src, 
  poster, 
  onPlay, 
  onPause, 
  onEnded, 
  onTimeUpdate,
  className = '',
  autoResume = false,
  resumeTime = 0
}) => {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const progressBarRef = useRef(null)
  const controlsTimeoutRef = useRef(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [quality, setQuality] = useState('auto')
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [volumeIndicator, setVolumeIndicator] = useState(null)
  const [speedIndicator, setSpeedIndicator] = useState(null)
  const [seekIndicator, setSeekIndicator] = useState(null)

  // Initialize video
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      if (autoResume && resumeTime > 0) {
        video.currentTime = resumeTime
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      onTimeUpdate?.()
    }

    const handlePlay = () => {
      setIsPlaying(true)
      onPlay?.()
    }

    const handlePause = () => {
      setIsPlaying(false)
      onPause?.()
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onEnded?.()
    }

    const handleWaiting = () => setBuffering(true)
    const handleCanPlay = () => setBuffering(false)

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('waiting', handleWaiting)
    video.addEventListener('canplay', handleCanPlay)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('waiting', handleWaiting)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [autoResume, resumeTime, onPlay, onPause, onEnded, onTimeUpdate])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      
      const video = videoRef.current
      if (!video) return

      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlayPause()
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'arrowleft':
          e.preventDefault()
          seek(-5)
          break
        case 'arrowright':
          e.preventDefault()
          seek(5)
          break
        case 'j':
          e.preventDefault()
          seek(-10)
          break
        case 'l':
          e.preventDefault()
          seek(10)
          break
        case 'arrowup':
          e.preventDefault()
          changeVolume(0.05)
          break
        case 'arrowdown':
          e.preventDefault()
          changeVolume(-0.05)
          break
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          e.preventDefault()
          const percent = parseInt(e.key) / 10
          video.currentTime = video.duration * percent
          break
        case '<':
          if (e.shiftKey) {
            e.preventDefault()
            changePlaybackRate(-0.25)
          }
          break
        case '>':
          if (e.shiftKey) {
            e.preventDefault()
            changePlaybackRate(0.25)
          }
          break
        case 'i':
          e.preventDefault()
          togglePIP()
          break
        case '?':
          e.preventDefault()
          setShowShortcuts(prev => !prev)
          break
        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(controlsTimeoutRef.current)
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false)
        }, 3000)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      return () => {
        container.removeEventListener('mousemove', handleMouseMove)
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying])

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    
    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }, [])

  const seek = useCallback((seconds) => {
    const video = videoRef.current
    if (!video) return
    
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds))
    showSeekIndicator(seconds)
  }, [])

  const changeVolume = useCallback((delta) => {
    const video = videoRef.current
    if (!video) return
    
    const newVolume = Math.max(0, Math.min(1, video.volume + delta))
    video.volume = newVolume
    setVolume(newVolume)
    if (newVolume > 0) setIsMuted(false)
    showVolumeIndicator(Math.round(newVolume * 100))
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    
    video.muted = !video.muted
    setIsMuted(video.muted)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    
    if (!document.fullscreenElement) {
      container.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  const togglePIP = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else {
        videoRef.current.requestPictureInPicture()
      }
    } catch (error) {
      // PIP error
    }
  }, [])

  const changePlaybackRate = useCallback((delta) => {
    const video = videoRef.current
    if (!video) return
    
    const rates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
    const currentIndex = rates.indexOf(video.playbackRate)
    const newIndex = Math.max(0, Math.min(rates.length - 1, currentIndex + Math.sign(delta)))
    const newRate = rates[newIndex]
    
    video.playbackRate = newRate
    setPlaybackRate(newRate)
    showSpeedIndicator(newRate)
  }, [])

  const handleProgressClick = useCallback((e) => {
    const video = videoRef.current
    const progressBar = progressBarRef.current
    if (!video || !progressBar) return
    
    const rect = progressBar.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    video.currentTime = video.duration * percent
  }, [])

  const showVolumeIndicator = useCallback((volume) => {
    setVolumeIndicator(volume)
    setTimeout(() => setVolumeIndicator(null), 1000)
  }, [])

  const showSpeedIndicator = useCallback((speed) => {
    setSpeedIndicator(speed)
    setTimeout(() => setSpeedIndicator(null), 1000)
  }, [])

  const showSeekIndicator = useCallback((seconds) => {
    setSeekIndicator(seconds)
    setTimeout(() => setSeekIndicator(null), 500)
  }, [])

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black group ${className}`}
      onDoubleClick={toggleFullscreen}
      style={{ zIndex: isFullscreen ? 9998 : 'auto' }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full pointer-events-none outline-none border-none focus:outline-none focus:border-none focus-visible:outline-none"
        style={{ outline: 'none', border: 'none' }}
      />

      {/* Clickable Overlay for Play/Pause */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={(e) => {
          // Don't trigger if clicking on controls
          if (!e.target.closest('.controls-overlay, button, input, [role="menu"]')) {
            togglePlayPause()
          }
        }}
      />

      {/* Buffering Spinner */}
      {buffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Center Play Button (when paused) */}
      {!isPlaying && !buffering && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={togglePlayPause}
            className="w-20 h-20 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all hover:scale-110"
          >
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </button>
        </div>
      )}

      {/* Volume Indicator */}
      {volumeIndicator !== null && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-4 rounded-lg text-2xl font-bold">
          <Volume2 className="w-8 h-8 mx-auto mb-2" />
          {volumeIndicator}%
        </div>
      )}

      {/* Speed Indicator */}
      {speedIndicator !== null && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-4 rounded-lg text-2xl font-bold">
          {speedIndicator}x
        </div>
      )}

      {/* Seek Indicator */}
      {seekIndicator !== null && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-4 rounded-lg text-xl font-bold flex items-center gap-2">
          {seekIndicator > 0 ? <SkipForward className="w-6 h-6" /> : <SkipBack className="w-6 h-6" />}
          {Math.abs(seekIndicator)}s
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`controls-overlay absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div 
          ref={progressBarRef}
          className="w-full h-1 bg-white/30 cursor-pointer hover:h-2 transition-all group/progress"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-4 py-3 gap-2">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlayPause}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => seek(-10)}
              className="text-white hover:bg-white/20 hidden sm:flex"
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => seek(10)}
              className="text-white hover:bg-white/20 hidden sm:flex"
            >
              <SkipForward className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-2 group/volume">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value)
                  videoRef.current.volume = newVolume
                  setVolume(newVolume)
                  if (newVolume > 0) setIsMuted(false)
                }}
                className="w-0 group-hover/volume:w-20 transition-all opacity-0 group-hover/volume:opacity-100"
              />
            </div>

            <span className="text-white text-sm hidden sm:inline">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShortcuts(true)}
              className="text-white hover:bg-white/20 hidden lg:flex"
              title="Keyboard shortcuts (?)"
            >
              <Info className="w-5 h-5" />
            </Button>

            {/* Settings Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  style={{ zIndex: isFullscreen ? 9999 : 'auto' }}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48"
                style={{ zIndex: isFullscreen ? 10000 : 'auto' }}
              >
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Playback Speed
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(rate => (
                      <DropdownMenuItem
                        key={rate}
                        onClick={() => {
                          videoRef.current.playbackRate = rate
                          setPlaybackRate(rate)
                        }}
                        className={playbackRate === rate ? 'bg-accent' : ''}
                      >
                        {rate === 1 ? 'Normal' : `${rate}x`}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Quality
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {['auto', '1080p', '720p', '480p', '360p'].map(q => (
                      <DropdownMenuItem
                        key={q}
                        onClick={() => setQuality(q)}
                        className={quality === q ? 'bg-accent' : ''}
                      >
                        {q.charAt(0).toUpperCase() + q.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={togglePIP}
              className="text-white hover:bg-white/20 hidden sm:flex"
              title="Picture-in-Picture (i)"
            >
              <PictureInPicture className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
              title="Fullscreen (f)"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Panel */}
      {showShortcuts && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Keyboard Shortcuts</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowShortcuts(false)}
              >
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Playback</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Space / K</span><span className="text-muted-foreground">Play/Pause</span></div>
                  <div className="flex justify-between"><span>←</span><span className="text-muted-foreground">Rewind 5s</span></div>
                  <div className="flex justify-between"><span>→</span><span className="text-muted-foreground">Forward 5s</span></div>
                  <div className="flex justify-between"><span>J</span><span className="text-muted-foreground">Rewind 10s</span></div>
                  <div className="flex justify-between"><span>L</span><span className="text-muted-foreground">Forward 10s</span></div>
                  <div className="flex justify-between"><span>0-9</span><span className="text-muted-foreground">Jump to %</span></div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Volume & Display</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>M</span><span className="text-muted-foreground">Mute/Unmute</span></div>
                  <div className="flex justify-between"><span>↑</span><span className="text-muted-foreground">Volume Up</span></div>
                  <div className="flex justify-between"><span>↓</span><span className="text-muted-foreground">Volume Down</span></div>
                  <div className="flex justify-between"><span>F</span><span className="text-muted-foreground">Fullscreen</span></div>
                  <div className="flex justify-between"><span>I</span><span className="text-muted-foreground">PIP Mode</span></div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Speed</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Shift + &lt;</span><span className="text-muted-foreground">Slower</span></div>
                  <div className="flex justify-between"><span>Shift + &gt;</span><span className="text-muted-foreground">Faster</span></div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Help</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>?</span><span className="text-muted-foreground">Show shortcuts</span></div>
                  <div className="flex justify-between"><span>Esc</span><span className="text-muted-foreground">Close/Exit</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomVideoPlayer
