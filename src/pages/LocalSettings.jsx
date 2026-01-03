import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Label } from '../components/ui/label'
import { Switch } from '../components/ui/switch'
import { Slider } from '../components/ui/slider'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useLocalSettings } from '../context/LocalSettingsContext'
import { useTheme } from '../context/ThemeContext'
import SettingsDemo from '../components/SettingsDemo'
import { 
  Grid3X3, 
  Palette, 
  Type, 
  Eye, 
  BarChart3, 
  Sun, 
  Moon, 
  Monitor,
  RotateCcw,
  Check,
  Save
} from 'lucide-react'

const LocalSettings = () => {
  const { settings, updateSetting, resetSettings, saveStatus, lastSaved } = useLocalSettings()
  const { theme, setTheme } = useTheme()

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
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

  const fontSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ]

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Panel */}
          <div className="space-y-6">
            {/* Header with Save Status */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Local Settings</h1>
                <p className="text-muted-foreground">Customize your interface preferences</p>
              </div>
              
              {/* Save Status Indicator */}
              {saveStatus && (
                <div className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
                  ${saveStatus === 'saved' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300' : ''}
                  ${saveStatus === 'reset' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : ''}
                  animate-in slide-in-from-right duration-300
                `}>
                  {saveStatus === 'saved' && <Check className="w-4 h-4" />}
                  {saveStatus === 'reset' && <RotateCcw className="w-4 h-4" />}
                  <span className="text-sm font-medium">
                    {saveStatus === 'saved' ? 'Settings Saved!' : 'Settings Reset!'}
                  </span>
                  {lastSaved && (
                    <span className="text-xs opacity-75">
                      {new Date(lastSaved).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Theme Selection */}
            <Card className="transition-all duration-200 hover:shadow-md">
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
                        variant={isActive ? 'default' : 'outline'}
                        className={`
                          h-20 flex-col gap-2 transition-all duration-300
                          ${isActive ? 'scale-105 shadow-lg' : 'hover:scale-102'}
                        `}
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
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded-full transition-all duration-200"
                    style={{ backgroundColor: settings.primaryColor }}
                  />
                  Primary Color
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  {colorOptions.map((color) => {
                    const isActive = settings.primaryColor === color.value
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
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5 text-primary" />
                  Grid Layout
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Videos per row</Label>
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                      {settings.gridColumns}
                    </span>
                  </div>
                  <Slider
                    value={[settings.gridColumns]}
                    onValueChange={([value]) => updateSetting('gridColumns', value)}
                    min={2}
                    max={6}
                    step={1}
                    className="w-full transition-all duration-200"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:bg-muted/50">
                  <div>
                    <Label htmlFor="compact-mode" className="font-medium">Compact mode</Label>
                    <p className="text-xs text-muted-foreground">Reduce spacing between elements</p>
                  </div>
                  <Switch
                    id="compact-mode"
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                    className="transition-all duration-200"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Typography */}
            <Card className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-primary" />
                  Typography
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Font size</Label>
                  <Select
                    value={settings.fontSize}
                    onValueChange={(value) => updateSetting('fontSize', value)}
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

            {/* Reset Settings */}
            <Card className="border-orange-200 dark:border-orange-800 transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <RotateCcw className="w-5 h-5" />
                  Reset Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div>
                    <h4 className="font-medium text-orange-900 dark:text-orange-100">Reset to defaults</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      This will reset all settings to their default values
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={resetSettings}
                    className="border-orange-200 text-orange-600 hover:bg-orange-50 transition-all duration-200 hover:scale-105"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Live Preview Panel */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Live Preview</h2>
              <p className="text-muted-foreground">See how your settings affect the interface</p>
            </div>
            <SettingsDemo />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocalSettings