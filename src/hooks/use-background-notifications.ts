import { useEffect } from "react"
import { isTauri } from "@tauri-apps/api/core"
import { notifyInTray } from "@/lib/notifications"
import { loadAvailableUpdates } from "@/lib/winget-cache"

const UPDATE_CHECK_INTERVAL_MS = 15 * 60 * 1000

export function useBackgroundNotifications() {
  useEffect(() => {
    if (!isTauri()) return

    let disposed = false
    let checkingUpdates = false
    let previousUpdateIds: string | undefined
    let notifyOnNextCheck = document.visibilityState === "hidden"

    async function checkAvailableUpdates() {
      if (
        disposed ||
        checkingUpdates ||
        document.visibilityState !== "hidden"
      ) {
        return
      }

      checkingUpdates = true
      try {
        const updates = await loadAvailableUpdates(true)
        if (disposed) return

        const updateIds = updates
          .map((update) => update.id)
          .sort()
          .join("\n")
        const isFirstCheck = previousUpdateIds === undefined
        const updatesChanged =
          !isFirstCheck && previousUpdateIds !== updateIds
        previousUpdateIds = updateIds
        const shouldNotify =
          notifyOnNextCheck || updatesChanged || isFirstCheck
        notifyOnNextCheck = false

        if (updates.length > 0 && shouldNotify) {
          const count = updates.length
          void notifyInTray(
            `${count} update${count === 1 ? "" : "s"} available`,
            "Open Quick to review available app updates."
          )
        }
      } catch (error: unknown) {
        console.error("Could not check for app updates in the background:", error)
      } finally {
        checkingUpdates = false
      }
    }

    async function initializeUpdateCount() {
      try {
        const updates = await loadAvailableUpdates()
        if (!disposed) {
          previousUpdateIds = updates
            .map((update) => update.id)
            .sort()
            .join("\n")
          if (document.visibilityState === "hidden") {
            await checkAvailableUpdates()
          }
        }
      } catch (error: unknown) {
        console.error("Could not initialize background update checks:", error)
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        notifyOnNextCheck = true
        void checkAvailableUpdates()
      }
    }

    void initializeUpdateCount()
    const intervalId = window.setInterval(() => {
      void checkAvailableUpdates()
    }, UPDATE_CHECK_INTERVAL_MS)
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      disposed = true
      window.clearInterval(intervalId)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [])
}
