import { AppIcon } from "@/components/app-icon"

type AppsIconProps = {
  appName: string
  appId: string
}

export function AppsIcon({ appName, appId }: AppsIconProps) {
  return <AppIcon appId={appId} appName={appName} className="size-5" />
}
