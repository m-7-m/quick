import { isTauri } from "@tauri-apps/api/core"
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification"

export const NOTIFICATIONS_STORAGE_KEY = "quick:notifications-enabled"

export function areNotificationsEnabled() {
  return localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) !== "false"
}

export async function notifyInTray(title: string, body: string) {
  if (
    !isTauri() ||
    document.visibilityState !== "hidden" ||
    !areNotificationsEnabled()
  ) {
    return
  }

  try {
    let permissionGranted = await isPermissionGranted()
    if (!permissionGranted) {
      permissionGranted = (await requestPermission()) === "granted"
    }
    if (permissionGranted) {
      sendNotification({ title, body })
    }
  } catch (error: unknown) {
    console.error("Could not send a system notification:", error)
  }
}
