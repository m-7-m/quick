import { Command } from "@tauri-apps/plugin-shell"

const packageIdPattern = /^[A-Za-z0-9._+-]+$/

type WingetCommand =
  | "winget-install"
  | "winget-upgrade"
  | "winget-upgrade-all"
  | "winget-uninstall"

function assertPackageId(id: string) {
  if (!packageIdPattern.test(id)) {
    throw new Error(
      "App ID may contain only letters, numbers, dots, underscores, and hyphens."
    )
  }
}

async function executeWinget(command: WingetCommand, args: string[]) {
  const result = await Command.create(command, args).execute()

  if (result.code !== 0) {
    throw new Error(
      result.stderr.trim() ||
        result.stdout.trim() ||
        `WinGet command failed with exit code ${result.code ?? "unknown"}.`
    )
  }

  return result
}

export function installApp(id: string) {
  assertPackageId(id)
  return executeWinget("winget-install", [
    "install",
    "--id",
    id,
    "--exact",
    "--accept-package-agreements",
    "--accept-source-agreements",
  ])
}

export function updateApp(id: string) {
  assertPackageId(id)
  return executeWinget("winget-upgrade", [
    "upgrade",
    "--id",
    id,
    "--exact",
    "--accept-package-agreements",
    "--accept-source-agreements",
  ])
}

export function updateAllApps() {
  return executeWinget("winget-upgrade-all", [
    "upgrade",
    "--all",
    "--accept-package-agreements",
    "--accept-source-agreements",
  ])
}

export function removeApp(id: string) {
  assertPackageId(id)
  return executeWinget("winget-uninstall", ["uninstall", "--id", id, "--exact"])
}
