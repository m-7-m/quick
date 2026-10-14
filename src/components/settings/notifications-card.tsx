import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

const NOTIFICATIONS_STORAGE_KEY = "quick:notifications-enabled"

export function NotificationsCard() {
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) !== "false"
  )

  function updateNotifications(nextEnabled: boolean) {
    setEnabled(nextEnabled)
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, String(nextEnabled))
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Choose whether Quick can show notifications.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">App notifications</span>
            <span className="text-sm text-muted-foreground">
              {enabled ? "Notifications are on." : "Notifications are off."}
            </span>
          </div>
          <Switch
            aria-label="App notifications"
            checked={enabled}
            onCheckedChange={updateNotifications}
          />
        </div>
      </CardContent>
    </Card>
  )
}
