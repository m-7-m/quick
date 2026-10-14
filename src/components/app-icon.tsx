import { useEffect, useState } from "react"
import { IconPackage } from "@tabler/icons-react"

type AppIconProps = {
  appName: string
  appId?: string
  className?: string
}

type IconStatus = {
  appKey: string
  url: string
  source: "catalog" | "faviconapi"
  available: boolean
}

type IconCatalog = Map<string, string>

let iconCatalogRequest: Promise<IconCatalog> | undefined

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

function loadIconCatalog() {
  if (!iconCatalogRequest) {
    iconCatalogRequest = fetch("/icons.json")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Could not load icon catalog: ${response.status}`)
        }

        const payload: unknown = await response.json()
        if (!isRecord(payload) || !isRecord(payload.icons_and_screenshots)) {
          throw new Error("The icon catalog has an invalid format")
        }

        const catalog: IconCatalog = new Map()
        for (const [key, entry] of Object.entries(
          payload.icons_and_screenshots
        )) {
          if (isRecord(entry) && typeof entry.icon === "string" && entry.icon) {
            catalog.set(normalizeKey(key), entry.icon)
          }
        }
        return catalog
      })
      .catch((error: unknown) => {
        iconCatalogRequest = undefined
        throw error
      })
  }

  return iconCatalogRequest
}

function findCatalogIcon(
  catalog: IconCatalog,
  appId: string,
  appName: string
) {
  const packageName = appId.split(".").slice(1).join(".")
  const candidates = [appId, packageName, appName]

  for (const candidate of candidates) {
    const icon = catalog.get(normalizeKey(candidate))
    if (icon) return icon
  }
}

export function AppIcon({
  appName,
  appId = "",
  className = "size-10",
}: AppIconProps) {
  const [iconStatus, setIconStatus] = useState<IconStatus | null>(null)
  const name = appName.trim()
  const fallbackIconUrl = name
    ? `https://www.faviconapi.com/WzEsImRhc2hib2FyZGljb25zIixbInN2Z2wiLCJ0aGVzdmciLCJzZWxmaHN0IiwiZ29vZ2xldjIiXSwxMjhd/${encodeURIComponent(name)}`
    : undefined
  const appKey = `${appId}:${name}`
  const [fallbackForKey, setFallbackForKey] = useState<string | null>(null)

  useEffect(() => {
    if (!fallbackIconUrl) return

    const controller = new AbortController()
    const loadFallbackIcon = async () => {
      try {
        const response = await fetch(fallbackIconUrl, {
          signal: controller.signal,
        })
        if (!controller.signal.aborted) {
          setIconStatus({
            appKey,
            url: fallbackIconUrl,
            source: "faviconapi",
            available: response.ok,
          })
        }
      } catch (error: unknown) {
        if (controller.signal.aborted) return
        console.warn("Could not load fallback app icon from faviconapi", error)
        setIconStatus({
          appKey,
          url: fallbackIconUrl,
          source: "faviconapi",
          available: false,
        })
      }
    }

    const resolveIcon = async () => {
      if (fallbackForKey === appKey) {
        await loadFallbackIcon()
        return
      }

      try {
        const catalog = await loadIconCatalog()
        const catalogIcon = findCatalogIcon(catalog, appId, name)
        if (catalogIcon) {
          if (!controller.signal.aborted) {
            setIconStatus({
              appKey,
              url: catalogIcon,
              source: "catalog",
              available: true,
            })
          }
          return
        }
      } catch (error: unknown) {
        if (controller.signal.aborted) return
        console.error("Could not read app icons from /icons.json", error)
      }

      await loadFallbackIcon()
    }

    void resolveIcon()

    return () => controller.abort()
  }, [appId, appKey, fallbackForKey, fallbackIconUrl, name])

  const iconAvailable =
    iconStatus?.available &&
    iconStatus.appKey === appKey

  return (
    <div
      aria-hidden="true"
      className={`flex ${className} shrink-0 items-center justify-center overflow-hidden rounded-md`}
    >
      {iconAvailable ? (
        <img
          alt=""
          className="size-full rounded-md object-contain"
          onError={() => {
            if (iconStatus.source === "catalog") {
              setFallbackForKey(appKey)
            } else {
              setIconStatus({ ...iconStatus, available: false })
            }
          }}
          src={iconStatus.url}
        />
      ) : (
        <IconPackage className="size-full" />
      )}
    </div>
  )
}
