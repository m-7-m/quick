import { invoke } from "@tauri-apps/api/core"
import { IconApps } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { Link } from "wouter"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type InstalledApp = {
  id: string
}

export default function InstalledAppsStatCard() {
  const [count, setCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let disposed = false

    void invoke<InstalledApp[]>("winget_list_installed")
      .then((apps) => {
        if (!disposed) setCount(apps.length)
      })
      .catch((loadError: unknown) => {
        if (!disposed) {
          setError(
            loadError instanceof Error ? loadError.message : String(loadError)
          )
        }
      })

    return () => {
      disposed = true
    }
  }, [])

  return (
    <Link href="/apps">
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle>Installed apps</CardTitle>
          <CardDescription>
            {error
              ? `Could not load count: ${error}`
              : count === null
                ? "Loading…"
                : "Apps currently installed"}
          </CardDescription>
          <CardAction>
            <IconApps className="size-10 rounded-lg bg-primary/10 p-2 text-primary" />
          </CardAction>
        </CardHeader>
        <CardContent className="text-3xl font-semibold tabular-nums">
          {error ? "—" : (count ?? "…")}
        </CardContent>
      </Card>
    </Link>
  )
}
