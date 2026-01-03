import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Slider } from '../ui/slider'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useSettings } from '../../context/SettingsContext'
import { RotateCcw, Grid3X3, Eye, BarChart3, TrendingUp, Loader2 } from 'lucide-react'

const GeneralSettings = () => {
  const { 
    uiPreferences, 
    accountSettings, 
    updateUIPreference, 
    updateAccountSetting,
    loading,
    saving
  } = useSettings()

  const fontSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading settings...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Video Grid Layout (UI Preference - localStorage) */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-primary" />
            Video Grid Layout
            <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
              Local
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Videos per row</Label>
              <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                {uiPreferences.gridColumns}
              </span>
            </div>
            <Slider
              value={[uiPreferences.gridColumns]}
              onValueChange={([value]) => updateUIPreference('gridColumns', value)}
              min={2}
              max={6}
              step={1}
              className="w-full transition-all duration-200"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Grid3X3 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <Label htmlFor="compact-mode" className="font-medium">Compact mode</Label>
                <p className="text-xs text-muted-foreground">Reduce spacing between elements</p>
              </div>
            </div>
            <Switch
              id="compact-mode"
              checked={uiPreferences.compactMode}
              onCheckedChange={(checked) => updateUIPreference('compactMode', checked)}
              className="transition-all duration-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences (Account Settings - Backend) */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Display Preferences
            <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded">
              Synced
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              id: 'show-duration',
              key: 'showVideoDuration',
              label: 'Show video duration',
              description: 'Display video length on thumbnails',
              icon: '⏱️'
            },
            {
              id: 'show-progress',
              key: 'showProgressBar',
              label: 'Show watch progress bar',
              description: 'Red progress bar on watched videos',
              icon: '📊'
            },
            {
              id: 'show-views',
              key: 'showViewCount',
              label: 'Show view count',
              description: 'Display number of views',
              icon: '👁️'
            },
            {
              id: 'show-channel',
              key: 'showChannelName',
              label: 'Show channel name',
              description: 'Display channel name under videos',
              icon: '📺'
            }
          ].map((item) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm">
                  {item.icon}
                </div>
                <div>
                  <Label htmlFor={item.id} className="font-medium">{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <Switch
                id={item.id}
                checked={accountSettings[item.key]}
                onCheckedChange={(checked) => updateAccountSetting(item.key, checked)}
                className="transition-all duration-200"
                disabled={saving}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Typography (UI Preference - localStorage) */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-primary">Aa</span>
            Typography
            <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
              Local
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Font size</Label>
            <Select
              value={uiPreferences.fontSize}
              onValueChange={(value) => updateUIPreference('fontSize', value)}
            >
              <SelectTrigger className="transition-all duration-200 hover:border-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    <span className={`
                      ${size.value === 'small' ? 'text-sm' : ''}
                      ${size.value === 'medium' ? 'text-base' : ''}
                      ${size.value === 'large' ? 'text-lg' : ''}
                    `}>
                      {size.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Preferences (Account Settings - Backend) */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Content Preferences
            <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded">
              Synced
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              id: 'personalize',
              key: 'personalizeRecommendations',
              label: 'Personalize recommendations',
              description: 'Use your activity to suggest relevant content',
              icon: '🎯'
            },
            {
              id: 'show-trending',
              key: 'showTrending',
              label: 'Show trending content',
              description: 'Display trending videos in recommendations',
              icon: '🔥'
            },
            {
              id: 'hide-shorts',
              key: 'hideShorts',
              label: 'Hide Shorts',
              description: 'Remove Shorts from your feed',
              icon: '📱'
            },
            {
              id: 'save-history',
              key: 'saveWatchHistory',
              label: 'Save watch history',
              description: 'Keep track of videos you\'ve watched',
              icon: '📚'
            }
          ].map((item) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm">
                  {item.icon}
                </div>
                <div>
                  <Label htmlFor={item.id} className="font-medium">{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <Switch
                id={item.id}
                checked={accountSettings[item.key]}
                onCheckedChange={(checked) => updateAccountSetting(item.key, checked)}
                className="transition-all duration-200"
                disabled={saving}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Storage Info */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <BarChart3 className="w-5 h-5" />
            Storage Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Local Storage</h4>
              <p className="text-blue-700 dark:text-blue-300 text-xs">
                UI preferences stored on your device for instant loading
              </p>
              <div className="mt-2 text-xs text-blue-600">
                • Grid layout • Font size • Compact mode • Theme • Colors
              </div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">Cloud Sync</h4>
              <p className="text-green-700 dark:text-green-300 text-xs">
                Account settings synced across all your devices
              </p>
              <div className="mt-2 text-xs text-green-600">
                • Display options • Content preferences • Privacy settings
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default GeneralSettings