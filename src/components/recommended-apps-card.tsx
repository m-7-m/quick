import { IconArrowRight } from "@tabler/icons-react"
import { Link } from "wouter"
import AppCard from "@/components/app-card"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BrowseCategories, type BrowseApp } from "@/constants/browse-apps"

type RecommendedAppsCardProps = {
  isWorking: boolean
  busyAppId: string | null
  onInstall: (app: BrowseApp) => void
}

const recommendedAppIds = [
  "Google.Chrome",
  "Discord.Discord",
  "Microsoft.VisualStudioCode",
  "VideoLAN.VLC",
  "7zip.7zip",
  "Valve.Steam",
  "Notion.Notion",
  "Bitwarden.Bitwarden",
]

const recommendedApps = recommendedAppIds
  .map((id) =>
    BrowseCategories.flatMap((category) => category.apps).find(
      (app) => app.id === id
    )
  )
  .filter((app): app is BrowseApp => app !== undefined)

export default function RecommendedAppsCard({
  isWorking,
  busyAppId,
  onInstall,
}: RecommendedAppsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended apps</CardTitle>
        <CardDescription>
          A few popular apps to get you started.
        </CardDescription>
        <CardAction>
          <Link
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            href="/browse"
          >
            Browse all <IconArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {recommendedApps.map((app) => (
            <AppCard
              app={app}
              isDisabled={busyAppId !== null || isWorking}
              isInstalling={busyAppId === app.id}
              key={app.id}
              onInstall={onInstall}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
