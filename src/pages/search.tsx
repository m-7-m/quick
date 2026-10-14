import { useState, type FormEvent } from "react"
import { IconSearch } from "@tabler/icons-react"
import { toast } from "sonner"
import { AppsTable } from "@/components/apps-table"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useWinget, type WingetPackage } from "@/hooks/use-winget"

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [apps, setApps] = useState<WingetPackage[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busyAppId, setBusyAppId] = useState<string | null>(null)
  const { install, searchApps } = useWinget()

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const searchQuery = query.trim()
    if (!searchQuery) {
      setApps([])
      setHasSearched(false)
      setLoadError(null)
      return
    }

    setIsSearching(true)
    setHasSearched(true)
    setLoadError(null)
    try {
      setApps(await searchApps(searchQuery))
    } catch (error: unknown) {
      setApps([])
      setLoadError(errorMessage(error))
    } finally {
      setIsSearching(false)
    }
  }

  async function installApp(app: WingetPackage) {
    setBusyAppId(app.id)
    try {
      await install(app.id, app.name)
      toast.success(`${app.name} installed successfully.`)
    } catch (error: unknown) {
      toast.error(`Could not install ${app.name}: ${errorMessage(error)}`)
    } finally {
      setBusyAppId(null)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <Header title="Search & Install" desc="Find and install new apps" />
      <Card>
        <CardHeader>
          <CardTitle>Find apps</CardTitle>
          <CardDescription>
            {hasSearched && !isSearching
              ? `${apps.length} app${apps.length === 1 ? "" : "s"} found`
              : "Find and install apps."}
          </CardDescription>
          <form className="pt-2" onSubmit={handleSearch}>
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
                <InputGroupButton
                  aria-label="Search"
                  disabled={isSearching || !query.trim()}
                  type="submit"
                >
                  {isSearching ? "Searching…" : "Search"}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </form>
        </CardHeader>
        <CardContent>
          <AppsTable
            apps={apps}
            emptyMessage={
              hasSearched ? "No apps found." : "Search for apps to see results."
            }
            isLoading={isSearching}
            loadError={loadError}
            loadErrorEmptyMessage="Search results could not be loaded."
            loadErrorMessage="Could not search WinGet"
            loadingMessage="Searching the WinGet catalog…"
            renderAction={(app) => (
              <Button
                disabled={busyAppId !== null}
                onClick={() => installApp(app)}
              >
                {busyAppId === app.id ? "Installing…" : "Install"}
              </Button>
            )}
            search=""
          />
        </CardContent>
      </Card>
    </div>
  )
}
