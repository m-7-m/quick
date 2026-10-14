import {
  IconChevronDown,
  IconDownload,
  IconTrash,
} from "@tabler/icons-react"
import { AppIcon } from "@/components/app-icon"
import AddProfileAppsDialog from "@/components/add-profile-apps-dialog"
import DeleteProfileDialog from "@/components/delete-profile-dialog"
import type { AppProfile } from "@/constants/profiles"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type ProfileCardProps = {
  profile: AppProfile
  selectedAppIds: Set<string>
  isDisabled: boolean
  isCustom: boolean
  isInstalling: boolean
  installProgress: { current: number; total: number } | null
  onAddApps: (apps: AppProfile["apps"]) => void
  onDelete: () => void
  onRemoveApp: (appId: string) => void
  onToggleApp: (appId: string, checked: boolean) => void
  onInstall: () => void
}

export default function ProfileCard({
  profile,
  selectedAppIds,
  isDisabled,
  isCustom,
  isInstalling,
  installProgress,
  onAddApps,
  onDelete,
  onRemoveApp,
  onToggleApp,
  onInstall,
}: ProfileCardProps) {
  return (
    <Collapsible defaultOpen>
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center gap-4">
          <CollapsibleTrigger className="group flex min-w-0 flex-1 items-center justify-between gap-4 text-left">
            <div className="flex flex-col gap-1">
              <CardTitle>{profile.name}</CardTitle>
              <CardDescription>
                {selectedAppIds.size} of {profile.apps.length} apps selected
              </CardDescription>
            </div>
            <IconChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform group-data-panel-open:rotate-180"
            />
          </CollapsibleTrigger>
          {isCustom && (
            <>
              <AddProfileAppsDialog
                disabled={isDisabled}
                existingApps={profile.apps}
                onAddApps={onAddApps}
              />
              <DeleteProfileDialog
                disabled={isDisabled}
                profileName={profile.name}
                onDelete={onDelete}
              />
            </>
          )}
          <Button
            className="ml-auto"
            disabled={isDisabled || selectedAppIds.size === 0}
            onClick={onInstall}
          >
            <IconDownload aria-hidden="true" />
            {isInstalling && installProgress
              ? `Installing ${installProgress.current}/${installProgress.total}…`
              : "Install selected"}
          </Button>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="grid gap-3 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.apps.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No apps in this profile yet. Add apps to get started.
              </p>
            ) : (
              profile.apps.map((app) => (
                <div
                  className="flex min-w-0 cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted/50"
                  key={app.id}
                >
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                    <Checkbox
                      checked={selectedAppIds.has(app.id)}
                      disabled={isDisabled}
                      onCheckedChange={(checked) =>
                        onToggleApp(app.id, checked === true)
                      }
                    />
                    <AppIcon appId={app.id} appName={app.name} className="size-6" />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">
                        {app.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {app.id}
                      </span>
                    </span>
                  </label>
                  {isCustom && (
                    <Button
                      aria-label={`Remove ${app.name} from profile`}
                      disabled={isDisabled}
                      onClick={() => onRemoveApp(app.id)}
                      size="icon"
                      type="button"
                      variant="destructive"
                    >
                      <IconTrash aria-hidden="true" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
