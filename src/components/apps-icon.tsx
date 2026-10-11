import { AppIcon } from "@/components/app-icon"

type AppsIconProps = {
  appName: string
}

export function AppsIcon({ appName }: AppsIconProps) {
  return <AppIcon appName={appName} className="size-5" />
}
