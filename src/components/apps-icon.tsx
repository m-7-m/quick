import { useEffect, useState } from "react"
import { IconPackage } from "@tabler/icons-react"

type AppsIconProps = {
  appName: string
}

type FaviconStatus = {
  url: string
  available: boolean
}

export function AppsIcon({ appName }: AppsIconProps) {
  const [faviconStatus, setFaviconStatus] = useState<FaviconStatus | null>(null)
  const name = appName.trim()
  const faviconUrl = name
    ? `https://www.faviconapi.com/${encodeURIComponent(name)}`
    : undefined

  useEffect(() => {
    if (!faviconUrl) return

    const controller = new AbortController()
    fetch(faviconUrl, { signal: controller.signal })
      .then((response) => {
        setFaviconStatus({ url: faviconUrl, available: response.ok })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setFaviconStatus({ url: faviconUrl, available: false })
      })

    return () => controller.abort()
  }, [faviconUrl])

  const faviconAvailable =
    faviconUrl && faviconStatus?.url === faviconUrl && faviconStatus.available

  return (
    <div className="flex size-5 items-center justify-center overflow-hidden rounded-md">
      {faviconAvailable ? (
        <img
          alt=""
          className="size-full rounded-md object-contain"
          onError={() =>
            setFaviconStatus({ url: faviconUrl, available: false })
          }
          src={faviconUrl}
        />
      ) : (
        <IconPackage aria-hidden="true" className="size-5" />
      )}
    </div>
  )
}
