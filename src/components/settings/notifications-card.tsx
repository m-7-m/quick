import { useState } from "react"
import { isTauri } from "@tauri-apps/api/core"
import {
  isPermissionGranted,
  requestPermission,
} from "@tauri-apps/plugin-notification"
import { NOTIFICATIONS_STORAGE_KEY } from "@/lib/notifications"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

export function NotificationsCard() {
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) !== "false"
  )
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  async function updateNotifications(nextEnabled: boolean) {
    setError(null)
    setIsUpdating(true)
    try {
      if (nextEnabled && isTauri()) {
        let permissionGranted = await isPermissionGranted()
        if (!permissionGranted) {
          permissionGranted = (await requestPermission()) === "granted"
        }
        if (!permissionGranted) {
          setError("System notification permission was not granted.")
          return
        }
      }

      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, String(nextEnabled))
      setEnabled(nextEnabled)
    } catch (updateError: unknown) {
      setError(
        updateError instanceof Error ? updateError.message : String(updateError)
      )
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Get available update counts and app install, removal, and update
            notifications while Quick is in the system tray.
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
            disabled={isUpdating}
            onCheckedChange={updateNotifications}
          />
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            Could not update notifications: {error}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
