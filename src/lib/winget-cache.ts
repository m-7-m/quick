import { invoke } from "@tauri-apps/api/core"

export type InstalledApp = {
  name: string
  id: string
  version: string
  source: string | null
}

export type AvailableUpdate = {
  name: string
  id: string
  current_version: string
  available_version: string
  source: string | null
}

let installedAppsCache: InstalledApp[] | undefined
let installedAppsRequest: Promise<InstalledApp[]> | undefined
let installedAppsGeneration = 0

let availableUpdatesCache: AvailableUpdate[] | undefined
let availableUpdatesRequest: Promise<AvailableUpdate[]> | undefined
let availableUpdatesGeneration = 0

export function getCachedInstalledApps() {
  return installedAppsCache
}

export function loadInstalledApps(force = false) {
  if (!force && installedAppsCache !== undefined) {
    return Promise.resolve(installedAppsCache)
  }
  if (!force && installedAppsRequest) return installedAppsRequest

  const generation = ++installedAppsGeneration
  const request = invoke<InstalledApp[]>("winget_list_installed")
    .then((apps) => {
      if (generation === installedAppsGeneration) installedAppsCache = apps
      return apps
    })
    .finally(() => {
      if (generation === installedAppsGeneration) installedAppsRequest = undefined
    })
  installedAppsRequest = request
  return request
}

export function setCachedInstalledApps(apps: InstalledApp[]) {
  installedAppsGeneration++
  installedAppsRequest = undefined
  installedAppsCache = apps
}

export function invalidateInstalledAppsCache() {
  installedAppsGeneration++
  installedAppsRequest = undefined
  installedAppsCache = undefined
}

export function getCachedAvailableUpdates() {
  return availableUpdatesCache
}

export function loadAvailableUpdates(force = false) {
  if (!force && availableUpdatesCache !== undefined) {
    return Promise.resolve(availableUpdatesCache)
  }
  if (!force && availableUpdatesRequest) return availableUpdatesRequest

  const generation = ++availableUpdatesGeneration
  const request = invoke<AvailableUpdate[]>("winget_list_available_updates")
    .then((updates) => {
      if (generation === availableUpdatesGeneration) {
        availableUpdatesCache = updates
      }
      return updates
    })
    .finally(() => {
      if (generation === availableUpdatesGeneration) {
        availableUpdatesRequest = undefined
      }
    })
  availableUpdatesRequest = request
  return request
}

export function invalidateAvailableUpdatesCache() {
  availableUpdatesGeneration++
  availableUpdatesRequest = undefined
  availableUpdatesCache = undefined
}
