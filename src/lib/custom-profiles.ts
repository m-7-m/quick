import type { AppProfile } from "@/constants/profiles"

const storageKey = "quick.custom-profiles"

function isAppProfile(value: unknown): value is AppProfile {
  if (typeof value !== "object" || value === null) return false
  const profile = value as Record<string, unknown>
  return (
    typeof profile.name === "string" &&
    profile.name.trim().length > 0 &&
    Array.isArray(profile.apps) &&
    profile.apps.every(
      (app: unknown) =>
        typeof app === "object" &&
        app !== null &&
        typeof (app as Record<string, unknown>).id === "string" &&
        typeof (app as Record<string, unknown>).name === "string"
    )
  )
}

export function loadCustomProfiles(): AppProfile[] {
  const storedProfiles = localStorage.getItem(storageKey)
  if (storedProfiles === null) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(storedProfiles)
  } catch {
    throw new Error("Saved profile data is not valid JSON.")
  }

  if (!Array.isArray(parsed) || !parsed.every(isAppProfile)) {
    throw new Error("Saved profile data has an invalid format.")
  }

  return parsed
}

export function saveCustomProfiles(profiles: AppProfile[]): void {
  localStorage.setItem(storageKey, JSON.stringify(profiles))
}
