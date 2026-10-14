import { invoke } from "@tauri-apps/api/core"
import { useEffect, useState, type FormEvent } from "react"
import { Link } from "wouter"
import { toast } from "sonner"
import AvailableUpdatesStatCard from "@/components/available-updates-stat-card"
import Header from "@/components/header"
import HomeUpdatesCard from "@/components/home-updates-card"
import InstalledAppsStatCard from "@/components/installed-apps-stat-card"
import QuickSearchCard from "@/components/quick-search-card"
import RecommendedAppsCard from "@/components/recommended-apps-card"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HomeCards } from "@/constants/home-cards"
import { useWinget, type WingetPackage } from "@/hooks/use-winget"
import { cn } from "cn"

type AvailableUpdate = {
  id: string
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export default function HomePage() {
  const [updates, setUpdates] = useState<AvailableUpdate[]>([])
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(true)
  const [updatesError, setUpdatesError] = useState<string | null>(null)
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<WingetPackage[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [busyAppId, setBusyAppId] = useState<string | null>(null)
  const { searchApps, install, updateAll, isLoading: isWorking } = useWinget()

  useEffect(() => {
    let disposed = false

    void invoke<AvailableUpdate[]>("winget_list_available_updates")
      .then((availableUpdates) => {
        if (!disposed) {
          setUpdates(availableUpdates)
          setUpdatesError(null)
        }
      })
      .catch((error: unknown) => {
        if (!disposed) setUpdatesError(errorMessage(error))
      })
      .finally(() => {
        if (!disposed) setIsLoadingUpdates(false)
      })

    return () => {
      disposed = true
    }
  }, [refreshVersion])

  async function searchForApps(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const searchQuery = query.trim()
    if (!searchQuery) return

    setHasSearched(true)
    setIsSearching(true)
    setSearchError(null)
    try {
      setSearchResults(await searchApps(searchQuery))
    } catch (error: unknown) {
      setSearchResults([])
      setSearchError(errorMessage(error))
    } finally {
      setIsSearching(false)
    }
  }

  async function installApp(app: { id: string; name: string }) {
    setBusyAppId(app.id)
    try {
      await install(app.id, app.name)
      toast.success(`${app.name} installed successfully.`)
      setSearchResults((results) =>
        results.filter((result) => result.id !== app.id)
      )
    } catch (error: unknown) {
      toast.error(`Could not install ${app.name}: ${errorMessage(error)}`)
    } finally {
      setBusyAppId(null)
    }
  }

  async function updateAllAvailableApps() {
    try {
      await updateAll()
      toast.success("All available updates installed successfully.")
      setIsLoadingUpdates(true)
      setRefreshVersion((version) => version + 1)
    } catch (error: unknown) {
      toast.error(`Could not update all apps: ${errorMessage(error)}`)
    }
  }

  function checkForUpdates() {
    setIsLoadingUpdates(true)
    setUpdatesError(null)
    setRefreshVersion((version) => version + 1)
  }

  return (
    <div className="flex flex-col gap-8">
      <Header
        title="Home"
        desc="Manage your apps install, update, remove and use profiles."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AvailableUpdatesStatCard />
        <InstalledAppsStatCard />
      </div>
      <HomeUpdatesCard
        error={updatesError}
        isLoading={isLoadingUpdates}
        isWorking={isWorking}
        onCheck={checkForUpdates}
        onUpdateAll={updateAllAvailableApps}
        updateCount={updates.length}
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {HomeCards.map((card) => (
          <Link href={card.href} key={card.title}>
            <Card
              className={cn(
                card.outline,
                "relative overflow-hidden transition-all hover:outline-2 hover:outline-offset-6"
              )}
            >
              <div
                className={cn(
                  card.background,
                  "absolute -top-12/12 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full blur-3xl"
                )}
              ></div>
              <div
                className={cn(
                  card.background,
                  "absolute -bottom-12/12 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full blur-3xl"
                )}
              ></div>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.desc}</CardDescription>
                <CardAction>
                  <card.icon
                    className={cn(card.iconClass, "size-10 rounded-lg p-2")}
                  />
                </CardAction>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
      <QuickSearchCard
        busyAppId={busyAppId}
        error={searchError}
        hasSearched={hasSearched}
        isSearching={isSearching}
        isWorking={isWorking}
        onInstall={installApp}
        onQueryChange={setQuery}
        onSearch={searchForApps}
        query={query}
        results={searchResults}
      />
      <RecommendedAppsCard
        busyAppId={busyAppId}
        isWorking={isWorking}
        onInstall={installApp}
      />
    </div>
  )
}
