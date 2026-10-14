import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AppsTable } from "@/components/apps-table"
import { TableSearch } from "@/components/table-search"
import { UninstallAlert } from "@/components/uninstall-alert"
import { useWinget } from "@/hooks/use-winget"
import {
  getCachedInstalledApps,
  loadInstalledApps,
  setCachedInstalledApps,
  type InstalledApp,
} from "@/lib/winget-cache"

export default function InstalledApps() {
  const cachedApps = getCachedInstalledApps()
  const [apps, setApps] = useState<InstalledApp[]>(cachedApps ?? [])
  const [isLoadingApps, setIsLoadingApps] = useState(cachedApps === undefined)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busyAppId, setBusyAppId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const { remove, isLoading: isRemoving } = useWinget()

  useEffect(() => {
    let disposed = false

    void loadInstalledApps()
      .then((installedApps) => {
        if (!disposed) {
          setApps(installedApps)
          setLoadError(null)
        }
      })
      .catch((error: unknown) => {
        if (!disposed) {
          setLoadError(error instanceof Error ? error.message : String(error))
        }
      })
      .finally(() => {
        if (!disposed) setIsLoadingApps(false)
      })

    return () => {
      disposed = true
    }
  }, [])

  async function uninstallApp(app: InstalledApp) {
    setBusyAppId(app.id)
    try {
      await remove(app.id, app.name)
      const remainingApps = apps.filter(
        (installedApp) => installedApp.id !== app.id
      )
      setApps(remainingApps)
      setCachedInstalledApps(remainingApps)
      toast.success(`${app.name} uninstalled successfully.`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      toast.error(`Could not uninstall ${app.name}: ${message}`)
    } finally {
      setBusyAppId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <CardTitle>Installed apps</CardTitle>
          <CardDescription>
            {isLoadingApps
              ? "Loading installed apps…"
              : `${apps.length} app${apps.length === 1 ? "" : "s"} installed`}
          </CardDescription>
        </div>
        <div className="ml-auto">
          <TableSearch value={search} onChange={setSearch} />
        </div>
      </CardHeader>
      <CardContent>
        <AppsTable
          apps={apps}
          emptyMessage="No installed apps found."
          isLoading={isLoadingApps}
          loadError={loadError}
          loadErrorEmptyMessage="Installed apps could not be loaded."
          loadErrorMessage="Could not load installed apps"
          loadingMessage="Loading installed apps…"
          renderAction={(app) => (
            <UninstallAlert
              appName={app.name}
              disabled={isRemoving}
              isLoading={busyAppId === app.id}
              onConfirm={() => uninstallApp(app)}
            />
          )}
          search={search}
        />
      </CardContent>
    </Card>
  )
}
