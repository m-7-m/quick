import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function AppearanceCard() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Choose how Quick looks on this device.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Theme</span>
            <span className="text-sm text-muted-foreground">
              Choose light, dark, or follow your system setting.
            </span>
          </div>
          <ModeToggle
            renderTrigger={(children) => (
              <Button variant="outline" className="gap-2">
                <span className="relative flex size-5 items-center justify-center">
                  {children}
                </span>
                Change theme
              </Button>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
