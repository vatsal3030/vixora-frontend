import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Slider } from '../ui/slider'
import { useSettings } from '../../context/SettingsContext'

const PlaybackSettings = () => {
  const { uiPreferences, updateUIPreference } = useSettings()

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Playback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="autoplay-next">Autoplay next video</Label>
            <Switch
              id="autoplay-next"
              checked={uiPreferences.autoplayNext}
              onCheckedChange={(checked) => updateUIPreference('autoplayNext', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="autoplay-hover">Autoplay on hover</Label>
            <Switch
              id="autoplay-hover"
              checked={uiPreferences.autoplayOnHover}
              onCheckedChange={(checked) => updateUIPreference('autoplayOnHover', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="loop-video">Loop videos</Label>
            <Switch
              id="loop-video"
              checked={uiPreferences.loopVideo}
              onCheckedChange={(checked) => updateUIPreference('loopVideo', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Default playback speed</Label>
            <Select
              value={uiPreferences.defaultPlaybackSpeed.toString()}
              onValueChange={(value) => updateUIPreference('defaultPlaybackSpeed', parseFloat(value))}
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

      <Card>
        <CardHeader>
          <CardTitle>Audio Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Default volume: {uiPreferences.defaultVolume}%</Label>
            <Slider
              value={[uiPreferences.defaultVolume]}
              onValueChange={([value]) => updateUIPreference('defaultVolume', value)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Player Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="remember-position">Remember playback position</Label>
            <Switch
              id="remember-position"
              checked={uiPreferences.rememberPlaybackPosition}
              onCheckedChange={(checked) => updateUIPreference('rememberPlaybackPosition', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="mini-player">Show mini player</Label>
            <Switch
              id="mini-player"
              checked={uiPreferences.showMiniPlayer}
              onCheckedChange={(checked) => updateUIPreference('showMiniPlayer', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label>Skip intro seconds: {uiPreferences.skipIntroSeconds}s</Label>
            <Slider
              value={[uiPreferences.skipIntroSeconds]}
              onValueChange={([value]) => updateUIPreference('skipIntroSeconds', value)}
              min={0}
              max={30}
              step={5}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Watch History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="save-history">Save watch history</Label>
              <p className="text-sm text-muted-foreground">
                Keep track of videos you've watched for recommendations
              </p>
            </div>
            <Switch
              id="save-history"
              checked={uiPreferences.saveWatchHistory}
              onCheckedChange={(checked) => updateUIPreference('saveWatchHistory', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PlaybackSettings