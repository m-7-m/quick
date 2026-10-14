import { IconRefresh } from "@tabler/icons-react"
import { Button } from "./ui/button"
import { SidebarTrigger } from "./ui/sidebar"

export default function Header({
  title,
  desc,
}: {
  title: string
  desc: string
}) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <IconRefresh />
          <span>Refresh</span>
        </Button>
        <SidebarTrigger className="flex" variant="outline" size="icon" />
      </div>
    </div>
  )
}
