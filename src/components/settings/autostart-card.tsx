import { useEffect, useState } from "react"
import {
  disable,
  enable,
  isEnabled,
} from "@tauri-apps/plugin-autostart"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AutostartCard() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let disposed = false

    void isEnabled()
      .then((isAutostartEnabled) => {
        if (!disposed) {
          setEnabled(isAutostartEnabled)
        }
      })
      .catch((loadError: unknown) => {
        if (!disposed) {
          setError(
            loadError instanceof Error ? loadError.message : String(loadError)
          )
        }
      })
      .finally(() => {
        if (!disposed) {
          setLoading(false)
        }
      })

    return () => {
      disposed = true
    }
  }, [])

  async function updateAutostart(nextEnabled: boolean) {
    setLoading(true)
    setError(null)

    try {
      if (nextEnabled) {
        await enable()
      } else {
        await disable()
      }
      setEnabled(nextEnabled)
    } catch (updateError: unknown) {
      setError(
        updateError instanceof Error ? updateError.message : String(updateError)
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Startup</CardTitle>
          <CardDescription>
            Choose whether Quick launches when you sign in to your device.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              Launch Quick at startup
            </span>
            <span className="text-sm text-muted-foreground">
              {loading
                ? "Checking startup setting…"
                : enabled
                  ? "Quick will launch when you sign in."
                  : "Quick will not launch automatically."}
            </span>
          </div>
          <Switch
            aria-label="Launch Quick at startup"
            checked={enabled ?? false}
            disabled={loading || enabled === null}
            onCheckedChange={updateAutostart}
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            Could not update the startup setting: {error}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
