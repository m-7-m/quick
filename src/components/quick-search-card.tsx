import { IconSearch } from "@tabler/icons-react"
import type { FormEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AppsTable } from "@/components/apps-table"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import type { WingetPackage } from "@/hooks/use-winget"

type QuickSearchCardProps = {
  query: string
  onQueryChange: (query: string) => void
  onSearch: (event: FormEvent<HTMLFormElement>) => void
  onInstall: (app: WingetPackage) => void
  results: WingetPackage[]
  isSearching: boolean
  isWorking: boolean
  busyAppId: string | null
  hasSearched: boolean
  error: string | null
}

export default function QuickSearchCard({
  query,
  onQueryChange,
  onSearch,
  onInstall,
  results,
  isSearching,
  isWorking,
  busyAppId,
  hasSearched,
  error,
}: QuickSearchCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick search</CardTitle>
        <CardDescription>
          Search the WinGet catalog and install apps.
        </CardDescription>
        <form className="pt-2" onSubmit={onSearch}>
          <InputGroup>
            <InputGroupAddon>
              <IconSearch aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Search WinGet apps"
              autoComplete="off"
              disabled={isWorking}
              onChange={(event) => onQueryChange(event.currentTarget.value)}
              placeholder="Search apps…"
              type="search"
              value={query}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label="Search"
                disabled={isWorking || !query.trim()}
                type="submit"
              >
                {isSearching ? "Searching…" : "Search"}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>
      </CardHeader>
      {hasSearched && (
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              Could not search WinGet: {error}
            </p>
          ) : (
            <AppsTable
              apps={results}
              emptyMessage="No apps found."
              isLoading={isSearching}
              loadingMessage="Searching the WinGet catalog…"
              renderAction={(app) => (
                <Button
                  disabled={isWorking}
                  onClick={() => onInstall(app)}
                >
                  {busyAppId === app.id ? "Installing…" : "Install"}
                </Button>
              )}
              search=""
            />
          )}
        </CardContent>
      )}
    </Card>
  )
}
