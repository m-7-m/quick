import { invoke } from "@tauri-apps/api/core"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { AppsTable } from "@/components/apps-table"
import Header from "@/components/header"
import { TableSearch } from "@/components/table-search"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useWinget } from "@/hooks/use-winget"

type AvailableUpdate = {
  name: string
  id: string
  current_version: string
  available_version: string
  source: string | null
}

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<AvailableUpdate[]>([])
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadVersion, setReloadVersion] = useState(0)
  const [busyAppId, setBusyAppId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const { update, updateAll, isLoading: isUpdating } = useWinget()

  useEffect(() => {
    let disposed = false

    void invoke<AvailableUpdate[]>("winget_list_available_updates")
      .then((availableUpdates) => {
        if (!disposed) setUpdates(availableUpdates)
      })
      .catch((error: unknown) => {
        if (!disposed) {
          setLoadError(error instanceof Error ? error.message : String(error))
        }
      })
      .finally(() => {
        if (!disposed) setIsLoadingUpdates(false)
      })

    return () => {
      disposed = true
    }
  }, [reloadVersion])

  function refreshUpdates() {
    setIsLoadingUpdates(true)
    setLoadError(null)
    setReloadVersion((version) => version + 1)
  }

  async function updateApp(app: AvailableUpdate) {
    setBusyAppId(app.id)
    try {
      await update(app.id)
      toast.success(`${app.name} updated successfully.`)
      refreshUpdates()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      toast.error(`Could not update ${app.name}: ${message}`)
    } finally {
      setBusyAppId(null)
    }
  }

  async function updateAllAvailableApps() {
    try {
      await updateAll()
      toast.success("All available updates installed successfully.")
      refreshUpdates()
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      toast.error(`Could not update all apps: ${message}`)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Header title="Updates" desc="Update your installed apps" />
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <CardTitle>Available updates</CardTitle>
            <CardDescription>
              {isLoadingUpdates
                ? "Checking for available updates…"
                : `${updates.length} update${updates.length === 1 ? "" : "s"} available`}
            </CardDescription>
          </div>
          <div className="ml-auto flex flex-col items-end gap-2">
            <TableSearch value={search} onChange={setSearch} />
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={isLoadingUpdates || isUpdating}
                onClick={refreshUpdates}
              >
                Check for updates
              </Button>
              <Button
                disabled={
                  isLoadingUpdates ||
                  isUpdating ||
                  loadError !== null ||
                  updates.length === 0
                }
                onClick={updateAllAvailableApps}
              >
                Update all
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AppsTable
            apps={updates.map((app) => ({
              ...app,
              version: app.current_version,
            }))}
            emptyMessage="All your apps are up to date."
            isLoading={isLoadingUpdates}
            loadError={loadError}
            loadErrorEmptyMessage="Available updates could not be loaded."
            loadErrorMessage="Could not check for updates"
            loadingMessage="Checking for available updates…"
            renderAction={(app) => (
              <Button disabled={isUpdating} onClick={() => updateApp(app)}>
                {busyAppId === app.id ? "Updating…" : "Update"}
              </Button>
            )}
            renderVersion={(app) => (
              <span>
                {app.current_version}
                <span className="mx-2 text-muted-foreground" aria-hidden="true">
                  →
                </span>
                <span className="font-medium">{app.available_version}</span>
              </span>
            )}
            search={search}
          />
        </CardContent>
      </Card>
    </div>
  )
}
