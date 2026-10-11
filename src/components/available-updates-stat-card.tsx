import { invoke } from "@tauri-apps/api/core"
import { IconRefresh } from "@tabler/icons-react"
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

type AvailableUpdate = {
  id: string
}

export default function AvailableUpdatesStatCard() {
  const [count, setCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let disposed = false

    void invoke<AvailableUpdate[]>("winget_list_available_updates")
      .then((updates) => {
        if (!disposed) setCount(updates.length)
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
    <Link href="/updates">
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle>Available updates</CardTitle>
          <CardDescription>
            {error
              ? `Could not load count: ${error}`
              : count === null
                ? "Loading…"
                : "Updates you can install"}
          </CardDescription>
          <CardAction>
            <IconRefresh className="size-10 rounded-lg bg-sky-500/10 p-2 text-sky-500" />
          </CardAction>
        </CardHeader>
        <CardContent className="text-3xl font-semibold tabular-nums">
          {error ? "—" : (count ?? "…")}
        </CardContent>
      </Card>
    </Link>
  )
}
