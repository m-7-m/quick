import { Command } from "@tauri-apps/plugin-shell"

const setupCommands = [
  ["ensure-winget", "Bootstrapping WinGet"],
  ["install-pwsh", "Installing or updating PowerShell 7"],
  ["ensure-pwsh-module", "Updating the WinGet PowerShell module"],
] as const

export async function setupTooling() {
  for (const [commandName, description] of setupCommands) {
    const result = await Command.create(commandName).execute()

    if (result.code !== 0) {
      throw new Error(
        `${description} failed: ${result.stderr || result.stdout || `exit code ${result.code}`}`
      )
    }

    console.info(description, result.stdout)
  }
}
