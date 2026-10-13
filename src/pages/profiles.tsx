import { useEffect, useState } from "react"
import { IconPlus } from "@tabler/icons-react"
import { toast } from "sonner"
import ProfileCard from "@/components/profile-card"
import CreateProfileDialog from "@/components/create-profile-dialog"
import { AppProfiles, type AppProfile } from "@/constants/profiles"
import Header from "@/components/header"
import { useWinget } from "@/hooks/use-winget"
import {
  loadCustomProfiles,
  saveCustomProfiles,
} from "@/lib/custom-profiles"
import { Button } from "@/components/ui/button"

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
  const [customProfiles, setCustomProfiles] = useState<AppProfile[]>([])
  const [profilesLoaded, setProfilesLoaded] = useState(false)
  const [selectedApps, setSelectedApps] =
    useState<Record<string, Set<string>>>(initialSelectedApps)
  const [busyProfile, setBusyProfile] = useState<string | null>(null)
  const [installProgress, setInstallProgress] = useState<{
    current: number
    total: number
  } | null>(null)
  const { install } = useWinget()

  useEffect(() => {
    try {
      const storedProfiles = loadCustomProfiles()
      setCustomProfiles(storedProfiles)
      setSelectedApps((current) => ({
        ...current,
        ...Object.fromEntries(
          storedProfiles.map((profile) => [
            profile.name,
            new Set(profile.apps.map((app) => app.id)),
          ])
        ),
      }))
    } catch (error: unknown) {
      toast.error(`Could not load custom profiles: ${errorMessage(error)}`)
    } finally {
      setProfilesLoaded(true)
    }
  }, [])

  function saveProfiles(nextProfiles: AppProfile[]): boolean {
    try {
      saveCustomProfiles(nextProfiles)
      setCustomProfiles(nextProfiles)
      return true
    } catch (error: unknown) {
      toast.error(`Could not save custom profiles: ${errorMessage(error)}`)
      return false
    }
  }

  function createProfile(name: string): boolean {
    const normalizedName = name.trim()
    if (
      [...AppProfiles, ...customProfiles].some(
        (profile) => profile.name.toLowerCase() === normalizedName.toLowerCase()
      )
    ) {
      toast.error("A profile with this name already exists.")
      return false
    }

    const nextProfiles = [
      ...customProfiles,
      { name: normalizedName, apps: [] },
    ]
    if (!saveProfiles(nextProfiles)) return false
    setSelectedApps((current) => ({
      ...current,
      [normalizedName]: new Set<string>(),
    }))
    return true
  }

  function deleteProfile(profileName: string) {
    const nextProfiles = customProfiles.filter(
      (profile) => profile.name !== profileName
    )
    if (!saveProfiles(nextProfiles)) return

    setSelectedApps((current) => {
      const nextSelections = { ...current }
      delete nextSelections[profileName]
      return nextSelections
    })
  }

  function addAppsToProfile(profileName: string, apps: AppProfile["apps"]) {
    const profile = customProfiles.find((item) => item.name === profileName)
    if (!profile) return

    const existingIds = new Set(profile.apps.map((app) => app.id))
    const newApps = apps.filter((app) => !existingIds.has(app.id))
    if (newApps.length === 0) return

    const nextProfiles = customProfiles.map((item) =>
      item.name === profileName
        ? { ...item, apps: [...item.apps, ...newApps] }
        : item
    )
    if (!saveProfiles(nextProfiles)) return

    setSelectedApps((current) => {
      const nextSelection = new Set(current[profileName] ?? [])
      newApps.forEach((app) => nextSelection.add(app.id))
      return { ...current, [profileName]: nextSelection }
    })
  }

  function toggleApp(profileName: string, appId: string, checked: boolean) {
    setSelectedApps((current) => {
      const nextSelection = new Set(current[profileName] ?? [])
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
      selectedApps[profile.name]?.has(app.id)
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
      <div className="flex justify-end">
        <CreateProfileDialog
          disabled={!profilesLoaded || busyProfile !== null}
          onCreate={createProfile}
          trigger={
            <Button disabled={!profilesLoaded || busyProfile !== null}>
              <IconPlus aria-hidden="true" />
              Create profile
            </Button>
          }
        />
      </div>
      <div className="flex flex-col gap-4">
        {[...AppProfiles, ...customProfiles].map((profile) => (
          <ProfileCard
            key={profile.name}
            profile={profile}
            selectedAppIds={selectedApps[profile.name] ?? new Set<string>()}
            isDisabled={busyProfile !== null}
            isInstalling={busyProfile === profile.name}
            isCustom={customProfiles.includes(profile)}
            onDelete={() => deleteProfile(profile.name)}
            installProgress={
              busyProfile === profile.name ? installProgress : null
            }
            onAddApps={(apps) => addAppsToProfile(profile.name, apps)}
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
