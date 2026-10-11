import { useEffect, useState } from "react"
import { IconPackage } from "@tabler/icons-react"

type AppIconProps = {
  appName: string
  className?: string
}

type IconStatus = {
  url: string
  available: boolean
}

export function AppIcon({ appName, className = "size-10" }: AppIconProps) {
  const [iconStatus, setIconStatus] = useState<IconStatus | null>(null)
  const name = appName.trim()
  const iconUrl = name
    ? `https://www.faviconapi.com/${encodeURIComponent(name)}`
    : undefined

  useEffect(() => {
    if (!iconUrl) return

    const controller = new AbortController()
    fetch(iconUrl, { signal: controller.signal })
      .then((response) => {
        setIconStatus({ url: iconUrl, available: response.ok })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setIconStatus({ url: iconUrl, available: false })
      })

    return () => controller.abort()
  }, [iconUrl])

  const iconAvailable =
    iconUrl && iconStatus?.url === iconUrl && iconStatus.available

  return (
    <div
      aria-hidden="true"
      className={`flex ${className} shrink-0 items-center justify-center overflow-hidden rounded-md`}
    >
      {iconAvailable ? (
        <img
          alt=""
          className="size-full rounded-md object-contain"
          onError={() => setIconStatus({ url: iconUrl, available: false })}
          src={iconUrl}
        />
      ) : (
        <IconPackage className="size-full" />
      )}
    </div>
  )
}
