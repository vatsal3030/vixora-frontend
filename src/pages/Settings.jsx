import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Label } from '../components/ui/label'
import { Slider } from '../components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useSettings } from '../context/SettingsContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../hooks/useAuth'
import Toggle from '../components/Toggle'
import DeleteAccountDialog from '../components/DeleteAccountDialog'
import { 
  Settings as SettingsIcon, 
  User, 
  Palette, 
  Shield, 
  Play, 
  Bell,
  Save,
  RotateCcw,
  Check,
  Loader2,
  AlertCircle,
  Sun,
  Moon,
  Monitor,
  Grid3X3,
  Eye,
  Type,
  BarChart3
} from 'lucide-react'

const Settings = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { 
    settings,
    hasUnsavedChanges, 
    saving, 
    loading, 
    lastSaved, 
    error,
    updateSetting,
    saveSettings,
    discardChanges,
    resetSettings 
  } = useSettings()
  
  const [activeSection, setActiveSection] = useState(() => {
    const hash = location.hash.replace('#', '')
    return hash || 'general'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId)
    navigate(`/settings#${sectionId}`, { replace: true })
    setSidebarOpen(false)
  }

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      await resetSettings()
    }
  }

  // Theme options
  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ]

  // Color options
  const colorOptions = [
    { value: '#EF4444', label: 'Crimson', color: 'bg-red-500' },
    { value: '#F97316', label: 'Sunset', color: 'bg-orange-500' },
    { value: '#EAB308', label: 'Amber', color: 'bg-amber-500' },
    { value: '#3B82F6', label: 'Sky', color: 'bg-blue-500' },
    { value: '#0EA5E9', label: 'Ocean', color: 'bg-sky-500' },
    { value: '#6366F1', label: 'Indigo', color: 'bg-indigo-500' },
    { value: '#8B5CF6', label: 'Purple', color: 'bg-purple-500' },
    { value: '#EC4899', label: 'Pink', color: 'bg-pink-500' },
    { value: '#14B8A6', label: 'Teal', color: 'bg-teal-500' },
    { value: '#22C55E', label: 'Green', color: 'bg-green-500' },
    { value: '#84CC16', label: 'Lime', color: 'bg-lime-500' },
  ]

  const fontSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ]

  const playbackSpeeds = [
    { value: 0.25, label: '0.25x' },
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: 'Normal' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 1.75, label: '1.75x' },
    { value: 2, label: '2x' }
  ]

  // Auto-close mobile sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <div className="h-10 w-48 bg-muted rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg p-4 space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </div>
            <div className="lg:col-span-3 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg p-6">
                  <div className="h-6 w-48 bg-muted rounded animate-pulse mb-4" />
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="h-16 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
              <p className="text-muted-foreground">
                Customize your experience {user ? '(synced to your account)' : '(local only)'}
              </p>
            </div>
            
            {/* Mobile Menu Button - Top Right */}
            <Button
              variant="outline"
              size="icon"
              className="lg:hidden flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <SettingsIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation - Desktop & Mobile */}
          <Card className={`lg:col-span-1 h-fit ${
            sidebarOpen ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm z-50 lg:relative lg:translate-x-0 lg:translate-y-0 lg:w-auto' : 'hidden lg:block'
          }`}>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {[
                  { id: 'general', label: 'General', icon: SettingsIcon },
                  { id: 'appearance', label: 'Appearance', icon: Palette },
                  { id: 'playback', label: 'Playback', icon: Play },
                  { id: 'privacy', label: 'Privacy', icon: Shield },
                  { id: 'notifications', label: 'Notifications', icon: Bell }
                ].map((section) => {
                  const Icon = section.icon
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start transition-all duration-200 hover:scale-105"
                      onClick={() => handleSectionChange(section.id)}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {section.label}
                    </Button>
                  )
                })}
                
                {/* Reset Button */}
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-destructive border-destructive/30 hover:bg-destructive hover:text-white"
                    onClick={handleReset}
                    disabled={saving}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset All
                  </Button>
                </div>
              </nav>
            </CardContent>
          </Card>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* General Settings */}
            {activeSection === 'general' && (
              <>
                {/* Display Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-primary" />
                      Display Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: 'showVideoDuration', label: 'Show video duration', description: 'Display video length on thumbnails', icon: '⏱️' },
                      { key: 'showProgressBar', label: 'Show watch progress bar', description: 'Red progress bar on watched videos', icon: '📊' },
                      { key: 'showViewCount', label: 'Show view count', description: 'Display number of views', icon: '👁️' },
                      { key: 'showChannelName', label: 'Show channel name', description: 'Display channel name under videos', icon: '📺' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-lg border border-white/5 hover:border-primary/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-sm">
                            {item.icon}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                        <Toggle
                          checked={settings[item.key]}
                          onChange={(val) => updateSetting(item.key, val)}
                          disabled={saving}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Content Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Content Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: 'personalizeRecommendations', label: 'Personalize recommendations', description: 'Use your activity to suggest relevant content', icon: '🎯' },
                      { key: 'showTrending', label: 'Show trending content', description: 'Display trending videos in recommendations', icon: '🔥' },
                      { key: 'hideShorts', label: 'Hide Shorts', description: 'Remove Shorts from your feed', icon: '📱' },
                      { key: 'saveWatchHistory', label: 'Save watch history', description: 'Keep track of videos you\'ve watched', icon: '📚' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-sm">
                            {item.icon}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                        <Toggle
                          checked={settings[item.key]}
                          onChange={(val) => updateSetting(item.key, val)}
                          disabled={saving}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}

            {/* Appearance Settings */}
            {activeSection === 'appearance' && (
              <>
                {/* Theme Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-primary" />
                      Theme
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {themeOptions.map((option) => {
                        const Icon = option.icon
                        const isActive = theme === option.value
                        return (
                          <Button
                            key={option.value}
                            variant={isActive ? 'secondary' : 'outline'}
                            className={`h-20 flex-col gap-2 transition-all duration-300 ${isActive ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => {
                              setTheme(option.value)
                              updateSetting('theme', option.value)
                            }}
                          >
                            <Icon className="w-6 h-6" />
                            {option.label}
                          </Button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Primary Color */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div 
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: settings.primaryColor }}
                      />
                      Primary Color
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-2">
                      {colorOptions.map((color) => {
                        const isActive = settings.primaryColor === color.value
                        return (
                          <button
                            key={color.value}
                            className={`relative w-full aspect-square max-w-[48px] rounded-lg transition-all duration-200 ${color.color} ${
                              isActive ? 'scale-110 ring-4 ring-offset-2 ring-current shadow-lg' : 'hover:scale-105 hover:shadow-md'
                            }`}
                            onClick={() => updateSetting('primaryColor', color.value)}
                            title={color.label}
                          >
                            {isActive && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Grid Layout */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Grid3X3 className="w-5 h-5 text-primary" />
                      Grid Layout
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium">Videos per row</Label>
                        <span className="text-2xl font-bold text-primary">{settings.gridColumns}</span>
                      </div>
                      
                      <Slider
                        value={[settings.gridColumns]}
                        onValueChange={([value]) => updateSetting('gridColumns', value)}
                        min={2}
                        max={6}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Fewer (2)</span>
                        <span>More (6)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors">
                      <div>
                        <p className="font-medium text-sm">Compact mode</p>
                        <p className="text-xs text-muted-foreground">Reduce spacing between elements</p>
                      </div>
                      <Toggle
                        checked={settings.compactMode}
                        onChange={(val) => updateSetting('compactMode', val)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Typography */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Type className="w-5 h-5 text-primary" />
                      Typography
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Font family</Label>
                      <Select
                        value={settings.fontFamily || 'inter'}
                        onValueChange={(value) => updateSetting('fontFamily', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inter">Inter (Default)</SelectItem>
                          <SelectItem value="jakarta">Plus Jakarta Sans (Premium)</SelectItem>
                          <SelectItem value="grotesk">Space Grotesk (Tech)</SelectItem>
                          <SelectItem value="roboto">Roboto (Classic)</SelectItem>
                          <SelectItem value="poppins">Poppins (Modern)</SelectItem>
                          <SelectItem value="ghost">Spectral (Ghost)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Font size</Label>
                      <Select
                        value={settings.fontSize}
                        onValueChange={(value) => updateSetting('fontSize', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontSizes.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Playback Settings */}
            {activeSection === 'playback' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Video Playback</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors">
                      <p className="font-medium text-sm">Autoplay next video</p>
                      <Toggle
                        checked={settings.autoplayNext}
                        onChange={(val) => updateSetting('autoplayNext', val)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Default playback speed</Label>
                      <Select
                        value={settings.defaultPlaybackSpeed?.toString() || '1'}
                        onValueChange={(value) => updateSetting('defaultPlaybackSpeed', parseFloat(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {playbackSpeeds.map((speed) => (
                            <SelectItem key={speed.value} value={speed.value.toString()}>
                              {speed.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Privacy Settings */}
            {activeSection === 'privacy' && user && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Profile visibility</Label>
                      <Select
                        value={settings.profileVisibility || 'PUBLIC'}
                        onValueChange={(value) => updateSetting('profileVisibility', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PUBLIC">Public</SelectItem>
                          <SelectItem value="PRIVATE">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {[
                      { key: 'showSubscriptions', label: 'Show subscriptions' },
                      { key: 'showLikedVideos', label: 'Show liked videos' },
                      { key: 'allowComments', label: 'Allow comments' },
                      { key: 'allowMentions', label: 'Allow mentions' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors">
                        <p className="font-medium text-sm">{item.label}</p>
                        <Toggle
                          checked={settings[item.key]}
                          onChange={(val) => updateSetting(item.key, val)}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Account Management */}
                <Card className="border-red-200 dark:border-red-800">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                      <h4 className="font-semibold text-red-800 dark:text-red-400 mb-2">Delete Account</h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                        Permanently delete your account and all associated data. You can restore your account within 7 days.
                      </p>
                      <DeleteAccountDialog />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && user && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email notifications' },
                    { key: 'commentNotifications', label: 'Comment notifications' },
                    { key: 'subscriptionNotifications', label: 'Subscription notifications' },
                    { key: 'systemAnnouncements', label: 'System announcements' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors">
                      <p className="font-medium text-sm">{item.label}</p>
                      <Toggle
                        checked={settings[item.key]}
                        onChange={(val) => updateSetting(item.key, val)}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Save Bar */}
      {hasUnsavedChanges && user && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-30 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  {saving ? 'Saving changes...' : 'You have unsaved changes'}
                </span>
                {lastSaved && (
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    Last saved: {new Date(lastSaved).toLocaleTimeString()}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {error && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">{error}</span>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={discardChanges}
                  disabled={saving}
                >
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={saveSettings}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings