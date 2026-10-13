import type { AppProfile } from "@/constants/profiles"

const storageKey = "quick.custom-profiles"

function isAppProfile(value: unknown): value is AppProfile {
  if (typeof value !== "object" || value === null) return false
  const profile = value as Record<string, unknown>
  return (
    typeof profile.name === "string" &&
    profile.name.trim().length > 0 &&
    Array.isArray(profile.apps) &&
    profile.apps.every((app: unknown) => {
      if (typeof app !== "object" || app === null) return false
      const appRecord = app as Record<string, unknown>
      return (
        typeof appRecord.id === "string" &&
        appRecord.id.trim().length > 0 &&
        typeof appRecord.name === "string" &&
        appRecord.name.trim().length > 0
      )
    })
  )
}

export function parseCustomProfiles(json: string): AppProfile[] {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error("Profile file is not valid JSON.")
  }

  if (!Array.isArray(parsed) || !parsed.every(isAppProfile)) {
    throw new Error("Profile file has an invalid format.")
  }

  return parsed
}

export function serializeCustomProfiles(profiles: AppProfile[]): string {
  return `${JSON.stringify(profiles, null, 2)}\n`
}

export function loadCustomProfiles(): AppProfile[] {
  const storedProfiles = localStorage.getItem(storageKey)
  if (storedProfiles === null) return []

  return parseCustomProfiles(storedProfiles)
}

export function saveCustomProfiles(profiles: AppProfile[]): void {
  localStorage.setItem(storageKey, JSON.stringify(profiles))
}
