import { useCallback, useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import {
  installApp,
  removeApp,
  updateAllApps,
  updateApp,
} from "@/lib/setup/winget"
import {
  invalidateAvailableUpdatesCache,
  invalidateInstalledAppsCache,
} from "@/lib/winget-cache"
import { notifyInTray } from "@/lib/notifications"

export type WingetPackage = {
  name: string
  id: string
  version: string
  source: string | null
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function useWinget() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runOperation = useCallback(async <T>(operation: () => Promise<T>) => {
    setIsLoading(true)
    setError(null)

    try {
      return await operation()
    } catch (operationError) {
      setError(errorMessage(operationError))
      throw operationError
    } finally {
      setIsLoading(false)
    }
  }, [])

  const install = useCallback(
    (id: string, name = id) =>
      runOperation(async () => {
        await installApp(id)
        invalidateInstalledAppsCache()
        invalidateAvailableUpdatesCache()
        void notifyInTray("App installed", `${name} was installed successfully.`)
      }),
    [runOperation]
  )
  const searchApps = useCallback(
    (query: string) =>
      runOperation(() =>
        invoke<WingetPackage[]>("winget_search", { query })
      ),
    [runOperation]
  )
  const update = useCallback(
    (id: string, name = id) =>
      runOperation(async () => {
        await updateApp(id)
        invalidateInstalledAppsCache()
        invalidateAvailableUpdatesCache()
        void notifyInTray("App updated", `${name} was updated successfully.`)
      }),
    [runOperation]
  )
  const updateAll = useCallback(
    () =>
      runOperation(async () => {
        await updateAllApps()
        invalidateInstalledAppsCache()
        invalidateAvailableUpdatesCache()
        void notifyInTray(
          "Apps updated",
          "All available app updates were installed successfully."
        )
      }),
    [runOperation]
  )
  const remove = useCallback(
    (id: string, name = id) =>
      runOperation(async () => {
        await removeApp(id)
        invalidateInstalledAppsCache()
        invalidateAvailableUpdatesCache()
        void notifyInTray("App removed", `${name} was uninstalled successfully.`)
      }),
    [runOperation]
  )
  const clearError = useCallback(() => setError(null), [])

  return {
    install,
    searchApps,
    update,
    updateAll,
    remove,
    isLoading,
    error,
    clearError,
  }
}
