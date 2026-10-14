import { useEffect, useState } from "react"
import {
  IconFileImport,
  IconFileExport,
  IconPlus,
} from "@tabler/icons-react"
import { open, save } from "@tauri-apps/plugin-dialog"
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs"
import { toast } from "sonner"
import ProfileCard from "@/components/profile-card"
import CreateProfileDialog from "@/components/create-profile-dialog"
import { AppProfiles, type AppProfile } from "@/constants/profiles"
import Header from "@/components/header"
import { useWinget } from "@/hooks/use-winget"
import {
  loadCustomProfiles,
  parseCustomProfiles,
  saveCustomProfiles,
  serializeCustomProfiles,
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
  const [initialProfiles] = useState(() => {
    try {
      return { profiles: loadCustomProfiles(), error: null }
    } catch (error: unknown) {
      return { profiles: [], error: errorMessage(error) }
    }
  })
  const [customProfiles, setCustomProfiles] = useState<AppProfile[]>(
    initialProfiles.profiles
  )
  const [selectedApps, setSelectedApps] =
    useState<Record<string, Set<string>>>(() => ({
      ...initialSelectedApps,
      ...Object.fromEntries(
        initialProfiles.profiles.map((profile) => [
          profile.name,
          new Set(profile.apps.map((app) => app.id)),
        ])
      ),
    }))
  const [busyProfile, setBusyProfile] = useState<string | null>(null)
  const [installProgress, setInstallProgress] = useState<{
    current: number
    total: number
  } | null>(null)
  const { install } = useWinget()

  useEffect(() => {
    if (initialProfiles.error) {
      toast.error(`Could not load custom profiles: ${initialProfiles.error}`)
    }
  }, [initialProfiles.error])

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

  async function exportProfiles() {
    try {
      const filePath = await save({
        defaultPath: "quick-custom-profiles.json",
        filters: [{ name: "JSON", extensions: ["json"] }],
      })
      if (!filePath) return

      await writeTextFile(filePath, serializeCustomProfiles(customProfiles))
      toast.success(
        `Exported ${customProfiles.length} custom profile${customProfiles.length === 1 ? "" : "s"}.`
      )
    } catch (error: unknown) {
      toast.error(`Could not export custom profiles: ${errorMessage(error)}`)
    }
  }

  async function importProfiles() {
    try {
      const filePath = await open({
        multiple: false,
        filters: [{ name: "JSON", extensions: ["json"] }],
      })
      if (typeof filePath !== "string") return

      const importedProfiles = parseCustomProfiles(
        await readTextFile(filePath)
      )
      if (importedProfiles.length === 0) {
        toast.error("The selected file does not contain any custom profiles.")
        return
      }

      const existingNames = new Set(
        [...AppProfiles, ...customProfiles].map((profile) =>
          profile.name.trim().toLowerCase()
        )
      )
      const profilesToImport = importedProfiles
        .map((profile) => ({ ...profile, name: profile.name.trim() }))
        .filter((profile) => {
          const normalizedName = profile.name.toLowerCase()
          if (existingNames.has(normalizedName)) return false
          existingNames.add(normalizedName)
          return true
        })

      if (profilesToImport.length === 0) {
        toast.error("No profiles imported. All profile names already exist.")
        return
      }

      const nextProfiles = [...customProfiles, ...profilesToImport]
      if (!saveProfiles(nextProfiles)) return

      setSelectedApps((current) => ({
        ...current,
        ...Object.fromEntries(
          profilesToImport.map((profile) => [
            profile.name,
            new Set(profile.apps.map((app) => app.id)),
          ])
        ),
      }))
      const skippedCount = importedProfiles.length - profilesToImport.length
      toast.success(
        `Imported ${profilesToImport.length} custom profile${profilesToImport.length === 1 ? "" : "s"}${skippedCount > 0 ? `; skipped ${skippedCount} with duplicate names` : ""}.`
      )
    } catch (error: unknown) {
      toast.error(`Could not import custom profiles: ${errorMessage(error)}`)
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

  function removeAppFromProfile(profileName: string, appId: string) {
    const nextProfiles = customProfiles.map((profile) =>
      profile.name === profileName
        ? {
            ...profile,
            apps: profile.apps.filter((app) => app.id !== appId),
          }
        : profile
    )
    if (!saveProfiles(nextProfiles)) return

    setSelectedApps((current) => {
      const nextSelection = new Set(current[profileName] ?? [])
      nextSelection.delete(appId)
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
          await install(app.id, app.name)
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
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          disabled={busyProfile !== null}
          onClick={() => void importProfiles()}
          variant="outline"
        >
          <IconFileImport aria-hidden="true" />
          Import profiles
        </Button>
        <Button
          disabled={
            busyProfile !== null || customProfiles.length === 0
          }
          onClick={() => void exportProfiles()}
          variant="outline"
        >
          <IconFileExport aria-hidden="true" />
          Export profiles
        </Button>
        <CreateProfileDialog
          disabled={busyProfile !== null}
          onCreate={createProfile}
          trigger={
            <Button disabled={busyProfile !== null}>
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
            onRemoveApp={(appId) =>
              removeAppFromProfile(profile.name, appId)
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
