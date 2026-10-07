import type { ReactNode } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type AppTableItem = {
  id: string
  name: string
  version: string
}

type AppsTableProps<T extends AppTableItem> = {
  apps: T[]
  search: string
  isLoading?: boolean
  loadError?: string | null
  loadErrorMessage?: string
  loadErrorEmptyMessage?: string
  loadingMessage?: string
  selectedIds?: ReadonlySet<string>
  onAppSelectionChange?: (
    id: string,
    checked: boolean | "indeterminate"
  ) => void
  onSelectAllChange?: (
    checked: boolean | "indeterminate",
    appIds: string[]
  ) => void
  renderAction?: (app: T) => ReactNode
  renderVersion?: (app: T) => ReactNode
  emptyMessage?: string
}

export function AppsTable<T extends AppTableItem>({
  apps,
  search,
  isLoading = false,
  loadError = null,
  loadErrorMessage = "Could not load apps",
  loadErrorEmptyMessage = "Apps could not be loaded.",
  loadingMessage = "Loading apps…",
  selectedIds,
  onAppSelectionChange,
  onSelectAllChange,
  renderAction,
  renderVersion,
  emptyMessage = "No apps found.",
}: AppsTableProps<T>) {
  const normalizedSearch = search.trim().toLowerCase()
  const filteredApps = apps
    .map((app, index) => ({ app, key: `${app.id}:${index}` }))
    .filter(
      ({ app }) =>
        !normalizedSearch || app.name.toLowerCase().includes(normalizedSearch)
    )
  const appIds = apps.map((app) => app.id)
  const hasSelection = selectedIds !== undefined && onAppSelectionChange
  const allRowsSelected =
    appIds.length > 0 && appIds.every((id) => selectedIds?.has(id))
  const someRowsSelected =
    appIds.some((id) => selectedIds?.has(id)) && !allRowsSelected

  return (
    <>
      {loadError && (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {loadErrorMessage}: {loadError}
        </p>
      )}
      <Table>
        <TableHeader>
          <TableRow data-state="header">
            {hasSelection && (
              <TableHead scope="col" className="w-12">
                <Checkbox
                  aria-label="Select all apps"
                  checked={allRowsSelected}
                  indeterminate={someRowsSelected}
                  disabled={isLoading || appIds.length === 0}
                  onCheckedChange={(checked) =>
                    onSelectAllChange?.(checked, appIds)
                  }
                />
              </TableHead>
            )}
            <TableHead scope="col">Name</TableHead>
            <TableHead scope="col">Version</TableHead>
            {renderAction && (
              <TableHead scope="col" className="text-right">
                Action
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={2 + (hasSelection ? 1 : 0) + (renderAction ? 1 : 0)}
                className="py-8 text-center text-muted-foreground"
              >
                {loadingMessage}
              </TableCell>
            </TableRow>
          ) : filteredApps.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={2 + (hasSelection ? 1 : 0) + (renderAction ? 1 : 0)}
                className="py-8 text-center text-muted-foreground"
              >
                {loadError
                  ? loadErrorEmptyMessage
                  : apps.length === 0
                    ? emptyMessage
                    : "No apps match your search."}
              </TableCell>
            </TableRow>
          ) : (
            filteredApps.map(({ app, key }) => (
              <TableRow key={key}>
                {hasSelection && (
                  <TableCell>
                    <Checkbox
                      aria-label={`Select ${app.name}`}
                      checked={selectedIds.has(app.id)}
                      onCheckedChange={(checked) =>
                        onAppSelectionChange(app.id, checked)
                      }
                    />
                  </TableCell>
                )}
                <TableCell className="font-medium">{app.name}</TableCell>
                <TableCell>
                  {renderVersion ? renderVersion(app) : app.version}
                </TableCell>
                {renderAction && (
                  <TableCell className="text-right">
                    {renderAction(app)}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  )
}
