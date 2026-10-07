import { IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type UninstallAlertProps = {
  appName: string
  disabled: boolean
  isLoading: boolean
  onConfirm: () => Promise<void>
}

export function UninstallAlert({
  appName,
  disabled,
  isLoading,
  onConfirm,
}: UninstallAlertProps) {
  const [open, setOpen] = useState(false)

  async function confirmUninstall() {
    await onConfirm()
    setOpen(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="destructive" size="sm" disabled={disabled}>
            <IconTrash />
            {isLoading ? "Removing…" : "Uninstall"}
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Uninstall {appName}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove {appName} from your device.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isLoading}
            onClick={() => void confirmUninstall()}
          >
            {isLoading ? "Removing…" : "Uninstall"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
