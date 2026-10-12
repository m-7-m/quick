import { useState } from "react"
import { toast } from "sonner"
import ProfileCard from "@/components/profile-card"
import { AppProfiles, type AppProfile } from "@/constants/profiles"
import Header from "@/components/header"
import { useWinget } from "@/hooks/use-winget"

const initialSelectedApps = Object.fromEntries(
  AppProfiles.map((profile) => [
    profile.name,
    new Set(profile.apps.map((app) => app.id)),
  ])
)

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export default function ProfilesPage() {
  const [selectedApps, setSelectedApps] =
    useState<Record<string, Set<string>>>(initialSelectedApps)
  const [busyProfile, setBusyProfile] = useState<string | null>(null)
  const [installProgress, setInstallProgress] = useState<{
    current: number
    total: number
  } | null>(null)
  const { install } = useWinget()

  function toggleApp(profileName: string, appId: string, checked: boolean) {
    setSelectedApps((current) => {
      const nextSelection = new Set(current[profileName])
      if (checked) {
        nextSelection.add(appId)
      } else {
        nextSelection.delete(appId)
      }
      return { ...current, [profileName]: nextSelection }
    })
  }

  async function installProfile(profile: AppProfile) {
    const appsToInstall = profile.apps.filter((app) =>
      selectedApps[profile.name].has(app.id)
    )
    if (appsToInstall.length === 0) return

    setBusyProfile(profile.name)
    setInstallProgress({ current: 0, total: appsToInstall.length })
    const installed: string[] = []
    const failed: { appId: string; message: string }[] = []

    try {
      for (const [index, app] of appsToInstall.entries()) {
        setInstallProgress({ current: index + 1, total: appsToInstall.length })
        try {
          await install(app.id)
          installed.push(app.name)
        } catch (error: unknown) {
          failed.push({ appId: app.name, message: errorMessage(error) })
        }
      }

      if (installed.length > 0) {
        toast.success(
          `${installed.length} app${installed.length === 1 ? "" : "s"} installed successfully.`
        )
      }
      if (failed.length > 0) {
        toast.error(
          `Could not install: ${failed.map(({ appId, message }) => `${appId}: ${message}`).join("; ")}`
        )
      }
    } finally {
      setBusyProfile(null)
      setInstallProgress(null)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Header
        title="Profiles"
        desc="Choose apps to install from each profile"
      />
      <div className="flex flex-col gap-4">
        {AppProfiles.map((profile) => (
          <ProfileCard
            key={profile.name}
            profile={profile}
            selectedAppIds={selectedApps[profile.name]}
            isDisabled={busyProfile !== null}
            isInstalling={busyProfile === profile.name}
            installProgress={
              busyProfile === profile.name ? installProgress : null
            }
            onToggleApp={(appId, checked) =>
              toggleApp(profile.name, appId, checked)
            }
            onInstall={() => void installProfile(profile)}
          />
        ))}
      </div>
    </div>
  )
}
