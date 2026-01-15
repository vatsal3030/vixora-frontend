import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Switch } from '../ui/switch'
import { Button } from '../ui/button'
import { useSettings } from '../../context/SettingsContext'
import { Bell, Mail, MessageSquare, Users, Megaphone } from 'lucide-react'

const NotificationSettings = () => {
  const { accountSettings, updateAccountSetting } = useSettings()

  const handleTestNotification = () => {
    // Test notification sent
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="comment-notifications">Comment notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone comments on your videos
              </p>
            </div>
            <Switch
              id="comment-notifications"
              checked={accountSettings.commentNotifications}
              onCheckedChange={(checked) => updateAccountSetting('commentNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="subscription-notifications">Subscription notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when channels you subscribe to upload new content
              </p>
            </div>
            <Switch
              id="subscription-notifications"
              checked={accountSettings.subscriptionNotifications}
              onCheckedChange={(checked) => updateAccountSetting('subscriptionNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="system-announcements">System announcements</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about platform updates and important announcements
              </p>
            </div>
            <Switch
              id="system-announcements"
              checked={accountSettings.systemAnnouncements}
              onCheckedChange={(checked) => updateAccountSetting('systemAnnouncements', checked)}
            />
          </div>

          <div className="pt-4 border-t">
            <Button variant="outline" onClick={handleTestNotification}>
              <Bell className="w-4 h-4 mr-2" />
              Test Notification
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications">Email notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={accountSettings.emailNotifications}
              onCheckedChange={(checked) => updateAccountSetting('emailNotifications', checked)}
            />
          </div>

          {accountSettings.emailNotifications && (
            <div className="ml-4 space-y-3 border-l-2 border-muted pl-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">New comments on your videos</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">New subscribers</span>
              </div>
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">New uploads from subscriptions</span>
              </div>
              <div className="flex items-center gap-3">
                <Megaphone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Platform announcements</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Smart Notifications</h4>
              <p className="text-sm text-muted-foreground">
                We'll group similar notifications together and send them at optimal times 
                to avoid overwhelming you with too many alerts.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 border rounded-lg">
                <div className="font-medium">Instant</div>
                <div className="text-muted-foreground">Immediate alerts</div>
              </div>
              <div className="text-center p-3 border rounded-lg bg-primary/5">
                <div className="font-medium">Smart (Recommended)</div>
                <div className="text-muted-foreground">Grouped & timed</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="font-medium">Daily Summary</div>
                <div className="text-muted-foreground">Once per day</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotificationSettings