import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { useTheme } from '../../context/ThemeContext'
import { useSettings } from '../../context/SettingsContext'
import { Sun, Moon, Monitor, Palette, Grid3X3, Eye } from 'lucide-react'

const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme()
  const { uiPreferences, updateUIPreference } = useSettings()

  const themeOptions = [
    { 
      value: 'light', 
      label: 'Light', 
      icon: Sun,
      description: 'Clean and bright interface',
      preview: 'bg-white border-gray-200'
    },
    { 
      value: 'dark', 
      label: 'Dark', 
      icon: Moon,
      description: 'Easy on the eyes',
      preview: 'bg-gray-900 border-gray-700'
    },
    { 
      value: 'system', 
      label: 'System', 
      icon: Monitor,
      description: 'Matches your device settings',
      preview: 'bg-gradient-to-br from-white to-gray-900 border-gray-400'
    }
  ]

  const colorOptions = [
    { value: '#ef4444', label: 'Red', color: 'bg-red-500' },
    { value: '#f97316', label: 'Orange', color: 'bg-orange-500' },
    { value: '#eab308', label: 'Yellow', color: 'bg-yellow-500' },
    { value: '#22c55e', label: 'Green', color: 'bg-green-500' },
    { value: '#3b82f6', label: 'Blue', color: 'bg-blue-500' },
    { value: '#8b5cf6', label: 'Purple', color: 'bg-purple-500' },
    { value: '#ec4899', label: 'Pink', color: 'bg-pink-500' },
    { value: '#06b6d4', label: 'Cyan', color: 'bg-cyan-500' }
  ]

  const handleColorChange = (color) => {
    updateUIPreference('primaryColor', color)
    // Apply color immediately to CSS variables
    document.documentElement.style.setProperty('--primary', color)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Theme Selection */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeOptions.map((option) => {
              const Icon = option.icon
              const isActive = theme === option.value
              return (
                <div
                  key={option.value}
                  className={`
                    relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                    ${isActive 
                      ? 'border-primary bg-primary/5 scale-105 shadow-lg' 
                      : 'border-border hover:border-primary/50 hover:scale-102'
                    }
                  `}
                  onClick={() => setTheme(option.value)}
                >
                  {/* Theme Preview */}
                  <div className={`w-full h-16 rounded-md mb-3 ${option.preview} transition-all duration-200`}>
                    <div className="p-2 h-full flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className={`font-medium mb-1 ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {option.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  
                  {isActive && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Primary Color */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div 
              className="w-5 h-5 rounded-full transition-all duration-200"
              style={{ backgroundColor: uiPreferences.primaryColor }}
            />
            Primary Color
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {colorOptions.map((color) => {
              const isActive = uiPreferences.primaryColor === color.value
              return (
                <button
                  key={color.value}
                  className={`
                    relative w-12 h-12 rounded-lg transition-all duration-200
                    ${color.color}
                    ${isActive 
                      ? 'scale-110 ring-4 ring-offset-2 ring-current shadow-lg' 
                      : 'hover:scale-105 hover:shadow-md'
                    }
                  `}
                  onClick={() => handleColorChange(color.value)}
                  title={color.label}
                >
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          
          {/* Custom Color Input */}
          <div className="mt-4 p-3 border rounded-lg">
            <Label className="text-sm font-medium mb-2 block">Custom Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={uiPreferences.primaryColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-12 h-8 rounded border cursor-pointer transition-all duration-200 hover:scale-105"
              />
              <span className="text-sm text-muted-foreground font-mono">
                {uiPreferences.primaryColor}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Preview */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-primary" />
            Layout Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Grid Columns Preview */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Grid Layout ({uiPreferences.gridColumns} columns)
              </Label>
              <div 
                className="grid gap-2 p-3 bg-muted/30 rounded-lg"
                style={{ 
                  gridTemplateColumns: `repeat(${Math.min(uiPreferences.gridColumns, 4)}, 1fr)` 
                }}
              >
                {Array.from({ length: Math.min(uiPreferences.gridColumns, 8) }).map((_, i) => (
                  <div 
                    key={i}
                    className={`
                      aspect-video bg-primary/20 rounded transition-all duration-200
                      ${uiPreferences.compactMode ? 'p-1' : 'p-2'}
                    `}
                  >
                    <div className="w-full h-full bg-primary/40 rounded-sm" />
                  </div>
                ))}
              </div>
            </div>

            {/* Display Options Preview */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Display Options</Label>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { key: 'showVideoDuration', label: 'Video duration', icon: '⏱️' },
                  { key: 'showProgressBar', label: 'Progress bar', icon: '📊' },
                  { key: 'showViewsCount', label: 'View count', icon: '👁️' },
                  { key: 'showChannelName', label: 'Channel name', icon: '📺' }
                ].map((item) => (
                  <div 
                    key={item.key}
                    className={`
                      flex items-center gap-2 p-2 rounded transition-all duration-200
                      ${uiPreferences[item.key] 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      }
                    `}
                  >
                    <span>{item.icon}</span>
                    <span className="text-xs">{item.label}</span>
                    <span className="ml-auto text-xs font-medium">
                      {uiPreferences[item.key] ? 'ON' : 'OFF'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Accessibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Font Size</Label>
              <span className={`
                px-2 py-1 rounded text-xs bg-muted
                ${uiPreferences.fontSize === 'small' ? 'text-sm' : ''}
                ${uiPreferences.fontSize === 'medium' ? 'text-base' : ''}
                ${uiPreferences.fontSize === 'large' ? 'text-lg' : ''}
              `}>
                {uiPreferences.fontSize}
              </span>
            </div>
            
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className={`
                transition-all duration-200
                ${uiPreferences.fontSize === 'small' ? 'text-sm' : ''}
                ${uiPreferences.fontSize === 'medium' ? 'text-base' : ''}
                ${uiPreferences.fontSize === 'large' ? 'text-lg' : ''}
              `}>
                Sample text with current font size setting
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AppearanceSettings