import { useState } from "react"
import { toast } from "sonner"
import AppCard from "./app-card"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { BrowseCategories, type BrowseApp } from "@/constants/browse-apps"
import { useWinget } from "@/hooks/use-winget"

export default function BrowseCard() {
  const [busyAppId, setBusyAppId] = useState<string | null>(null)
  const { install } = useWinget()

  async function installApp(app: BrowseApp) {
    setBusyAppId(app.id)
    try {
      await install(app.id)
      toast.success(`${app.name} installed successfully.`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      toast.error(`Could not install ${app.name}: ${message}`)
    } finally {
      setBusyAppId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {BrowseCategories.map((category) => (
        <Card key={category.name}>
          <CardHeader>
            <CardTitle>{category.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {category.apps.map((app) => (
                <AppCard
                  app={app}
                  isDisabled={busyAppId !== null}
                  isInstalling={busyAppId === app.id}
                  key={app.id}
                  onInstall={installApp}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
