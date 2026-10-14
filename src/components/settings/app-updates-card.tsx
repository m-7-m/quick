import { useState } from "react"
import {
  IconCheck,
  IconExternalLink,
  IconLoader2,
  IconRefresh,
} from "@tabler/icons-react"
import { APP_WEBSITE, LATEST_RELEASE_API } from "@/constants/app-info"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type AppUpdatesCardProps = {
  appVersion: string | null
}

type UpdateStatus =
  | { type: "idle" }
  | { type: "checking" }
  | { type: "up-to-date" }
  | { type: "available"; version: string }
  | { type: "error"; message: string }

type GitHubRelease = {
  tag_name: string
}

function isGitHubRelease(value: unknown): value is GitHubRelease {
  return (
    typeof value === "object" &&
    value !== null &&
    "tag_name" in value &&
    typeof value.tag_name === "string"
  )
}

function compareVersions(current: string, latest: string): number | null {
  const versionPattern =
    /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/
  const currentMatch = current.match(versionPattern)
  const latestMatch = latest.match(versionPattern)

  if (!currentMatch || !latestMatch) {
    return null
  }

  for (let index = 1; index <= 3; index += 1) {
    const difference = Number(currentMatch[index]) - Number(latestMatch[index])
    if (difference !== 0) {
      return Math.sign(difference)
    }
  }

  const currentIsPrerelease = currentMatch[4] !== undefined
  const latestIsPrerelease = latestMatch[4] !== undefined
  if (currentIsPrerelease !== latestIsPrerelease) {
    return currentIsPrerelease ? -1 : 1
  }

  return 0
}

export function AppUpdatesCard({ appVersion }: AppUpdatesCardProps) {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({
    type: "idle",
  })

  async function checkForAppUpdate() {
    if (!appVersion) {
      return
    }

    setUpdateStatus({ type: "checking" })
    try {
      const response = await fetch(LATEST_RELEASE_API, {
        headers: { Accept: "application/vnd.github+json" },
      })

      if (response.status === 404) {
        throw new Error("No published app release was found.")
      }
      if (!response.ok) {
        throw new Error(`GitHub returned an error (${response.status}).`)
      }

      const release: unknown = await response.json()
      if (!isGitHubRelease(release)) {
        throw new Error("GitHub returned an invalid release response.")
      }

      const latestVersion = release.tag_name.replace(/^v/, "")
      const comparison = compareVersions(appVersion, latestVersion)
      if (comparison === null) {
        throw new Error(
          "Could not compare the app version with the latest release."
        )
      }

      setUpdateStatus(
        comparison < 0
          ? { type: "available", version: latestVersion }
          : { type: "up-to-date" }
      )
    } catch (error: unknown) {
      setUpdateStatus({
        type: "error",
        message: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>App updates</CardTitle>
        <CardDescription>
          Check whether you have the latest version of Quick.
        </CardDescription>
      </CardHeader>
      <CardContent className="gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-h-8 items-center">
            {updateStatus.type === "checking" && (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <IconLoader2 className="size-4 animate-spin" />
                Checking for updates…
              </span>
            )}
            {updateStatus.type === "up-to-date" && (
              <Badge variant="secondary">
                <IconCheck />
                You're up to date
              </Badge>
            )}
            {updateStatus.type === "available" && (
              <span className="text-sm text-muted-foreground">
                Version {updateStatus.version} is available.
              </span>
            )}
            {updateStatus.type === "error" && (
              <span role="alert" className="text-sm text-destructive">
                {updateStatus.message}
              </span>
            )}
            {updateStatus.type === "idle" && (
              <span className="text-sm text-muted-foreground">
                Current version: {appVersion ?? "Unavailable"}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            onClick={checkForAppUpdate}
            disabled={!appVersion || updateStatus.type === "checking"}
          >
            {updateStatus.type === "checking" ? (
              <IconLoader2 className="animate-spin" />
            ) : (
              <IconRefresh />
            )}
            Check for updates
          </Button>
        </div>
        {updateStatus.type === "available" && (
          <a
            href={`${APP_WEBSITE}/releases/latest`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            View latest release
            <IconExternalLink className="size-4" />
          </a>
        )}
      </CardContent>
    </Card>
  )
}
