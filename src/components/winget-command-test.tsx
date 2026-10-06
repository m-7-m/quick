import { listen } from "@tauri-apps/api/event"
import { invoke } from "@tauri-apps/api/core"
import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type Package = {
  name: string
  id: string
  version: string
  source: string | null
}

type WingetProgressEvent = {
  operation: string
  stream: string
  line: string
}

type CommandName =
  | "winget_search"
  | "winget_list_installed"
  | "winget_install"
  | "winget_uninstall"
  | "winget_upgrade"

type CommandResult = Package[] | null

const commandLabels: Record<CommandName, string> = {
  winget_search: "Search",
  winget_list_installed: "List installed",
  winget_install: "Install",
  winget_uninstall: "Uninstall",
  winget_upgrade: "Upgrade",
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export default function WingetCommandTest() {
  const [query, setQuery] = useState("7zip")
  const [packageId, setPackageId] = useState("")
  const [packages, setPackages] = useState<Package[]>([])
  const [activeCommand, setActiveCommand] = useState<CommandName | null>(null)
  const [results, setResults] = useState<Partial<Record<CommandName, string>>>(
    {}
  )
  const [progress, setProgress] = useState<string[]>([])

  useEffect(() => {
    let disposed = false
    let unlisten: (() => void) | undefined

    void listen<WingetProgressEvent>("winget-progress", (event) => {
      const { operation, stream, line } = event.payload
      setProgress((previous) =>
        [`[${operation}/${stream}] ${line}`, ...previous].slice(0, 100)
      )
    })
      .then((stopListening) => {
        if (disposed) {
          stopListening()
        } else {
          unlisten = stopListening
        }
      })
      .catch((error: unknown) => {
        setResults((previous) => ({
          ...previous,
          winget_install: `Could not subscribe to progress events: ${errorMessage(error)}`,
        }))
      })

    return () => {
      disposed = true
      unlisten?.()
    }
  }, [])

  async function runCommand(
    command: CommandName,
    args: Record<string, string> = {},
    confirmMessage?: string
  ) {
    if (confirmMessage && !window.confirm(confirmMessage)) return

    setActiveCommand(command)
    setResults((previous) => ({ ...previous, [command]: "Running…" }))

    try {
      const result = await invoke<CommandResult>(command, args)
      if (Array.isArray(result)) {
        setPackages(result)
      }
      setResults((previous) => ({
        ...previous,
        [command]: Array.isArray(result)
          ? `Succeeded — ${result.length} package(s) returned.`
          : "Succeeded.",
      }))
    } catch (error) {
      setResults((previous) => ({
        ...previous,
        [command]: `Failed: ${errorMessage(error)}`,
      }))
    } finally {
      setActiveCommand(null)
    }
  }

  const needsPackageId = !packageId.trim()
  const busy = activeCommand !== null

  return (
    <Card>
      <CardHeader>
        <CardTitle>WinGet command test</CardTitle>
        <CardDescription>
          Manually invoke each registered WinGet command and inspect its result.
          Install, uninstall, and upgrade run against the real system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="winget-search-query">Search query</Label>
            <div className="flex gap-2">
              <Input
                id="winget-search-query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Package name or ID"
              />
              <Button
                disabled={busy || !query.trim()}
                onClick={() =>
                  void runCommand("winget_search", { query: query.trim() })
                }
              >
                Search
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="winget-package-id">Package ID</Label>
            <Input
              id="winget-package-id"
              value={packageId}
              onChange={(event) => setPackageId(event.target.value)}
              placeholder="For example: Git.Git"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => void runCommand("winget_list_installed")}
          >
            Test list installed
          </Button>
          <Button
            disabled={busy || needsPackageId}
            onClick={() =>
              void runCommand(
                "winget_install",
                { id: packageId.trim() },
                `Install ${packageId.trim()} on this computer?`
              )
            }
          >
            Test install
          </Button>
          <Button
            variant="destructive"
            disabled={busy || needsPackageId}
            onClick={() =>
              void runCommand(
                "winget_uninstall",
                { id: packageId.trim() },
                `Uninstall ${packageId.trim()} from this computer?`
              )
            }
          >
            Test uninstall
          </Button>
          <Button
            variant="outline"
            disabled={busy || needsPackageId}
            onClick={() =>
              void runCommand(
                "winget_upgrade",
                { id: packageId.trim() },
                `Upgrade ${packageId.trim()} on this computer?`
              )
            }
          >
            Test upgrade
          </Button>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {(Object.entries(commandLabels) as [CommandName, string][]).map(
            ([command, label]) => (
              <p key={command} className="text-sm">
                <span className="font-medium">{label}:</span>{" "}
                {results[command] ?? "Not run"}
              </p>
            )
          )}
        </div>

        {packages.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">Packages</h3>
            <ul className="max-h-64 divide-y overflow-y-auto rounded-md border">
              {packages.map((pkg) => (
                <li
                  key={`${pkg.id}-${pkg.version}`}
                  className="flex items-center justify-between gap-4 p-3 text-sm"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {pkg.name}
                    </span>
                    <span className="block truncate text-muted-foreground">
                      {pkg.id} · {pkg.version}
                      {pkg.source ? ` · ${pkg.source}` : ""}
                    </span>
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPackageId(pkg.id)}
                  >
                    Use ID
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {progress.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="font-medium">Command output / progress</h3>
            <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap">
              {progress.join("\n")}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
