import { useState, type FormEvent } from "react"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import { AppIcon } from "@/components/app-icon"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useWinget, type WingetPackage } from "@/hooks/use-winget"
import type { AppProfile } from "@/constants/profiles"

type AddProfileAppsDialogProps = {
  disabled: boolean
  existingApps: AppProfile["apps"]
  onAddApps: (apps: AppProfile["apps"]) => void
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export default function AddProfileAppsDialog({
  disabled,
  existingApps,
  onAddApps,
}: AddProfileAppsDialogProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<WingetPackage[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { searchApps } = useWinget()
  const existingIds = new Set(existingApps.map((app) => app.id))

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const searchQuery = query.trim()
    if (!searchQuery) return

    setIsSearching(true)
    setHasSearched(true)
    setError(null)
    try {
      setResults(await searchApps(searchQuery))
    } catch (searchError: unknown) {
      setResults([])
      setError(errorMessage(searchError))
    } finally {
      setIsSearching(false)
    }
  }

  function addApp(app: WingetPackage) {
    onAddApps([{ id: app.id, name: app.name }])
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setQuery("")
          setResults([])
          setHasSearched(false)
          setError(null)
        }
      }}
    >
      <DialogTrigger
        disabled={disabled}
        render={
          <Button variant="outline" disabled={disabled}>
            <IconPlus aria-hidden="true" />
            Add apps
          </Button>
        }
      />
      <DialogContent className="flex h-[min(40rem,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-2xl flex-col gap-3 overflow-hidden sm:max-w-2xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Add apps to profile</DialogTitle>
          <DialogDescription>
            Search the WinGet catalog and add apps to this profile.
          </DialogDescription>
        </DialogHeader>
        <form className="flex shrink-0 flex-col gap-3" onSubmit={search}>
          <InputGroup>
            <InputGroupAddon>
              <IconSearch aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search WinGet apps"
              autoComplete="off"
              disabled={isSearching}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Search apps…"
              type="search"
              value={query}
            />
            <InputGroupAddon align="inline-end">
              <Button
                disabled={isSearching || !query.trim()}
                size="sm"
                type="submit"
                variant="ghost"
              >
                {isSearching ? "Searching…" : "Search"}
              </Button>
            </InputGroupAddon>
          </InputGroup>
        </form>
        {error && (
          <p className="shrink-0 text-sm text-destructive" role="alert">
            Could not search WinGet: {error}
          </p>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {isSearching ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Searching the WinGet catalog…
            </p>
          ) : results.length > 0 ? (
            <ul className="flex flex-col">
              {results.map((app) => {
                const isAdded = existingIds.has(app.id)
                return (
                  <li
                    className="flex items-center gap-3 border-b py-3 last:border-b-0"
                    key={app.id}
                  >
                    <AppIcon
                      appId={app.id}
                      appName={app.name}
                      className="size-6 shrink-0"
                    />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">
                        {app.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {app.id}
                      </span>
                    </span>
                    <Button
                      disabled={isAdded}
                      onClick={() => addApp(app)}
                      size="sm"
                      type="button"
                      variant={isAdded ? "secondary" : "outline"}
                    >
                      {isAdded ? "Added" : "Add"}
                    </Button>
                  </li>
                )
              })}
            </ul>
          ) : hasSearched && !error ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No apps found.
            </p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
