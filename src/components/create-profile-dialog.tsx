import { useState, type ReactElement, type FormEvent } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

type CreateProfileDialogProps = {
  disabled: boolean
  onCreate: (name: string) => boolean
  trigger: ReactElement
}

export default function CreateProfileDialog({
  disabled,
  onCreate,
  trigger,
}: CreateProfileDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [nameError, setNameError] = useState<string | null>(null)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const profileName = name.trim()
    if (!profileName) {
      setNameError("Enter a profile name.")
      return
    }

    if (onCreate(profileName)) {
      setName("")
      setNameError(null)
      setOpen(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setNameError(null)
      }}
    >
      <DialogTrigger disabled={disabled} render={trigger} />
      <DialogContent>
        <form className="flex flex-col gap-6" onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Create a profile</DialogTitle>
            <DialogDescription>
              Choose a name, then add the apps you want in this profile.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-name">Profile name</Label>
            <Input
              autoFocus
              aria-invalid={nameError !== null}
              id="profile-name"
              onChange={(event) => {
                setName(event.currentTarget.value)
                setNameError(null)
              }}
              placeholder="e.g. Work setup"
              value={name}
            />
            {nameError && (
              <p className="text-sm text-destructive" role="alert">
                {nameError}
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Create profile</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
