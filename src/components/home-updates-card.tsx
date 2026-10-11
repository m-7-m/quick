import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type HomeUpdatesCardProps = {
  updateCount: number
  isLoading: boolean
  isWorking: boolean
  error: string | null
  onCheck: () => void
  onUpdateAll: () => void
}

export default function HomeUpdatesCard({
  updateCount,
  isLoading,
  isWorking,
  error,
  onCheck,
  onUpdateAll,
}: HomeUpdatesCardProps) {
  if (updateCount === 0 && !error) return null

  if (error) {
    return (
      <div
        className="flex flex-wrap items-center justify-between gap-3"
        role="alert"
      >
        <p className="text-sm text-destructive">
          Could not check for updates: {error}
        </p>
        <Button disabled={isLoading} onClick={onCheck} variant="outline">
          Try again
        </Button>
      </div>
    )
  }

  return (
    <Card className="border-sky-500/30 bg-sky-500/5">
      <CardHeader className="flex flex-row flex-wrap items-center gap-4">
        <div>
          <CardTitle>
            {updateCount} update{updateCount === 1 ? "" : "s"} available
          </CardTitle>
          <CardDescription>
            Keep your installed apps up to date.
          </CardDescription>
        </div>
        <CardAction className="ml-auto flex gap-2">
          <Button
            disabled={isLoading || isWorking}
            onClick={onCheck}
            variant="outline"
          >
            Check again
          </Button>
          <Button
            disabled={isLoading || isWorking}
            onClick={onUpdateAll}
          >
            {isWorking ? "Updating…" : "Update all"}
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  )
}
