import { IconExternalLink } from "@tabler/icons-react"
import { APP_WEBSITE } from "@/constants/app-info"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type AboutCardProps = {
  appVersion: string | null
  versionError: string | null
}

export function AboutCard({ appVersion, versionError }: AboutCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About Quick</CardTitle>
        <CardDescription>App information and project links.</CardDescription>
      </CardHeader>
      <CardContent className="gap-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">App version</span>
          <span className="text-sm text-muted-foreground">
            {appVersion ?? (versionError ? "Unavailable" : "Loading…")}
          </span>
        </div>
        {versionError && (
          <p role="alert" className="text-sm text-destructive">
            Could not read the app version: {versionError}
          </p>
        )}
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">Website</span>
          <a
            href={APP_WEBSITE}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Quick on GitHub
            <IconExternalLink className="size-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
