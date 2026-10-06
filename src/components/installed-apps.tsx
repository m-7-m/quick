import { invoke } from "@tauri-apps/api/core"
import { IconTrash } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type InstalledApp = {
  name: string
  id: string
  version: string
  source: string | null
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export default function InstalledApps() {
  const [apps, setApps] = useState<InstalledApp[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [busyAppId, setBusyAppId] = useState<string | null>(null)

  useEffect(() => {
    let disposed = false

    void invoke<InstalledApp[]>("winget_list_installed")
      .then((installedApps) => {
        if (!disposed) setApps(installedApps)
      })
      .catch((error: unknown) => {
        if (!disposed) setLoadError(errorMessage(error))
      })
      .finally(() => {
        if (!disposed) setIsLoading(false)
      })

    return () => {
      disposed = true
    }
  }, [])

  function toggleApp(id: string, checked: boolean | "indeterminate") {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleAll(checked: boolean | "indeterminate") {
    setSelectedIds(checked ? new Set(apps.map((app) => app.id)) : new Set())
  }

  async function uninstallApp(app: InstalledApp) {
    if (!window.confirm(`Uninstall ${app.name}?`)) return

    setBusyAppId(app.id)
    setActionError(null)
    try {
      await invoke("winget_uninstall", { id: app.id })
      setApps((current) =>
        current.filter((installedApp) => installedApp.id !== app.id)
      )
      setSelectedIds((current) => {
        const next = new Set(current)
        next.delete(app.id)
        return next
      })
    } catch (error) {
      setActionError(`Could not uninstall ${app.name}: ${errorMessage(error)}`)
    } finally {
      setBusyAppId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Installed apps</CardTitle>
        <CardDescription>
          {isLoading
            ? "Loading installed apps…"
            : `${apps.length} app${apps.length === 1 ? "" : "s"} installed${selectedIds.size ? ` · ${selectedIds.size} selected` : ""}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadError && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            Could not load installed apps: {loadError}
          </p>
        )}
        {actionError && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {actionError}
          </p>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  aria-label="Select all installed apps"
                  checked={apps.length > 0 && selectedIds.size === apps.length}
                  disabled={isLoading || apps.length === 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Version</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  Loading installed apps…
                </TableCell>
              </TableRow>
            ) : apps.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8 text-center text-muted-foreground"
                >
                  {loadError
                    ? "Installed apps could not be loaded."
                    : "No installed apps found."}
                </TableCell>
              </TableRow>
            ) : (
              apps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <Checkbox
                      aria-label={`Select ${app.name}`}
                      checked={selectedIds.has(app.id)}
                      onCheckedChange={(checked) => toggleApp(app.id, checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{app.name}</TableCell>
                  <TableCell>{app.version}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={busyAppId !== null}
                      onClick={() => void uninstallApp(app)}
                    >
                      <IconTrash />
                      {busyAppId === app.id ? "Removing…" : "Uninstall"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
