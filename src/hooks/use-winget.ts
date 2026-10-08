import { useCallback, useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import {
  installApp,
  removeApp,
  updateAllApps,
  updateApp,
} from "@/lib/setup/winget"

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
    (id: string) => runOperation(() => installApp(id)),
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
    (id: string) => runOperation(() => updateApp(id)),
    [runOperation]
  )
  const updateAll = useCallback(
    () => runOperation(updateAllApps),
    [runOperation]
  )
  const remove = useCallback(
    (id: string) => runOperation(() => removeApp(id)),
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
