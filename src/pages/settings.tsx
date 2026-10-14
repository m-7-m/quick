import { useEffect, useState } from "react"
import { getVersion } from "@tauri-apps/api/app"
import Header from "@/components/header"
import { AboutCard } from "@/components/settings/about-card"
import { AppUpdatesCard } from "@/components/settings/app-updates-card"
import { AppearanceCard } from "@/components/settings/appearance-card"
import { NotificationsCard } from "@/components/settings/notifications-card"

export default function SettingsPage() {
  const [appVersion, setAppVersion] = useState<string | null>(null)
  const [versionError, setVersionError] = useState<string | null>(null)

  useEffect(() => {
    let disposed = false

    void getVersion()
      .then((version) => {
        if (!disposed) {
          setAppVersion(version)
        }
      })
      .catch((error: unknown) => {
        if (!disposed) {
          setVersionError(error instanceof Error ? error.message : String(error))
        }
      })

    return () => {
      disposed = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-8">
      <Header
        title="Settings"
        desc="Manage Quick's appearance and preferences"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AppearanceCard />
        <NotificationsCard />
        <AboutCard appVersion={appVersion} versionError={versionError} />
        <AppUpdatesCard appVersion={appVersion} />
      </div>
    </div>
  )
}
