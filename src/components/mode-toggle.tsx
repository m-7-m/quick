import type { ReactElement, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"
import { IconMoon, IconSun } from "@tabler/icons-react"

type ModeToggleProps = {
  renderTrigger?: (children: ReactNode) => ReactElement
}

export function ModeToggle({ renderTrigger }: ModeToggleProps) {
  const { setTheme } = useTheme()

  const triggerContent = (
    <>
      <IconSun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <IconMoon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          renderTrigger ? (
            renderTrigger(triggerContent)
          ) : (
            <Button variant="ghost" size="icon-sm" className="relative">
              {triggerContent}
            </Button>
          )
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
