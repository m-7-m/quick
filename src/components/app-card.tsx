import { AppIcon } from "@/components/app-icon"
import type { BrowseApp } from "@/constants/browse-apps"
import { Button } from "./ui/button"
import {
  Card,
  CardAction,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card"
import { IconCloudDownload, IconLoader } from "@tabler/icons-react"

type AppCardProps = {
  app: BrowseApp
  isInstalling: boolean
  isDisabled: boolean
  onInstall: (app: BrowseApp) => void
}

export default function AppCard({
  app,
  isInstalling,
  isDisabled,
  onInstall,
}: AppCardProps) {
  return (
    <Card size="sm">
      <CardHeader className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <AppIcon appName={app.name} />
          <div>
            <CardTitle className="mt-2 truncate">{app.name}</CardTitle>
            <CardDescription className="max-w-30 truncate text-xs">
              {app.id}
            </CardDescription>
          </div>
        </div>
        <CardAction className="self-center">
          <Button
            disabled={isDisabled}
            onClick={() => onInstall(app)}
            size="icon"
          >
            {isInstalling ? (
              <IconLoader className="animate-spin" />
            ) : (
              <IconCloudDownload />
            )}
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  )
}
