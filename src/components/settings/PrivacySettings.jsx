import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Button } from '../ui/button'
import { useSettings } from '../../context/SettingsContext'
import { Shield, Eye, EyeOff, History, Trash2 } from 'lucide-react'

const PrivacySettings = () => {
  const { accountSettings, updateAccountSetting, uiPreferences, updateUIPreference } = useSettings()

  const handleClearHistory = () => {
    console.log('History cleared')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Profile Visibility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Profile visibility</Label>
            <Select
              value={accountSettings.profileVisibility}
              onValueChange={(value) => updateAccountSetting('profileVisibility', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Public - Anyone can view your profile
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4" />
                    Private - Only you can view your profile
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-subscriptions">Show subscriptions</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see who you're subscribed to
              </p>
            </div>
            <Switch
              id="show-subscriptions"
              checked={accountSettings.showSubscriptions}
              onCheckedChange={(checked) => updateAccountSetting('showSubscriptions', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-liked">Show liked videos</Label>
              <p className="text-sm text-muted-foreground">
                Allow others to see your liked videos
              </p>
            </div>
            <Switch
              id="show-liked"
              checked={accountSettings.showLikedVideos}
              onCheckedChange={(checked) => updateAccountSetting('showLikedVideos', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interaction Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow-comments">Allow comments</Label>
              <p className="text-sm text-muted-foreground">
                Let others comment on your videos
              </p>
            </div>
            <Switch
              id="allow-comments"
              checked={accountSettings.allowComments}
              onCheckedChange={(checked) => updateAccountSetting('allowComments', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allow-mentions">Allow mentions</Label>
              <p className="text-sm text-muted-foreground">
                Let others mention you in comments
              </p>
            </div>
            <Switch
              id="allow-mentions"
              checked={accountSettings.allowMentions}
              onCheckedChange={(checked) => updateAccountSetting('allowMentions', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Watch History & Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="save-history">Save watch history</Label>
              <p className="text-sm text-muted-foreground">
                Keep track of videos you've watched
              </p>
            </div>
            <Switch
              id="save-history"
              checked={uiPreferences.saveWatchHistory}
              onCheckedChange={(checked) => updateUIPreference('saveWatchHistory', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Clear watch history</h4>
              <p className="text-sm text-muted-foreground">
                Remove all videos from your watch history
              </p>
            </div>
            <Button variant="outline" onClick={handleClearHistory}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear History
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data & Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="personalize-recs">Personalize recommendations</Label>
              <p className="text-sm text-muted-foreground">
                Use your activity to suggest relevant content
              </p>
            </div>
            <Switch
              id="personalize-recs"
              checked={uiPreferences.personalizeRecommendations}
              onCheckedChange={(checked) => updateUIPreference('personalizeRecommendations', checked)}
            />
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Data Usage</h4>
            <p className="text-sm text-muted-foreground">
              We use your watch history, likes, and subscriptions to personalize your experience. 
              You can disable this at any time, but it may affect the quality of recommendations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PrivacySettings